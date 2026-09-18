import React, { useState, useMemo, useEffect } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    Pressable,
} from 'react-native';
import { AppIcon } from '../icons';
import { colors, typography } from '../theme';

interface DateRangePickerModalProps {
    visible: boolean;
    initialStartDate?: string; // YYYY-MM-DD
    initialEndDate?: string;   // YYYY-MM-DD
    onClose: () => void;
    onApply: (startDate: string, endDate: string) => void;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Helpers
export const formatDateToISO = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const parseISODate = (isoStr?: string): Date => {
    if (!isoStr) return new Date();
    const [y, m, d] = isoStr.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
};

export const formatDisplayDate = (isoStr: string): string => {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-').map(Number);
    if (!y || !m || !d) return isoStr;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
    visible,
    initialStartDate,
    initialEndDate,
    onClose,
    onApply,
}) => {
    const currentYear = new Date().getFullYear();
    const defaultStart = initialStartDate || `${currentYear}-01-01`;
    const defaultEnd = initialEndDate || `${currentYear}-12-31`;

    const [selectedStart, setSelectedStart] = useState<string>(defaultStart);
    const [selectedEnd, setSelectedEnd] = useState<string>(defaultEnd);
    const [pickingTarget, setPickingTarget] = useState<'start' | 'end'>('start');

    // Calendar view state (which month/year is shown)
    const initialViewDate = parseISODate(defaultStart);
    const [viewYear, setViewYear] = useState<number>(initialViewDate.getFullYear());
    const [viewMonth, setViewMonth] = useState<number>(initialViewDate.getMonth());

    useEffect(() => {
        if (visible) {
            setSelectedStart(initialStartDate || `${currentYear}-01-01`);
            setSelectedEnd(initialEndDate || `${currentYear}-12-31`);
            setPickingTarget('start');
            const d = parseISODate(initialStartDate || `${currentYear}-01-01`);
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
        }
    }, [visible, initialStartDate, initialEndDate, currentYear]);

    // Calendar days computation for viewMonth & viewYear
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const cells: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

        // Previous month padding
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const prevMonthDate = new Date(viewYear, viewMonth - 1, dayNum);
            cells.push({
                dateStr: formatDateToISO(prevMonthDate),
                dayNumber: dayNum,
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const curDate = new Date(viewYear, viewMonth, d);
            cells.push({
                dateStr: formatDateToISO(curDate),
                dayNumber: d,
                isCurrentMonth: true,
            });
        }

        // Next month padding to fill up to complete weeks (multiple of 7)
        const totalRows = Math.ceil(cells.length / 7);
        const remaining = totalRows * 7 - cells.length;
        for (let d = 1; d <= remaining; d++) {
            const nextMonthDate = new Date(viewYear, viewMonth + 1, d);
            cells.push({
                dateStr: formatDateToISO(nextMonthDate),
                dayNumber: d,
                isCurrentMonth: false,
            });
        }

        return cells;
    }, [viewYear, viewMonth]);

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(v => v - 1);
        } else {
            setViewMonth(v => v - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(v => v + 1);
        } else {
            setViewMonth(v => v + 1);
        }
    };

    const handlePrevYear = () => {
        setViewYear(v => v - 1);
    };

    const handleNextYear = () => {
        setViewYear(v => v + 1);
    };

    const handleDayPress = (dateStr: string) => {
        if (pickingTarget === 'start') {
            setSelectedStart(dateStr);
            if (dateStr > selectedEnd) {
                // If new start is after current end, reset end to same or advance
                setSelectedEnd(dateStr);
            }
            setPickingTarget('end');
        } else {
            if (dateStr < selectedStart) {
                // Tapped before start date -> make it the new start date
                setSelectedStart(dateStr);
                setPickingTarget('end');
            } else {
                setSelectedEnd(dateStr);
                setPickingTarget('start');
            }
        }
    };

    // Preset selection helpers
    const applyPreset = (preset: 'today' | 'last30' | 'thisMonth' | 'thisYear') => {
        const now = new Date();
        if (preset === 'today') {
            const todayStr = formatDateToISO(now);
            setSelectedStart(todayStr);
            setSelectedEnd(todayStr);
            setViewYear(now.getFullYear());
            setViewMonth(now.getMonth());
        } else if (preset === 'last30') {
            const start = new Date();
            start.setDate(now.getDate() - 30);
            setSelectedStart(formatDateToISO(start));
            setSelectedEnd(formatDateToISO(now));
            setViewYear(now.getFullYear());
            setViewMonth(now.getMonth());
        } else if (preset === 'thisMonth') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setSelectedStart(formatDateToISO(start));
            setSelectedEnd(formatDateToISO(end));
            setViewYear(now.getFullYear());
            setViewMonth(now.getMonth());
        } else if (preset === 'thisYear') {
            setSelectedStart(`${now.getFullYear()}-01-01`);
            setSelectedEnd(`${now.getFullYear()}-12-31`);
            setViewYear(now.getFullYear());
            setViewMonth(0);
        }
    };

    const handleReset = () => {
        applyPreset('thisYear');
    };

    const handleApply = () => {
        // Ensure chronological order
        const [start, end] =
            selectedStart <= selectedEnd
                ? [selectedStart, selectedEnd]
                : [selectedEnd, selectedStart];

        onApply(start, end);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
                    {/* Handle bar indicator */}
                    <View style={styles.handleBar} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <AppIcon
                                family="material"
                                name="calendar-range"
                                size={22}
                                color={colors.primary}
                            />
                            <Text style={styles.headerTitle}>Select Date Range</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <AppIcon
                                family="material"
                                name="close"
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Quick Presets */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.presetsContainer}
                    >
                        <TouchableOpacity
                            style={[
                                styles.presetChip,
                                selectedStart === `${currentYear}-01-01` &&
                                selectedEnd === `${currentYear}-12-31` &&
                                styles.activePresetChip,
                            ]}
                            onPress={() => applyPreset('thisYear')}
                        >
                            <Text
                                style={[
                                    styles.presetChipText,
                                    selectedStart === `${currentYear}-01-01` &&
                                    selectedEnd === `${currentYear}-12-31` &&
                                    styles.activePresetChipText,
                                ]}
                            >
                                This Year ({currentYear})
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.presetChip}
                            onPress={() => applyPreset('thisMonth')}
                        >
                            <Text style={styles.presetChipText}>This Month</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.presetChip}
                            onPress={() => applyPreset('last30')}
                        >
                            <Text style={styles.presetChipText}>Last 30 Days</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.presetChip}
                            onPress={() => applyPreset('today')}
                        >
                            <Text style={styles.presetChipText}>Today</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Start Date & End Date Display Cards */}
                    <View style={styles.rangeDisplayRow}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setPickingTarget('start')}
                            style={[
                                styles.rangeCard,
                                pickingTarget === 'start' && styles.activeRangeCard,
                            ]}
                        >
                            <Text style={styles.rangeCardLabel}>START DATE</Text>
                            <Text style={styles.rangeCardValue}>
                                {formatDisplayDate(selectedStart)}
                            </Text>
                            <Text style={styles.rangeCardIso}>{selectedStart}</Text>
                        </TouchableOpacity>

                        <View style={styles.arrowContainer}>
                            <AppIcon
                                family="material"
                                name="arrow-right"
                                size={18}
                                color={colors.textSecondary}
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setPickingTarget('end')}
                            style={[
                                styles.rangeCard,
                                pickingTarget === 'end' && styles.activeRangeCard,
                            ]}
                        >
                            <Text style={styles.rangeCardLabel}>END DATE</Text>
                            <Text style={styles.rangeCardValue}>
                                {formatDisplayDate(selectedEnd)}
                            </Text>
                            <Text style={styles.rangeCardIso}>{selectedEnd}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Calendar Month / Year Navigation */}
                    <View style={styles.monthNavRow}>
                        <TouchableOpacity
                            onPress={handlePrevYear}
                            style={styles.navButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <AppIcon
                                family="material"
                                name="chevron-double-left"
                                size={20}
                                color={colors.primary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handlePrevMonth}
                            style={styles.navButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <AppIcon
                                family="material"
                                name="chevron-left"
                                size={22}
                                color={colors.primary}
                            />
                        </TouchableOpacity>

                        <Text style={styles.monthTitle}>
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </Text>

                        <TouchableOpacity
                            onPress={handleNextMonth}
                            style={styles.navButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <AppIcon
                                family="material"
                                name="chevron-right"
                                size={22}
                                color={colors.primary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleNextYear}
                            style={styles.navButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <AppIcon
                                family="material"
                                name="chevron-double-right"
                                size={20}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Day Names Row */}
                    <View style={styles.dayNamesRow}>
                        {DAY_NAMES.map((name, idx) => (
                            <Text
                                key={name + idx}
                                style={[
                                    styles.dayNameText,
                                    (idx === 0 || idx === 6) && styles.weekendDayNameText,
                                ]}
                            >
                                {name}
                            </Text>
                        ))}
                    </View>

                    {/* Days Grid */}
                    <View style={styles.daysGrid}>
                        {calendarDays.map((cell, idx) => {
                            const isStart = cell.dateStr === selectedStart;
                            const isEnd = cell.dateStr === selectedEnd;
                            const isInRange =
                                cell.dateStr > selectedStart && cell.dateStr < selectedEnd;
                            const isEdge = isStart || isEnd;

                            return (
                                <TouchableOpacity
                                    key={cell.dateStr + idx}
                                    activeOpacity={0.7}
                                    onPress={() => handleDayPress(cell.dateStr)}
                                    style={[
                                        styles.dayCell,
                                        isInRange && styles.inRangeDayCell,
                                        isStart && selectedStart !== selectedEnd && styles.startRangeDayCell,
                                        isEnd && selectedStart !== selectedEnd && styles.endRangeDayCell,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.dayCircle,
                                            isEdge && styles.edgeDayCircle,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                !cell.isCurrentMonth && styles.dimmedDayText,
                                                isInRange && styles.inRangeDayText,
                                                isEdge && styles.edgeDayText,
                                            ]}
                                        >
                                            {cell.dayNumber}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Bottom Action Buttons */}
                    <View style={styles.footerRow}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={handleReset}
                        >
                            <Text style={styles.resetButtonText}>Reset (Full Year)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={handleApply}
                        >
                            <Text style={styles.applyButtonText}>Apply Filter</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default DateRangePickerModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 28,
        maxHeight: '92%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 10,
    },
    handleBar: {
        width: 40,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        fontFamily: typography.fontFamily.bold,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    presetsContainer: {
        gap: 8,
        paddingBottom: 12,
    },
    presetChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activePresetChip: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },
    presetChipText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activePresetChipText: {
        fontFamily: typography.fontFamily.bold,
        color: colors.primary,
        fontWeight: '700',
    },
    rangeDisplayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 8,
    },
    rangeCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    activeRangeCard: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    rangeCardLabel: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 10,
        fontWeight: '700',
        color: colors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    rangeCardValue: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    rangeCardIso: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 11,
        color: colors.textLight,
        marginTop: 1,
    },
    arrowContainer: {
        paddingHorizontal: 2,
    },
    monthNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    navButton: {
        padding: 4,
    },
    monthTitle: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    dayNamesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 6,
        paddingHorizontal: 4,
    },
    dayNameText: {
        width: 38,
        textAlign: 'center',
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textLight,
    },
    weekendDayNameText: {
        color: colors.danger,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    dayCell: {
        width: `${100 / 7}%`,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 1,
    },
    inRangeDayCell: {
        backgroundColor: colors.primaryLight,
    },
    startRangeDayCell: {
        borderTopLeftRadius: 19,
        borderBottomLeftRadius: 19,
    },
    endRangeDayCell: {
        borderTopRightRadius: 19,
        borderBottomRightRadius: 19,
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    edgeDayCircle: {
        backgroundColor: colors.primary,
    },
    dayText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 13,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    dimmedDayText: {
        color: '#CBD5E1',
    },
    inRangeDayText: {
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primaryDark,
        fontWeight: '600',
    },
    edgeDayText: {
        fontFamily: typography.fontFamily.bold,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    resetButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    resetButtonText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    applyButton: {
        flex: 1.5,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    applyButtonText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
