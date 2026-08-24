import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { AppIcon } from '../../icons';
import { colors, typography } from '../../theme';

export type MarkerType = 'pickup' | 'hospital' | 'custom';

interface LocationMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  type?: MarkerType;
  title?: string;
  description?: string;
  label?: string;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({
  coordinate,
  type = 'pickup',
  title,
  description,
  label,
}) => {
  const isPickup = type === 'pickup';
  const isHospital = type === 'hospital';

  const badgeColor = isPickup
    ? colors.danger
    : isHospital
    ? colors.primary
    : colors.secondary;

  const iconName = isPickup
    ? 'account'
    : isHospital
    ? 'hospital-building'
    : 'map-marker';

  const defaultTitle = isPickup
    ? 'Patient Pickup'
    : isHospital
    ? 'Destination Hospital'
    : 'Location';

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 1.0 }}
      title={title || defaultTitle}
      description={description}
    >
      <View style={styles.container}>
        {label && (
          <View style={[styles.labelPill, { borderColor: badgeColor }]}>
            <Text style={styles.labelText} numberOfLines={1}>
              {label}
            </Text>
          </View>
        )}
        <View style={styles.pinWrapper}>
          <View style={[styles.pinHead, { backgroundColor: badgeColor }]}>
            <AppIcon
              family="material"
              name={iconName}
              size={18}
              color={colors.white}
            />
          </View>
          <View style={[styles.pinTail, { borderTopColor: badgeColor }]} />
          <View style={styles.pinDot} />
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelPill: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  labelText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
  },
  pinWrapper: {
    alignItems: 'center',
  },
  pinHead: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 1,
  },
});

export default LocationMarker;
