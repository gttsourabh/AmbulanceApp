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
  isUnread: boolean;
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

// Formats timestamp into readable clock time and date (e.g. "11:07 AM", "Yesterday, 11:07 AM", "5 Oct, 11:07 AM")
const formatNotificationTime = (dateStr?: string): string => {
  if (!dateStr) return '';

  let normalizedStr = dateStr.trim();
  // Truncate microsecond precision (.266319 -> .266) for JS Date parsing
  normalizedStr = normalizedStr.replace(/(\.\d{3})\d+/, '$1');

  // Handle standard date strings or MySQL datetime
  if (normalizedStr.includes(' ') && !normalizedStr.includes('T')) {
    normalizedStr = normalizedStr.replace(' ', 'T');
  }

  const parsedDate = new Date(normalizedStr);
  if (isNaN(parsedDate.getTime())) {
    return dateStr;
  }

  // Format clock time (e.g. "11:07 AM")
  const timeStr = parsedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const now = new Date();
  const isToday =
    parsedDate.getDate() === now.getDate() &&
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getFullYear() === now.getFullYear();

  if (isToday) {
    return timeStr;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    parsedDate.getDate() === yesterday.getDate() &&
    parsedDate.getMonth() === yesterday.getMonth() &&
    parsedDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  const dateStrFormatted = parsedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  return `${dateStrFormatted}, ${timeStr}`;
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

      const userIdVal = driverUserId !== undefined && driverUserId !== null ? `${driverUserId}` : `${user?.id || ''}`;

      const filters = [
        {
          column: 'owner_type',
          operator: '=',
          value: 'D',
        },
        {
          column: 'user_id',
          operator: '=',
          value: userIdVal,
        },
      ];

      console.log('📡 [NOTIFICATIONS API] Fetching with filters:', JSON.stringify(filters));

      const res = await getNotificationsApi({
        filters,
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
        const message = item.description || item.message || item.body || item.text || item.msg || '';
        const rawTime = item.created_modified_date || item.created_at || item.time || item.date || item.timestamp;
        const visuals = getNotificationVisuals(title, message);

        const readOnlyVal = String(item.read_only || '').trim().toUpperCase();
        const isUnread =
          readOnlyVal === 'N' ||
          item.is_read === 0 ||
          item.is_read === false ||
          item.is_read === '0' ||
          item.read === false ||
          item.read === 0 ||
          item.read_status === 'unread' ||
          item.read_status === '0';

        return {
          id: String(item.id ?? item.notification_id ?? index),
          title,
          message,
          time: formatNotificationTime(rawTime),
          icon: visuals.icon,
          iconFamily: visuals.iconFamily,
          backgroundColor: visuals.backgroundColor,
          iconColor: visuals.iconColor,
          isUnread,
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

  const handleNotificationPress = (clickedItem: NotificationItem) => {
    // Mark as read locally on tap
    setNotifications(prev =>
      prev.map(item =>
        item.id === clickedItem.id ? { ...item, isUnread: false } : item
      )
    );
  };

  const renderNotification = ({
    item,
  }: {
    item: NotificationItem;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.notificationRow,
          item.isUnread && styles.unreadNotificationRow,
        ]}
      >
        {/* Icon with unread badge dot */}
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
          {item.isUnread && <View style={styles.unreadDot} />}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.notificationTitle,
              item.isUnread && styles.unreadNotificationTitle,
            ]}
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
        <View style={styles.timeContainer}>
          <Text style={[styles.time, item.isUnread && styles.unreadTime]}>
            {item.time}
          </Text>
        </View>
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
  unreadNotificationRow: {
    backgroundColor: '#F8FAFC',
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
    marginRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: colors.white,
    zIndex: 10,
    elevation: 4,
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
  unreadNotificationTitle: {
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
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

  timeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    marginTop: 2,
    maxWidth: 95,
  },

  time: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 11,
    lineHeight: 14,
    includeFontPadding: false,
    color: colors.textLight,
    textAlign: 'right',
  },
  unreadTime: {
    color: '#2563EB',
    fontWeight: typography.fontWeight.semibold,
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