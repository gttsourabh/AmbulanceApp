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
  heading = 0,
  title = 'Ambulance',
  description = 'Your Vehicle',
}) => {
  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      flat={true}
      rotation={heading}
      title={title}
      description={description}
    >
      <View style={styles.container}>
        {/* Forward Direction Arrow Pointer (Rotates with heading) */}
        <View style={styles.directionArrowContainer}>
          <View style={styles.directionArrowHead} />
        </View>

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
    width: 60,
    height: 60,
  },
  directionArrowContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  directionArrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2563EB', // vibrant navigation blue
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 6,
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
