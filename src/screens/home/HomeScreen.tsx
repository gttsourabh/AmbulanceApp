import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    colors,
    typography,
    spacing,
} from '../../theme';

import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../redux/hook';
import { requestLocationPermission, checkLocationPermission } from '../../utils/locationPermission';

const HomeScreen = () => {
    const user = useAppSelector(state => state.auth.user);
    const navigation = useNavigation<any>();
    const [isOnline, setIsOnline] = useState(false);

    // Check location permission on screen mount
    React.useEffect(() => {
        const initPermission = async () => {
            const hasPermission = await checkLocationPermission();
            if (hasPermission) {
                setIsOnline(true);
            } else {
                // Prompt user for location permission on first launch
                const granted = await requestLocationPermission();
                if (granted) {
                    setIsOnline(true);
                }
            }
        };
        initPermission();
    }, []);

    const handleToggleOnline = async (nextValue: boolean) => {
        if (nextValue) {
            // Turning status to AVAILABLE - ask for location permission
            const granted = await requestLocationPermission();
            if (granted) {
                setIsOnline(true);
            } else {
                setIsOnline(false);
            }
        } else {
            setIsOnline(false);
        }
    };

    const handleNotifications = () => {
        navigation.navigate('Notifications');
    };
    const handleEmergencyRequest = () => {
        const parent1 = navigation.getParent();
        const parent2 = parent1?.getParent();

        parent2?.navigate('IncomingRequests');
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <Header
                rightIcon="bell-outline"
                onRightPress={handleNotifications}
                onLeftPress={() => {
                    console.log('Menu');
                }}
                centerContent={
                    <View
                        style={[
                            styles.statusContainer,
                            {
                                backgroundColor: isOnline
                                    ? colors.successLight
                                    : colors.divider,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.headerOnlineDot,
                                {
                                    backgroundColor: isOnline
                                        ? colors.success
                                        : colors.textLight,
                                },
                            ]}
                        />

                        <Text
                            style={[
                                styles.onlineText,
                                {
                                    color: isOnline
                                        ? colors.successDark
                                        : colors.textSecondary,
                                },
                            ]}
                        >
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </Text>
                    </View>
                }
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.greetingSection}>
                    <View style={styles.greetingContent}>
                        <Text style={styles.greeting}>
                            Good Morning,
                        </Text>

                        <Text style={styles.userName}>
                            {user?.name || 'Driver'}
                        </Text>
                    </View>

                    <View style={styles.profileAvatar}>
                        <AppIcon
                            family="material"
                            name="account"
                            size={26}
                            color={colors.textSecondary}
                        />
                    </View>
                </View>

                <View style={styles.availabilityCard}>
                    <View style={styles.availabilityContent}>
                        <Text style={styles.youAreText}>
                            YOUR STATUS
                        </Text>

                        <View style={styles.statusRow}>
                            <View
                                style={[
                                    styles.statusPill,
                                    {
                                        backgroundColor: isOnline
                                            ? colors.successLight
                                            : colors.divider,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.onlineDot,
                                        {
                                            backgroundColor: isOnline
                                                ? colors.success
                                                : colors.textLight,
                                        },
                                    ]}
                                />

                                <Text
                                    style={[
                                        styles.statusText,
                                        {
                                            color: isOnline
                                                ? colors.success
                                                : colors.textSecondary,
                                        },
                                    ]}
                                >
                                    {isOnline
                                        ? 'AVAILABLE'
                                        : 'OFFLINE'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Switch
                        value={isOnline}
                        onValueChange={handleToggleOnline}
                        trackColor={{
                            false: colors.divider,
                            true: colors.success,
                        }}
                        thumbColor={colors.white}
                        ios_backgroundColor={colors.divider}
                        style={styles.switch}
                    />
                </View>

                <View style={styles.overviewSection}>
                    <Text style={styles.sectionTitle}>
                        Today's Overview
                    </Text>

                    <View style={styles.overviewCard}>
                        <View style={styles.overviewRow}>
                            <View style={styles.rowLeft}>
                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor:
                                                colors.successLight,
                                        },
                                    ]}
                                >
                                    <AppIcon
                                        family="material"
                                        name="check-circle"
                                        size={18}
                                        color={colors.successDark}
                                    />
                                </View>

                                <Text style={styles.rowLabel}>
                                    Completed
                                </Text>
                            </View>

                            <Text style={styles.rowValue}>
                                04
                            </Text>
                        </View>

                        <View style={styles.overviewRow}>
                            <View style={styles.rowLeft}>

                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor:
                                                colors.dangerLight,
                                        },
                                    ]}
                                >
                                    <AppIcon
                                        family="material"
                                        name="close-circle"
                                        size={18}
                                        color={colors.danger}
                                    />
                                </View>

                                <Text style={styles.rowLabel}>
                                    Cancelled
                                </Text>
                                
                            </View>

                            <Text style={styles.rowValue}>
                                01
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.overviewRow,
                                styles.lastRow,
                            ]}
                        >
                            <View style={styles.rowLeft}>
                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor:
                                                colors.warningLight,
                                        },
                                    ]}
                                >
                                    <AppIcon
                                        family="material"
                                        name="cash"
                                        size={18}
                                        color={colors.warning}
                                    />
                                </View>

                                <Text style={styles.rowLabel}>
                                    Earnings
                                </Text>
                            </View>

                            <Text style={styles.rowValue}>
                                ₹1,250
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.emergencyButton}
                    onPress={handleEmergencyRequest}
                >
                    <AppIcon
                        family="material"
                        name="alert-circle-outline"
                        size={20}
                        color={colors.danger}
                    />

                    <Text style={styles.emergencyButtonText}>
                        Emergency Request
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxxl,
    },

    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
    },

    headerOnlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },

    onlineText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.xs,
        letterSpacing: 0.4,
    },

    greetingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },

    greetingContent: {
        flex: 1,
    },

    greeting: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        letterSpacing: 0.2,
        marginBottom: 4,
    },

    userName: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.xl,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    profileAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },

    availabilityCard: {
        minHeight: 84,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 18,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },

    availabilityContent: {
        justifyContent: 'center',
    },

    youAreText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 10,
        color: colors.textLight,
        letterSpacing: 0.8,
        marginBottom: spacing.xs,
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
    },

    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginRight: 6,
    },

    statusText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        letterSpacing: 0.4,
    },

    switch: {
        transform: [
            {
                scaleX: 0.92,
            },
            {
                scaleY: 0.92,
            },
        ],
    },

    overviewSection: {
        marginTop: spacing.xl,
    },

    sectionTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        letterSpacing: 0.1,
        marginBottom: spacing.sm,
    },

    overviewCard: {
        backgroundColor: colors.card,
        borderRadius: 18,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    overviewRow: {
        minHeight: 60,
        paddingVertical: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.divider,
    },

    lastRow: {
        borderBottomWidth: 0,
    },

    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },

    rowLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        letterSpacing: 0.1,
    },

    rowValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: typography.fontSize.md,
        color: colors.textPrimary,
        letterSpacing: 0.1,
    },

    emergencyButton: {
        minHeight: 54,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 16,
        backgroundColor: colors.dangerLight,
        borderWidth: 1,
        borderColor: colors.danger,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    emergencyButtonText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: typography.fontSize.sm,
        color: colors.danger,
    },

});