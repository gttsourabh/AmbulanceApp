import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../../icons';
import {
  colors,
  typography,
  spacing,
} from '../../theme';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
  iconFamily: 'material' | 'ionicons' | 'fontawesome' | 'feather';
  backgroundColor: string;
  iconColor: string;
}
import Header from '../../components/Header/Header';

const notifications: NotificationItem[] = [
  {
    id: '1',
    title: 'New Trip Request',
    message: 'You have a new emergency request',
    time: '2 min ago',
    icon: 'ambulance',
    iconFamily: 'material',
    backgroundColor: colors.dangerLight,
    iconColor: colors.danger,
  },
  {
    id: '2',
    title: 'Trip Completed',
    message: 'Your trip with John Doe is completed',
    time: '25 min ago',
    icon: 'check-circle',
    iconFamily: 'feather',
    backgroundColor: colors.successLight,
    iconColor: colors.success,
  },
  {
    id: '3',
    title: 'Payment Received',
    message: '₹350 received for trip with John Doe',
    time: '30 min ago',
    icon: 'wallet',
    iconFamily: 'ionicons',
    backgroundColor: colors.infoLight,
    iconColor: colors.info,
  },
  {
    id: '4',
    title: 'System Message',
    message: 'Weekly maintenance on Sunday',
    time: '1 day ago',
    icon: 'info',
    iconFamily: 'feather',
    backgroundColor: '#F0EFFF',
    iconColor: '#7C5CFC',
  },
];

const NotificationsScreen = () => {
  const renderNotification = ({
    item,
  }: {
    item: NotificationItem;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.notificationRow}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: item.backgroundColor,
            },
          ]}
        >
          <AppIcon
            family={item.iconFamily}
            name={item.icon}
            size={17}
            color={item.iconColor}
          />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text
            style={styles.notificationTitle}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={styles.notificationMessage}
            numberOfLines={1}
          >
            {item.message}
          </Text>
        </View>

        {/* Time */}
        <Text style={styles.time}>
          {item.time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      {/* Header */}

      <Header title='Notification' backEnabled />


      {/* Full Screen Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  // ==========================================
  // SCREEN
  // ==========================================

  container: {
    flex: 1,
     backgroundColor: colors.background,
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    height: 58,

    alignItems: 'center',
    justifyContent: 'center',

     backgroundColor: colors.background,
  },

  headerTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },

  // ==========================================
  // LIST
  // ==========================================

  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },

  // ==========================================
  // NOTIFICATION ROW
  // ==========================================

  notificationRow: {
    minHeight: 72,

    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: spacing.sm,

    // No border
    borderWidth: 0,

     backgroundColor: colors.background,
  },

  // ==========================================
  // ICON
  // ==========================================

  iconContainer: {
    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.md,
  },

  // ==========================================
  // CONTENT
  // ==========================================

  contentContainer: {
    flex: 1,

    justifyContent: 'center',

    paddingRight: spacing.sm,
  },

  notificationTitle: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,

    color: colors.textPrimary,

    marginBottom: 4,
  },

  notificationMessage: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,

    color: colors.textSecondary,
  },

  // ==========================================
  // TIME
  // ==========================================

  time: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: typography.fontSize.xs,

    color: colors.textLight,

    alignSelf: 'flex-start',

    marginTop: spacing.sm,
  },
});