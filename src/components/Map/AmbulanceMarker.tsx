import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { AppIcon } from '../../icons';
import { colors } from '../../theme';

interface AmbulanceMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  heading?: number;
  title?: string;
  description?: string;
}

export const AmbulanceMarker: React.FC<AmbulanceMarkerProps> = ({
  coordinate,
  heading: _heading,
  title = 'Ambulance',
  description = 'Your Vehicle',
}) => {
  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      title={title}
      description={description}
    >
      <View style={styles.container}>
        {/* Pulse Effect */}
        <View style={styles.outerPulse} />

        {/* Vehicle Icon Circle */}
        <View style={styles.innerCircle}>
          <AppIcon
            family="material"
            name="ambulance"
            size={19}
            color={colors.white}
          />
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
  },
  outerPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.22)',
  },
  innerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 2.5,
    borderColor: colors.white,
  },
});

export default AmbulanceMarker;
