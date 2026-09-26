import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppIcon } from '../../icons';
import { colors } from '../../theme';
import { formatDisplayDate } from '../DateRangePickerModal';
import {
    ExportFilterParams,
    ExportTripItem,
    fetchAllTripsForExport,
    downloadTripReportToDevice,
    calculateTripStats,
} from '../../services/tripExportService';

interface ExportTripModalProps {
    visible: boolean;
    onClose: () => void;
    currentTrips: ExportTripItem[];
    startDate: string;
    endDate: string;
    onOpenDatePicker?: () => void;
}

const ExportTripModal: React.FC<ExportTripModalProps> = ({
    visible,
    onClose,
    currentTrips,
    startDate,
    endDate,
    onOpenDatePicker,
}) => {
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [showPreview, setShowPreview] = useState<boolean>(false);

    const stats = calculateTripStats(currentTrips);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const filters: ExportFilterParams = {
                startDate,
                endDate,
            };

            // Fetch ALL trip records strictly for the selected date range
            let tripsToSave: ExportTripItem[] = [];
            try {
                tripsToSave = await fetchAllTripsForExport(filters);
            } catch (err) {
                console.warn('❌ Failed to fetch from server, falling back to loaded trips:', err);
                tripsToSave = currentTrips;
            }

            if (!tripsToSave || tripsToSave.length === 0) {
                tripsToSave = currentTrips;
            }

            const res = await downloadTripReportToDevice(tripsToSave, filters);
            if (res.success) {
                onClose();
            }
        } catch (error) {
            console.warn('❌ [EXPORT MODAL] Download error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.backdrop}
                onPress={onClose}
            >
                <Pressable
                    style={styles.card}
                    onPress={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <View style={styles.excelIconContainer}>
                                <AppIcon
                                    family="material"
                                    name="file-excel-box"
                                    size={24}
                                    color="#107C41"
                                />
                            </View>
                            <View style={styles.headerTextGroup}>
                                <Text style={styles.headerTitle}>Download Excel Report</Text>
                                <Text style={styles.headerSubtitle}>
                                    Save .xlsx file directly to device Downloads
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <AppIcon
                                family="material"
                                name="close"
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Date Range Selection Card */}
                    <View style={styles.dateRangeCard}>
                        <View style={styles.dateRangeHeader}>
                            <View style={styles.calendarIconCircle}>
                                <AppIcon
                                    family="material"
                                    name="calendar-range"
                                    size={18}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={styles.dateRangeTextGroup}>
                                <Text style={styles.dateRangeLabel}>SELECTED DATE RANGE</Text>
                                <Text style={styles.dateRangeValue}>
                                    {formatDisplayDate(startDate)} — {formatDisplayDate(endDate)}
                                </Text>
                            </View>
                            {onOpenDatePicker && (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.changeDateBtn}
                                    onPress={() => {
                                        onClose();
                                        onOpenDatePicker();
                                    }}
                                >
                                    <Text style={styles.changeDateText}>Change</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Quick Metrics for this Date Range */}
                        <View style={styles.statsRow}>
                            <View style={styles.statChip}>
                                <Text style={styles.statChipLabel}>Total Trips</Text>
                                <Text style={styles.statChipValue}>{stats.total}</Text>
                            </View>
                            <View style={styles.statChip}>
                                <Text style={[styles.statChipLabel, { color: colors.successDark }]}>
                                    Completed
                                </Text>
                                <Text style={[styles.statChipValue, { color: colors.successDark }]}>
                                    {stats.completed}
                                </Text>
                            </View>
                            <View style={styles.statChip}>
                                <Text style={[styles.statChipLabel, { color: colors.danger }]}>
                                    Cancelled
                                </Text>
                                <Text style={[styles.statChipValue, { color: colors.danger }]}>
                                    {stats.cancelled}
                                </Text>
                            </View>
                            <View style={styles.statChip}>
                                <Text style={styles.statChipLabel}>Distance</Text>
                                <Text style={styles.statChipValue}>{stats.totalDistanceKm} km</Text>
                            </View>
                        </View>
                    </View>

                    {/* Information Note */}
                    <View style={styles.infoBanner}>
                        <AppIcon
                            family="material"
                            name="folder-download-outline"
                            size={18}
                            color={colors.primary}
                        />
                        <Text style={styles.infoBannerText}>
                            The Excel file will be downloaded directly to your phone's{' '}
                            <Text style={styles.boldText}>Downloads</Text> folder containing all trips between{' '}
                            <Text style={styles.boldText}>{formatDisplayDate(startDate)}</Text> and{' '}
                            <Text style={styles.boldText}>{formatDisplayDate(endDate)}</Text>.
                        </Text>
                    </View>

                    {/* Collapsible Preview Toggle */}
                    {currentTrips.length > 0 && (
                        <>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.previewToggle}
                                onPress={() => setShowPreview(!showPreview)}
                            >
                                <View style={styles.previewToggleLeft}>
                                    <AppIcon
                                        family="material"
                                        name="table-eye"
                                        size={18}
                                        color={colors.primary}
                                    />
                                    <Text style={styles.previewToggleText}>
                                        Preview Trips Data ({currentTrips.length} rows)
                                    </Text>
                                </View>
                                <AppIcon
                                    family="material"
                                    name={showPreview ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>

                            {showPreview && (
                                <View style={styles.previewBox}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={true}
                                        nestedScrollEnabled
                                    >
                                        <View>
                                            {/* Preview Table Header */}
                                            <View style={styles.tableHeaderRow}>
                                                <Text style={[styles.tableCell, styles.cellSmall, styles.tableHeaderCell]}>
                                                    ID
                                                </Text>
                                                <Text style={[styles.tableCell, styles.cellMedium, styles.tableHeaderCell]}>
                                                    Patient
                                                </Text>
                                                <Text style={[styles.tableCell, styles.cellSmall, styles.tableHeaderCell]}>
                                                    Status
                                                </Text>
                                                <Text style={[styles.tableCell, styles.cellSmall, styles.tableHeaderCell]}>
                                                    Distance
                                                </Text>
                                                <Text style={[styles.tableCell, styles.cellLarge, styles.tableHeaderCell]}>
                                                    Pickup Location
                                                </Text>
                                            </View>

                                            {/* Preview Table Rows (first 5) */}
                                            <ScrollView
                                                style={{ maxHeight: 110 }}
                                                nestedScrollEnabled
                                            >
                                                {currentTrips.slice(0, 5).map(t => (
                                                    <View
                                                        key={t.id}
                                                        style={styles.tableRow}
                                                    >
                                                        <Text style={[styles.tableCell, styles.cellSmall]}>
                                                            #{t.id}
                                                        </Text>
                                                        <Text
                                                            style={[styles.tableCell, styles.cellMedium]}
                                                            numberOfLines={1}
                                                        >
                                                            {t.name}
                                                        </Text>
                                                        <Text
                                                            style={[
                                                                styles.tableCell,
                                                                styles.cellSmall,
                                                                t.status === 'Completed'
                                                                    ? { color: colors.successDark }
                                                                    : t.status === 'Cancelled'
                                                                    ? { color: colors.danger }
                                                                    : {},
                                                            ]}
                                                        >
                                                            {t.status}
                                                        </Text>
                                                        <Text style={[styles.tableCell, styles.cellSmall]}>
                                                            {t.distance || '--'}
                                                        </Text>
                                                        <Text
                                                            style={[styles.tableCell, styles.cellLarge]}
                                                            numberOfLines={1}
                                                        >
                                                            {t.address || '--'}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </ScrollView>
                                    {currentTrips.length > 5 && (
                                        <Text style={styles.previewMoreText}>
                                            + {currentTrips.length - 5} more records will be in the downloaded file
                                        </Text>
                                    )}
                                </View>
                            )}
                        </>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.cancelBtn}
                            onPress={onClose}
                            disabled={isDownloading}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.downloadBtn,
                                isDownloading && styles.downloadBtnDisabled,
                            ]}
                            onPress={handleDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.downloadBtnText}>
                                        Downloading...
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.btnContentRow}>
                                    <AppIcon
                                        family="material"
                                        name="download"
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.downloadBtnText}>
                                        Download to Device
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default ExportTripModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    excelIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextGroup: {
        flex: 1,
    },
    headerTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        includeFontPadding: false,
    },
    headerSubtitle: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
        includeFontPadding: false,
    },
    closeButton: {
        padding: 6,
        borderRadius: 20,
        backgroundColor: colors.background,
    },
    dateRangeCard: {
        backgroundColor: '#F7FAFA',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E3EEEE',
        marginBottom: 12,
    },
    dateRangeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E6EFEF',
    },
    calendarIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateRangeTextGroup: {
        flex: 1,
    },
    dateRangeLabel: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 10,
        fontWeight: '700',
        color: colors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    dateRangeValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    changeDateBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: colors.primaryLight,
        borderRadius: 8,
    },
    changeDateText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statChip: {
        alignItems: 'center',
    },
    statChipLabel: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 10,
        color: colors.textSecondary,
    },
    statChipValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
        marginTop: 1,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: colors.primaryLight,
        padding: 10,
        borderRadius: 10,
        marginBottom: 12,
    },
    infoBannerText: {
        flex: 1,
        fontFamily: 'GoogleSans-Regular',
        fontSize: 12,
        color: colors.primaryDark,
        lineHeight: 16,
    },
    boldText: {
        fontFamily: 'GoogleSans-Bold',
        fontWeight: '700',
    },
    previewToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.background,
        borderRadius: 10,
        marginBottom: 8,
    },
    previewToggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    previewToggleText: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 12,
        color: colors.textPrimary,
    },
    previewBox: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 8,
        backgroundColor: '#FAFAFA',
        marginBottom: 12,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 6,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
    },
    tableCell: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 11,
        color: colors.textPrimary,
        paddingHorizontal: 6,
    },
    tableHeaderCell: {
        fontFamily: 'GoogleSans-Bold',
        fontWeight: '700',
        color: colors.textSecondary,
    },
    cellSmall: {
        width: 65,
    },
    cellMedium: {
        width: 100,
    },
    cellLarge: {
        width: 140,
    },
    previewMoreText: {
        fontFamily: 'GoogleSans-Regular',
        fontSize: 10,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: 5,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 6,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    downloadBtn: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#107C41', // Excel Brand Green
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#107C41',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 3,
    },
    downloadBtnDisabled: {
        opacity: 0.65,
    },
    downloadBtnText: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    btnContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
