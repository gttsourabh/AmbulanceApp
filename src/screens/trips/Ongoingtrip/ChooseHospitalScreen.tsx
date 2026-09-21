import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Keyboard,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';

import { colors, typography } from '../../../theme';
import { AppIcon } from '../../../icons';
import Header from '../../../components/Header/Header';
import Button from '../../../components/Button/Button';
import { AmbulanceMarker, medicalMapStyle } from '../../../components/Map';
import { HospitalItem } from '../../../data/hospitalsData';
import {
    fetchGoogleNearbyHospitals,
    searchGoogleHospitals,
    calculateHospitalMetrics,
} from '../../../services/hospitalSearchService';
import { updateAmbulanceStatusApi } from '../../../api';
import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermission } from '../../../utils/locationPermission';
import { LatLng } from '../../../utils/geoUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChooseHospitalScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const mapRef = useRef<MapView>(null);
    const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Trip parameters from NavigationToPickup
    const requestId = route?.params?.requestId;
    const driverId = route?.params?.driverId;
    const patientName = route?.params?.patientName || 'Emergency Patient';
    const contactNo = route?.params?.contactNo || '';
    const address = route?.params?.address || 'Pickup Location';
    const emergencyType = route?.params?.emergencyType || 'Emergency';

    const pickupLocation = useMemo(() => {
        if (route?.params?.patientLocation?.latitude && route?.params?.patientLocation?.longitude) {
            return {
                latitude: Number(route.params.patientLocation.latitude),
                longitude: Number(route.params.patientLocation.longitude),
            };
        }
        if (route?.params?.pickupLocation?.latitude && route?.params?.pickupLocation?.longitude) {
            return {
                latitude: Number(route.params.pickupLocation.latitude),
                longitude: Number(route.params.pickupLocation.longitude),
            };
        }
        if (route?.params?.pickup_lat && route?.params?.pickup_lng) {
            return {
                latitude: Number(route.params.pickup_lat),
                longitude: Number(route.params.pickup_lng),
            };
        }
        // Fallback default coordinates (Sangli)
        return {
            latitude: 16.8524,
            longitude: 74.5815,
        };
    }, [route?.params?.patientLocation, route?.params?.pickupLocation, route?.params?.pickup_lat, route?.params?.pickup_lng]);

    // Driver live location
    const [driverLiveLocation, setDriverLiveLocation] = useState<LatLng | null>(
        route?.params?.driverLocation || null
    );

    // Google API Live Hospital Data State
    const [nearbyHospitals, setNearbyHospitals] = useState<HospitalItem[]>([]);
    const [isLoadingNearby, setIsLoadingNearby] = useState(true);

    // Selected Hospital (NO hospital selected by default!)
    const [selectedHospital, setSelectedHospital] = useState<HospitalItem | null>(null);

    // Selected City Filter (e.g. 'All', 'Sangli', 'Kolhapur' when on border of two cities)
    const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');

    // Search and State (Live Google Places API Search)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<HospitalItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchDropdownTop, setSearchDropdownTop] = useState(165);
    const [isConfirming, setIsConfirming] = useState(false);
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
    const [isListExpanded, setIsListExpanded] = useState(false);

    // Load live hospitals from Google Places API on mount / pickup location (50 km border radius)
    useEffect(() => {
        let isMounted = true;
        const loadNearby = async () => {
            setIsLoadingNearby(true);
            try {
                const results = await fetchGoogleNearbyHospitals(pickupLocation, 50000);
                if (isMounted) {
                    setNearbyHospitals(results);
                }
            } catch (err) {
                console.warn('Google Places nearby hospitals error:', err);
            } finally {
                if (isMounted) {
                    setIsLoadingNearby(false);
                }
            }
        };

        loadNearby();
        return () => {
            isMounted = false;
        };
    }, [pickupLocation]);

    useEffect(() => {
        requestLocationPermission().then(granted => {
            if (!granted) return;
            // Quick cached/network position (<200ms)
            Geolocation.getCurrentPosition(
                pos => {
                    const loc: LatLng = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    };
                    setDriverLiveLocation(loc);
                },
                err => console.log('ChooseHospital cached GPS:', err?.message),
                { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
            );

            // Fresh high-accuracy GPS fix
            Geolocation.getCurrentPosition(
                pos => {
                    const loc: LatLng = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    };
                    setDriverLiveLocation(loc);
                    if (!selectedHospital) {
                        mapRef.current?.animateCamera({
                            center: loc,
                            zoom: 14,
                        });
                    }
                },
                err => console.warn('ChooseHospital high-accuracy GPS error:', err?.message),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
            );
        });
    }, [selectedHospital]);

    // Unique cities detected around this location (especially helpful on border of two cities)
    const detectedCities = useMemo(() => {
        const cityCounts: { [city: string]: number } = {};
        const sourceList = searchQuery.trim().length > 0 ? searchResults : nearbyHospitals;
        sourceList.forEach(h => {
            if (h.city) {
                cityCounts[h.city] = (cityCounts[h.city] || 0) + 1;
            }
        });
        const sortedCities = Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a]);
        return ['All', ...sortedCities];
    }, [nearbyHospitals, searchResults, searchQuery]);

    // Active displayed hospitals (Google search results, filtered by selected city if clicked)
    const displayedHospitals = useMemo(() => {
        let baseList = nearbyHospitals;
        if (searchQuery.trim().length > 0) {
            baseList = searchResults;
        }

        if (selectedCityFilter && selectedCityFilter !== 'All') {
            return baseList.filter(h => h.city?.toLowerCase() === selectedCityFilter.toLowerCase());
        }

        return baseList;
    }, [searchQuery, searchResults, nearbyHospitals, selectedCityFilter]);

    // All hospitals to plot as pins on Map (ensures selectedHospital is never hidden)
    const mapHospitals = useMemo(() => {
        if (selectedHospital && !displayedHospitals.some(h => h.id === selectedHospital.id)) {
            return [selectedHospital, ...displayedHospitals];
        }
        return displayedHospitals;
    }, [selectedHospital, displayedHospitals]);

    // Live search query change with debounce calling Google Places API
    const handleSearchTextChange = (text: string) => {
        setSearchQuery(text);

        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }

        const trimmed = text.trim();
        if (!trimmed) {
            setSearchResults([]);
            setShowSearchResults(false);
            setIsSearching(false);
            return;
        }

        setShowSearchResults(true);
        setIsSearching(true);

        searchDebounceTimer.current = setTimeout(async () => {
            try {
                const results = await searchGoogleHospitals(trimmed, pickupLocation);
                setSearchResults(results);
            } catch (err) {
                console.warn('Google Places search error:', err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 350);
    };

    const handleClearSearch = () => {
        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
        setIsSearching(false);
        Keyboard.dismiss();
    };

    // Animate map when selected hospital changes
    const selectHospital = useCallback((hospital: HospitalItem) => {
        setSelectedHospital(hospital);
        setShowSearchResults(false);
        setSearchQuery('');
        setSearchResults([]);
        Keyboard.dismiss();

        // Fit map to show both pickup location and hospital
        mapRef.current?.fitToCoordinates(
            [pickupLocation, { latitude: hospital.latitude, longitude: hospital.longitude }],
            {
                edgePadding: { top: 120, right: 60, bottom: 260, left: 60 },
                animated: true,
            }
        );
    }, [pickupLocation]);

    // Initial map frame on screen load
    useEffect(() => {
        if (!selectedHospital) {
            mapRef.current?.animateCamera({
                center: driverLiveLocation || pickupLocation,
                zoom: 14,
            });
            return;
        }
        const timer = setTimeout(() => {
            mapRef.current?.fitToCoordinates(
                [pickupLocation, { latitude: selectedHospital.latitude, longitude: selectedHospital.longitude }],
                {
                    edgePadding: { top: 100, right: 60, bottom: 260, left: 60 },
                    animated: true,
                }
            );
        }, 600);
        return () => clearTimeout(timer);
    }, [pickupLocation, selectedHospital, driverLiveLocation]);

    const handleCallHospital = (phone: string) => {
        if (!phone) {
            Alert.alert('Phone Not Available', 'No contact number available for this hospital.');
            return;
        }
        Linking.openURL(`tel:${phone}`);
    };

    const handleRecenterLocation = () => {
        mapRef.current?.animateCamera({
            center: driverLiveLocation || pickupLocation,
            zoom: 15,
        });
    };

    // Selected hospital with recalculated distance metrics
    const selectedWithDist = useMemo(() => {
        if (!selectedHospital) return null;
        const { distanceKm, etaMinutes } = calculateHospitalMetrics(pickupLocation, {
            latitude: selectedHospital.latitude,
            longitude: selectedHospital.longitude,
        });
        return {
            ...selectedHospital,
            distanceKm,
            etaMinutes,
        };
    }, [selectedHospital, pickupLocation]);

    const handleConfirmHospital = async () => {
        if (!selectedHospital || !selectedWithDist) {
            Alert.alert('Select a Hospital', 'Please select a destination hospital from the list or map to continue.');
            return;
        }
        if (isConfirming) return;
        setIsConfirming(true);

        const phDistance = selectedWithDist?.distanceKm || '0';
        console.log(`📡 [CONFIRM HOSPITAL] Updating status to arriving: request_id=${requestId}, ph_distance=${phDistance}`);

        try {
            const payload = {
                request_id: Number(requestId),
                status: 'arriving',
                drop_lat: Number(selectedHospital.latitude),
                drop_lng: Number(selectedHospital.longitude),
                drop_address: selectedHospital.address,
                ph_distance: phDistance,
            };

            console.log('📡 [POST /api/ambulance/update-status] Payload:', payload);
            const statusRes = await updateAmbulanceStatusApi(payload);
            console.log('✅ [/api/ambulance/update-status SUCCESS]:', statusRes?.data);
        } catch (statusErr: any) {
            console.warn('⚠️ [/api/ambulance/update-status FAILED]:', statusErr?.response?.data || statusErr?.message);
        } finally {
            setIsConfirming(false);
        }

        // Navigate to EnRouteScreen with chosen hospital details and autoStartTracking
        (navigation.navigate as any)('EnRoute', {
            requestId: requestId,
            driverId: driverId,
            patientName: patientName,
            contactNo: contactNo,
            address: address,
            pickupAddress: address,
            patientAddress: address,
            pickupLocation: pickupLocation,
            patientLocation: pickupLocation,
            pickup_lat: pickupLocation.latitude,
            pickup_lng: pickupLocation.longitude,
            driverLocation: driverLiveLocation || route?.params?.driverLocation || pickupLocation,
            emergencyType: emergencyType,
            // Selected Hospital details
            hospitalName: selectedHospital.name,
            hospitalAddress: selectedHospital.address,
            hospitalPhone: selectedHospital.phone,
            hospitalLocation: {
                latitude: selectedHospital.latitude,
                longitude: selectedHospital.longitude,
            },
            destinationLocation: {
                latitude: selectedHospital.latitude,
                longitude: selectedHospital.longitude,
            },
            drop_lat: selectedHospital.latitude,
            drop_lng: selectedHospital.longitude,
            destination: selectedHospital.name,
            autoStartTracking: true,
            // Trip Distance parameters (Leg 1 & Leg 2)
            np_distance: route?.params?.np_distance || route?.params?.npDistance || route?.params?.pickup_distance || '0.0 km',
            npDistance: route?.params?.np_distance || route?.params?.npDistance || route?.params?.pickup_distance || '0.0 km',
            pickup_distance: route?.params?.np_distance || route?.params?.npDistance || route?.params?.pickup_distance || '0.0 km',
            ph_distance: `${phDistance} km`,
            phDistance: `${phDistance} km`,
            initialDriverLocation: route?.params?.initialDriverLocation,
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Top Header */}
            <Header
                backEnabled
                title="Select Destination Hospital"
                showRightIcon={false}
            />

            {/* Patient Context Strip */}
            <View style={styles.contextStrip}>
                <View style={styles.contextLeft}>
                    <View style={styles.emergencyDot} />
                    <Text style={styles.contextPatientName} numberOfLines={1}>
                        {patientName}
                    </Text>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                            {emergencyType.toUpperCase()}
                        </Text>
                    </View>
                </View>
                <Text style={styles.contextHint}>
                    {isLoadingNearby ? 'Loading Google hospitals...' : `${displayedHospitals.length} hospitals found`}
                </Text>
            </View>

            {/* Floating Search Bar using Google Places API */}
            <View
                style={styles.searchBarWrapper}
                onLayout={e => {
                    const { y, height } = e.nativeEvent.layout;
                    if (y !== undefined && height !== undefined) {
                        setSearchDropdownTop(y + height + 6);
                    }
                }}
            >
                <View style={styles.searchBar}>
                    <AppIcon
                        family="material"
                        name="magnify"
                        size={20}
                        color={colors.primary}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search hospital on Google Maps..."
                        placeholderTextColor={colors.textLight}
                        value={searchQuery}
                        onChangeText={handleSearchTextChange}
                        onFocus={() => {
                            if (searchQuery.trim().length > 0) {
                                setShowSearchResults(true);
                            }
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                    />
                    {isSearching && (
                        <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoader} />
                    )}
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={handleClearSearch}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.clearButton}
                        >
                            <AppIcon
                                family="material"
                                name="close-circle"
                                size={18}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Multi-City Border Quick Filter Chips */}
            {detectedCities.length > 2 && (
                <View style={styles.cityChipsWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cityChipsScroll}
                        keyboardShouldPersistTaps="always"
                    >
                        {detectedCities.map(city => {
                            const isSelected = selectedCityFilter === city;
                            const sourceList = searchQuery.trim().length > 0 ? searchResults : nearbyHospitals;
                            const count = city === 'All'
                                ? sourceList.length
                                : sourceList.filter(h => h.city?.toLowerCase() === city.toLowerCase()).length;

                            return (
                                <TouchableOpacity
                                    key={city}
                                    style={[
                                        styles.cityChip,
                                        isSelected && styles.activeCityChip,
                                    ]}
                                    activeOpacity={0.75}
                                    onPress={() => setSelectedCityFilter(city)}
                                >
                                    <Text
                                        style={[
                                            styles.cityChipText,
                                            isSelected && styles.activeCityChipText,
                                        ]}
                                    >
                                        {city === 'All' ? '🌐 All Nearby (50km)' : `📍 ${city}`} ({count})
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* Search Results Dropdown Overlay (Live from Google Places API) */}
            {searchQuery.trim().length > 0 && showSearchResults && (
                <View style={[styles.searchResultsOverlay, { top: searchDropdownTop }]}>
                    <View style={styles.searchResultsHeader}>
                        <View style={styles.resultsCountRow}>
                            <Text style={styles.resultsCountText}>
                                {isSearching
                                    ? 'Searching Google Maps...'
                                    : `${searchResults.length} ${searchResults.length === 1 ? 'Hospital' : 'Hospitals'} Found`}
                            </Text>
                            <View style={styles.googleBadge}>
                                <Text style={styles.googleBadgeText}>Google Places API</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setShowSearchResults(false);
                                Keyboard.dismiss();
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={styles.hideSearchText}>Show Map</Text>
                        </TouchableOpacity>
                    </View>

                    {isSearching && searchResults.length === 0 ? (
                        <View style={styles.searchingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.searchingText}>Searching hospitals on Google Maps...</Text>
                        </View>
                    ) : searchResults.length === 0 ? (
                        <View style={styles.emptySearchContainer}>
                            <AppIcon
                                family="material"
                                name="hospital-marker"
                                size={36}
                                color={colors.textLight}
                            />
                            <Text style={styles.emptySearchTitle}>No hospitals found</Text>
                            <Text style={styles.emptySearchSubtitle}>
                                Try searching by hospital name or city (e.g. Sangli, Miraj, Kolhapur, Pune)
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={searchResults}
                            keyExtractor={item => item.id}
                            keyboardShouldPersistTaps="always"
                            showsVerticalScrollIndicator={true}
                            style={styles.dropdownList}
                            contentContainerStyle={styles.dropdownListContent}
                            renderItem={({ item }) => {
                                const isSelected = selectedHospital ? item.id === selectedHospital.id : false;
                                return (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={[
                                            styles.searchResultItem,
                                            isSelected && styles.activeSearchResultItem,
                                        ]}
                                        onPress={() => selectHospital(item)}
                                    >
                                        <View style={[
                                            styles.searchItemIconCircle,
                                            isSelected && styles.activeSearchItemIconCircle
                                        ]}>
                                            <AppIcon
                                                family="material"
                                                name="hospital-building"
                                                size={20}
                                                color={isSelected ? colors.primary : colors.textSecondary}
                                            />
                                        </View>

                                        <View style={styles.searchItemContent}>
                                            <View style={styles.searchItemNameRow}>
                                                <Text style={styles.searchItemName} numberOfLines={1}>
                                                    {item.name}
                                                </Text>
                                                {item.city ? (
                                                    <View style={styles.cityBadge}>
                                                        <Text style={styles.cityBadgeText}>{item.city}</Text>
                                                    </View>
                                                ) : null}
                                            </View>

                                            <Text style={styles.searchItemAddress} numberOfLines={1}>
                                                {item.address}
                                            </Text>

                                            <View style={styles.searchItemMetaRow}>
                                                <Text style={styles.searchItemDistance}>
                                                    {item.distanceKm} km · ~{item.etaMinutes} mins
                                                </Text>
                                                <View style={styles.itemDot} />
                                                <Text style={styles.searchItemType}>{item.type}</Text>
                                                {item.icuBeds > 0 && (
                                                    <>
                                                        <View style={styles.itemDot} />
                                                        <Text style={styles.searchItemBeds}>{item.icuBeds} ICU Beds</Text>
                                                    </>
                                                )}
                                            </View>
                                        </View>

                                        {isSelected && (
                                            <AppIcon
                                                family="material"
                                                name="check-circle"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}
                </View>
            )}

            {/* Interactive Map */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                    initialRegion={{
                        latitude: pickupLocation.latitude,
                        longitude: pickupLocation.longitude,
                        latitudeDelta: 0.08,
                        longitudeDelta: 0.08,
                    }}
                    mapType={mapType}
                    customMapStyle={mapType === 'standard' ? medicalMapStyle : undefined}
                    showsCompass={true}
                    loadingEnabled={true}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                >
                    {/* Patient Pickup Location Marker */}
                    <AmbulanceMarker
                        coordinate={pickupLocation}
                        title="Patient Pickup"
                        description={address}
                    />

                    {/* Hospital Markers from Google Places API */}
                    {mapHospitals.map(hosp => {
                        const isSelected = selectedHospital ? hosp.id === selectedHospital.id : false;
                        return (
                            <Marker
                                key={hosp.id}
                                coordinate={{ latitude: hosp.latitude, longitude: hosp.longitude }}
                                title={hosp.name}
                                description={`${hosp.distanceKm} km · ${hosp.etaMinutes} mins`}
                                onPress={() => selectHospital(hosp)}
                                anchor={{ x: 0.5, y: 1.0 }}
                            >
                                <View style={styles.markerContainer}>
                                    <View
                                        style={[
                                            styles.markerLabelPill,
                                            isSelected && styles.activeMarkerLabelPill,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.markerLabelText,
                                                isSelected && styles.activeMarkerLabelText,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {hosp.name.split(' ')[0]} ({hosp.etaMinutes}m)
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.hospitalPinHead,
                                            isSelected && styles.activeHospitalPinHead,
                                        ]}
                                    >
                                        <AppIcon
                                            family="material"
                                            name="hospital-building"
                                            size={isSelected ? 20 : 16}
                                            color="#FFFFFF"
                                        />
                                    </View>
                                    <View
                                        style={[
                                            styles.hospitalPinTail,
                                            isSelected && styles.activeHospitalPinTail,
                                        ]}
                                    />
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>

                {/* Floating Map Controls */}
                <View style={styles.floatingControls}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.controlBtn,
                            mapType === 'satellite' && styles.activeControlBtn,
                        ]}
                        onPress={() =>
                            setMapType(prev => (prev === 'standard' ? 'satellite' : 'standard'))
                        }
                    >
                        <AppIcon
                            family="material"
                            name="layers-outline"
                            size={20}
                            color={mapType === 'satellite' ? '#FFFFFF' : colors.textPrimary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.controlBtn}
                        onPress={handleRecenterLocation}
                    >
                        <AppIcon
                            family="material"
                            name="crosshairs-gps"
                            size={20}
                            color={colors.primary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.controlBtn}
                        onPress={() => setIsListExpanded(prev => !prev)}
                    >
                        <AppIcon
                            family="material"
                            name={isListExpanded ? 'map-outline' : 'format-list-bulleted'}
                            size={20}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Hospital Selection Card / List View */}
            {isListExpanded ? (
                <View style={styles.expandedListContainer}>
                    <View style={styles.listHeaderRow}>
                        <Text style={styles.listHeaderTitle}>
                            Hospitals ({displayedHospitals.length})
                        </Text>
                        <TouchableOpacity onPress={() => setIsListExpanded(false)}>
                            <Text style={styles.closeListText}>Show Map</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={displayedHospitals}
                        keyExtractor={item => item.id}
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.hospitalsScrollContent}
                        renderItem={({ item }) => {
                            const isSelected = selectedHospital ? item.id === selectedHospital.id : false;
                            return (
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    style={[
                                        styles.hospitalListItem,
                                        isSelected && styles.activeHospitalListItem,
                                    ]}
                                    onPress={() => {
                                        selectHospital(item);
                                        setIsListExpanded(false);
                                    }}
                                >
                                    <View style={styles.itemIconCircle}>
                                        <AppIcon
                                            family="material"
                                            name="hospital-box"
                                            size={22}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <View style={styles.searchItemNameRow}>
                                            <Text style={styles.itemName} numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            {item.city ? (
                                                <View style={styles.cityBadge}>
                                                    <Text style={styles.cityBadgeText}>{item.city}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                        <Text style={styles.itemAddress} numberOfLines={1}>
                                            {item.address}
                                        </Text>
                                        <View style={styles.itemMetaRow}>
                                            <Text style={styles.itemDistance}>
                                                {item.distanceKm} km · {item.etaMinutes} mins
                                            </Text>
                                            <View style={styles.itemDot} />
                                            <Text style={styles.itemType}>{item.type}</Text>
                                            {item.icuBeds > 0 && (
                                                <>
                                                    <View style={styles.itemDot} />
                                                    <Text style={styles.itemBeds}>
                                                        {item.icuBeds} ICU Beds
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>
                                    {isSelected && (
                                        <AppIcon
                                            family="material"
                                            name="check-circle"
                                            size={20}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            ) : (
                <View style={styles.bottomCardWrapper}>
                    {selectedWithDist ? (
                        <View style={styles.hospitalDetailsCard}>
                            {/* Drag indicator */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.dragHandleWrap}
                                onPress={() => setIsListExpanded(true)}
                            >
                                <View style={styles.dragHandle} />
                            </TouchableOpacity>

                            {/* Hospital Header Row */}
                            <View style={styles.cardHeaderRow}>
                                <View style={styles.hospitalIconCircle}>
                                    <AppIcon
                                        family="material"
                                        name="hospital-building"
                                        size={24}
                                        color={colors.primary}
                                    />
                                </View>

                                <View style={styles.headerTextCol}>
                                    <View style={styles.hospitalBadgeRow}>
                                        <View style={styles.typeTag}>
                                            <Text style={styles.typeTagText}>
                                                {selectedWithDist.type}
                                            </Text>
                                        </View>
                                        {selectedWithDist.city ? (
                                            <View style={styles.cityTag}>
                                                <Text style={styles.cityTagText}>{selectedWithDist.city}</Text>
                                            </View>
                                        ) : null}
                                        <View style={styles.emergencyTag}>
                                            <AppIcon
                                                family="material"
                                                name="check"
                                                size={12}
                                                color={colors.success}
                                            />
                                            <Text style={styles.emergencyTagText}>24x7 ER</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardHospitalName} numberOfLines={1}>
                                        {selectedWithDist.name}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.callCircleBtn}
                                    activeOpacity={0.8}
                                    onPress={() => handleCallHospital(selectedWithDist.phone)}
                                >
                                    <AppIcon
                                        family="material"
                                        name="phone"
                                        size={18}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Address & Metrics Row */}
                            <Text style={styles.cardAddressText} numberOfLines={1}>
                                {selectedWithDist.address}
                            </Text>

                            <View style={styles.metricsRow}>
                                <View style={styles.metricItem}>
                                    <AppIcon
                                        family="material"
                                        name="map-marker-distance"
                                        size={16}
                                        color={colors.primary}
                                    />
                                    <Text style={styles.metricValue}>
                                        {selectedWithDist.distanceKm} km
                                    </Text>
                                    <Text style={styles.metricLabel}>Distance</Text>
                                </View>

                                <View style={styles.metricDivider} />

                                <View style={styles.metricItem}>
                                    <AppIcon
                                        family="material"
                                        name="clock-fast"
                                        size={16}
                                        color={colors.warning}
                                    />
                                    <Text style={styles.metricValue}>
                                        ~{selectedWithDist.etaMinutes} mins
                                    </Text>
                                    <Text style={styles.metricLabel}>Transit ETA</Text>
                                </View>

                                <View style={styles.metricDivider} />

                                <View style={styles.metricItem}>
                                    <AppIcon
                                        family="material"
                                        name="bed-empty"
                                        size={16}
                                        color={colors.success}
                                    />
                                    <Text style={styles.metricValue}>
                                        {selectedWithDist.icuBeds} Beds
                                    </Text>
                                    <Text style={styles.metricLabel}>ICU Capacity</Text>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.otherHospitalsBtn}
                                    onPress={() => setIsListExpanded(true)}
                                >
                                    <AppIcon
                                        family="material"
                                        name="format-list-bulleted"
                                        size={18}
                                        color={colors.textPrimary}
                                    />
                                    <Text style={styles.otherHospitalsText}>All ({displayedHospitals.length})</Text>
                                </TouchableOpacity>

                                <Button
                                    title={isConfirming ? "Confirming..." : "Confirm Hospital & Start Transit"}
                                    onPress={handleConfirmHospital}
                                    icon="arrow-right"
                                    iconSize={18}
                                    variant="primary"
                                    style={styles.confirmButton}
                                    disabled={isConfirming}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.promptCard}>
                            {/* Drag indicator */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.dragHandleWrap}
                                onPress={() => setIsListExpanded(true)}
                            >
                                <View style={styles.dragHandle} />
                            </TouchableOpacity>

                            <View style={styles.promptHeaderRow}>
                                <View style={styles.promptIconCircle}>
                                    <AppIcon
                                        family="material"
                                        name="hospital-marker"
                                        size={26}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={styles.promptTextCol}>
                                    <Text style={styles.promptTitleText}>Select Destination Hospital</Text>
                                    <Text style={styles.promptSubtitleText}>
                                        Tap any hospital marker on the map or choose from list
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.browseButton}
                                onPress={() => setIsListExpanded(true)}
                            >
                                <AppIcon
                                    family="material"
                                    name="format-list-bulleted"
                                    size={18}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.browseButtonText}>
                                    Browse All Hospitals ({displayedHospitals.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

export default ChooseHospitalScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Context Strip
    contextStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    contextLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    emergencyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.danger,
    },
    contextPatientName: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 13,
        color: colors.textPrimary,
        includeFontPadding: false,
        maxWidth: 160,
    },
    typeBadge: {
        backgroundColor: colors.dangerLight,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 10,
        color: colors.danger,
        includeFontPadding: false,
    },
    contextHint: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 11,
        color: colors.textLight,
        includeFontPadding: false,
    },

    // Search Bar
    searchBarWrapper: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 3,
        zIndex: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 8,
    },
    // Multi-City Filter Chips (for border locations)
    cityChipsWrapper: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    cityChipsScroll: {
        paddingHorizontal: 16,
        gap: 8,
        alignItems: 'center',
    },
    cityChip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activeCityChip: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },
    cityChipText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 11,
        color: colors.textSecondary,
        includeFontPadding: false,
    },
    activeCityChipText: {
        color: colors.primary,
        fontFamily: typography.fontFamily.bold,
    },
    searchInput: {
        flex: 1,
        fontFamily: typography.fontFamily.medium,
        fontSize: 13,
        color: colors.textPrimary,
        includeFontPadding: false,
        paddingVertical: 0,
    },
    searchLoader: {
        marginLeft: 4,
    },

    // Search Results Dropdown Overlay
    searchResultsOverlay: {
        position: 'absolute',
        left: 12,
        right: 12,
        maxHeight: SCREEN_HEIGHT * 0.52,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 25,
        zIndex: 9999,
        overflow: 'hidden',
    },
    searchResultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    resultsCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    resultsCountText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 12,
        color: colors.textPrimary,
    },
    googleBadge: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    googleBadgeText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 9.5,
        color: colors.primary,
        includeFontPadding: false,
    },
    searchingContainer: {
        paddingVertical: 28,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    searchingText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 12.5,
        color: colors.textSecondary,
    },
    clearButton: {
        padding: 4,
    },
    hideSearchText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 12,
        color: colors.primary,
    },
    dropdownList: {
        maxHeight: SCREEN_HEIGHT * 0.44,
    },
    dropdownListContent: {
        paddingVertical: 6,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: 10,
    },
    activeSearchResultItem: {
        backgroundColor: colors.primaryLight,
    },
    searchItemIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeSearchItemIconCircle: {
        backgroundColor: '#FFFFFF',
    },
    searchItemContent: {
        flex: 1,
    },
    searchItemNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    searchItemName: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 12.5,
        color: colors.textPrimary,
        includeFontPadding: false,
        flexShrink: 1,
    },
    cityBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 4,
    },
    cityBadgeText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 9.5,
        color: '#0284C7',
        includeFontPadding: false,
    },
    searchItemAddress: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 11,
        color: colors.textSecondary,
        includeFontPadding: false,
        marginBottom: 3,
    },
    searchItemMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    searchItemDistance: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 10.5,
        color: colors.primary,
        includeFontPadding: false,
    },
    searchItemType: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 10,
        color: colors.textSecondary,
        includeFontPadding: false,
    },
    searchItemBeds: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 10,
        color: colors.success,
        includeFontPadding: false,
    },
    emptySearchContainer: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    emptySearchTitle: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 13.5,
        color: colors.textPrimary,
        marginTop: 4,
    },
    emptySearchSubtitle: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 11.5,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 16,
    },

    // Map
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },

    // Map Markers
    markerContainer: {
        alignItems: 'center',
    },
    markerLabelPill: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    activeMarkerLabelPill: {
        backgroundColor: colors.primary,
        borderColor: colors.primaryDark,
    },
    markerLabelText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 10,
        color: colors.textPrimary,
        includeFontPadding: false,
    },
    activeMarkerLabelText: {
        color: '#FFFFFF',
    },
    hospitalPinHead: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0284C7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    activeHospitalPinHead: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.primary,
        borderColor: '#FFFFFF',
        borderWidth: 2.5,
    },
    hospitalPinTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#0284C7',
        marginTop: -1,
    },
    activeHospitalPinTail: {
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderTopColor: colors.primary,
    },

    // Floating Controls
    floatingControls: {
        position: 'absolute',
        top: 14,
        right: 14,
        gap: 10,
    },
    controlBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    activeControlBtn: {
        backgroundColor: colors.primary,
    },

    // Bottom Selected Hospital Card
    bottomCardWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 12,
        paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    },
    hospitalDetailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    dragHandleWrap: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    dragHandle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    hospitalIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextCol: {
        flex: 1,
    },
    hospitalBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    typeTag: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 5,
    },
    typeTagText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 10,
        color: colors.textSecondary,
        includeFontPadding: false,
    },
    cityTag: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 5,
    },
    cityTagText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 10,
        color: '#0284C7',
        includeFontPadding: false,
    },
    emergencyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: colors.successLight,
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 5,
    },
    emergencyTagText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 10,
        color: colors.success,
        includeFontPadding: false,
    },
    cardHospitalName: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 15,
        color: colors.textPrimary,
        includeFontPadding: false,
    },
    callCircleBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    cardAddressText: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 10,
        includeFontPadding: false,
    },

    // Metrics Row
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingVertical: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    metricItem: {
        alignItems: 'center',
        gap: 2,
        flex: 1,
    },
    metricValue: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 13,
        color: colors.textPrimary,
        includeFontPadding: false,
    },
    metricLabel: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 10,
        color: colors.textLight,
        includeFontPadding: false,
    },
    metricDivider: {
        width: 1,
        height: 28,
        backgroundColor: '#E2E8F0',
    },

    // Action Buttons
    actionButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    otherHospitalsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        height: 48,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    otherHospitalsText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 12,
        color: colors.textPrimary,
        includeFontPadding: false,
    },
    confirmButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
    },

    // Expanded List
    expandedListContainer: {
        height: SCREEN_HEIGHT * 0.48,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 16,
        paddingTop: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    listHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    listHeaderTitle: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 15,
        color: colors.textPrimary,
        includeFontPadding: false,
    },
    closeListText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 13,
        color: colors.primary,
        includeFontPadding: false,
    },
    hospitalsScrollContent: {
        paddingBottom: 24,
        gap: 10,
    },
    hospitalListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 10,
    },
    activeHospitalListItem: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },
    itemIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 13,
        color: colors.textPrimary,
        includeFontPadding: false,
        flexShrink: 1,
    },
    itemAddress: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 11,
        color: colors.textSecondary,
        includeFontPadding: false,
        marginBottom: 4,
    },
    itemMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    itemDistance: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 10.5,
        color: colors.primary,
        includeFontPadding: false,
    },
    itemDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.textLight,
    },
    itemType: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 10.5,
        color: colors.textSecondary,
        includeFontPadding: false,
    },
    itemBeds: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 10.5,
        color: colors.success,
        includeFontPadding: false,
    },

    // Prompt Card (when no hospital is selected by default)
    promptCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 12,
    },
    promptHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    promptIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    promptTextCol: {
        flex: 1,
    },
    promptTitleText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 15,
        color: colors.textPrimary,
        includeFontPadding: false,
        marginBottom: 2,
    },
    promptSubtitleText: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 12,
        color: colors.textSecondary,
        includeFontPadding: false,
    },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 13,
        borderRadius: 12,
        gap: 8,
    },
    browseButtonText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 14,
        color: '#FFFFFF',
        includeFontPadding: false,
    },
});
