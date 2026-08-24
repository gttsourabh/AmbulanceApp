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
        <View style={styles.outerPulse} />
        <View style={styles.innerCircle}>
          <AppIcon
            family="material"
            name="ambulance"
            size={20}
            color={colors.white}
          />
        </View>
        <View style={styles.headingPointer} />
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(38, 117, 131, 0.25)',
  },
  innerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headingPointer: {
    position: 'absolute',
    top: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.primaryDark,
  },
});

export default AmbulanceMarker;
