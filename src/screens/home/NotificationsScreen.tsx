import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
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
} from '../../theme';
import Header from '../../components/Header/Header';
import { NotificationCardSkeleton } from '../../components/Skeleton';
import { useAppSelector } from '../../redux/hook';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { getNotificationsApi } from '../../api';

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

// Determines icon and color theme dynamically based on notification content
const getNotificationVisuals = (title: string, message: string) => {
  const text = `${title} ${message}`.toLowerCase();

  if (
    text.includes('trip') ||
    text.includes('emergency') ||
    text.includes('ambulance') ||
    text.includes('assigned') ||
    text.includes('request')
  ) {
    return {
      icon: 'ambulance',
      iconFamily: 'material' as const,
      backgroundColor: colors.dangerLight,
      iconColor: colors.danger,
    };
  }

  if (
    text.includes('complete') ||
    text.includes('success') ||
    text.includes('reached') ||
    text.includes('drop')
  ) {
    return {
      icon: 'check-circle',
      iconFamily: 'feather' as const,
      backgroundColor: colors.successLight,
      iconColor: colors.success,
    };
  }

  if (
    text.includes('payment') ||
    text.includes('paid') ||
    text.includes('wallet') ||
    text.includes('earning') ||
    text.includes('₹') ||
    text.includes('rupee')
  ) {
    return {
      icon: 'wallet',
      iconFamily: 'ionicons' as const,
      backgroundColor: colors.infoLight,
      iconColor: colors.info,
    };
  }

  if (text.includes('cancel') || text.includes('reject')) {
    return {
      icon: 'close-circle',
      iconFamily: 'ionicons' as const,
      backgroundColor: '#FEE2E2',
      iconColor: '#DC2626',
    };
  }

  return {
    icon: 'notifications-outline',
    iconFamily: 'ionicons' as const,
    backgroundColor: '#F0EFFF',
    iconColor: '#7C5CFC',
  };
};

// Formats timestamp into relative or human-readable format
const formatNotificationTime = (dateStr?: string): string => {
  if (!dateStr) return '';

  // Handle standard date strings or MySQL datetime
  const normalizedStr = dateStr.includes(' ') && !dateStr.includes('T')
    ? dateStr.replace(' ', 'T')
    : dateStr;

  const parsedDate = new Date(normalizedStr);
  if (isNaN(parsedDate.getTime())) {
    return dateStr; // Already relative string e.g. "2 min ago"
  }

  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

  if (diffSeconds < 60) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

const NotificationsScreen = () => {
  const user = useAppSelector(state => state.auth.user);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isPullToRefresh = false) => {
    if (!isPullToRefresh) {
      setIsLoading(true);
    }

    try {
      let driverUserId = user?.id || user?.user_id || user?.userId || user?.driver_id;
      if (!driverUserId && driverUserId !== 0) {
        try {
          const storedUser = await storage.get<any>(STORAGE_KEYS.USER_DATA);
          driverUserId = storedUser?.id || storedUser?.user_id || storedUser?.userId || storedUser?.driver_id;
        } catch {
          // ignore
        }
      }

      // Filter: ' and owner_type="d" and user_id=?'
      const filterStr = driverUserId
        ? ` and owner_type="d" and user_id=${driverUserId}`
        : ' and owner_type="d"';

      console.log('📡 [NOTIFICATIONS API] Fetching with filter:', filterStr);

      const res = await getNotificationsApi({
        filter: filterStr,
      });

      console.log('✅ [NOTIFICATIONS API SUCCESS] Raw data:', res?.data);

      let items: any[] = [];
      if (Array.isArray(res?.data?.data)) {
        items = res.data.data;
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else if (Array.isArray(res?.data?.notifications)) {
        items = res.data.notifications;
      }

      const mappedList: NotificationItem[] = items.map((item, index) => {
        const title = item.title || item.heading || item.subject || 'Notification';
        const message = item.message || item.body || item.description || item.text || item.msg || '';
        const rawTime = item.created_at || item.time || item.date || item.timestamp;
        const visuals = getNotificationVisuals(title, message);

        return {
          id: String(item.id ?? item.notification_id ?? index),
          title,
          message,
          time: formatNotificationTime(rawTime),
          icon: visuals.icon,
          iconFamily: visuals.iconFamily,
          backgroundColor: visuals.backgroundColor,
          iconColor: visuals.iconColor,
        };
      });

      setNotifications(mappedList);
    } catch (err: any) {
      console.warn('❌ [NOTIFICATIONS API ERROR]:', err?.response?.data || err?.message || err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

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
            numberOfLines={2}
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

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <AppIcon
            family="ionicons"
            name="notifications-off-outline"
            size={28}
            color={colors.textLight}
          />
        </View>
        <Text style={styles.emptyTitle}>
          No Notifications
        </Text>
        <Text style={styles.emptySubtitle}>
          You have no new alerts or notifications at this time.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      {/* Header */}
      <Header title="Notification" backEnabled />

      {/* Notification List or Skeleton */}
      <FlatList
        data={isLoading ? ([1, 2, 3, 4, 5, 6] as any[]) : notifications}
        extraData={isLoading}
        keyExtractor={item => (isLoading ? `skeleton-${item}` : (item as NotificationItem).id)}
        renderItem={({ item }) => {
          if (isLoading) {
            return <NotificationCardSkeleton />;
          }
          return renderNotification({ item: item as NotificationItem });
        }}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          !isLoading && notifications.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
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
  // LIST
  // ==========================================

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  // ==========================================
  // NOTIFICATION ROW
  // ==========================================

  notificationRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },

  // ==========================================
  // ICON
  // ==========================================

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  // ==========================================
  // CONTENT
  // ==========================================

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },

  notificationTitle: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 16,
    includeFontPadding: false,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  notificationMessage: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 11.5,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 15,
    includeFontPadding: false,
    color: colors.textSecondary,
  },

  // ==========================================
  // TIME
  // ==========================================

  time: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 10.5,
    lineHeight: 12,
    includeFontPadding: false,
    color: colors.textLight,
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  // ==========================================
  // EMPTY STATE
  // ==========================================

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 24,
  },

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },

  emptySubtitle: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});