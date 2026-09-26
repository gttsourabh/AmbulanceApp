import * as XLSX from 'xlsx';
import { NativeModules, Alert } from 'react-native';
import {
    getAmbulanceRequestApi,
    AmbulanceRequestItem,
    GetAmbulanceRequestPayload,
    RequestFilterItem,
} from '../api/driverApi';

const { DownloadModule } = NativeModules;

export interface ExportTripItem {
    id: number | string;
    name?: string;
    time?: string;
    pickupTime?: string;
    distance?: string;
    amount?: string;
    status: string;
    rawStatus?: string;
    address?: string;
    dropAddress?: string;
    emergencyType?: string;
    phone?: string;
    ambulanceNo?: string;
    driverName?: string;
    cancellationReason?: string;
    createdAt?: string;
}

export interface ExportFilterParams {
    startDate: string;
    endDate: string;
}

export interface ReportSummaryStats {
    total: number;
    completed: number;
    cancelled: number;
    other: number;
    totalDistanceKm: number;
}

/**
 * Normalizes an API AmbulanceRequestItem into an ExportTripItem
 */
export const normalizeItemForExport = (item: AmbulanceRequestItem): ExportTripItem => {
    const rawSt = String(item.status || 'requested').toLowerCase();
    const isCancelled = rawSt.includes('cancel');
    const isCompleted = rawSt.includes('complete');
    const isAssigned = rawSt.includes('assign');
    const isDispatched = rawSt.includes('dispatch');
    const isArriving = rawSt.includes('arriv');

    let displayStatus = 'Active';
    if (isCancelled) displayStatus = 'Cancelled';
    else if (isCompleted) displayStatus = 'Completed';
    else if (isArriving) displayStatus = 'Arriving';
    else if (isDispatched) displayStatus = 'Dispatched';
    else if (isAssigned) displayStatus = 'Assigned';
    else displayStatus = rawSt.charAt(0).toUpperCase() + rawSt.slice(1);

    let timeStr = '--';
    let dateStr = '--';
    if (item.created_at) {
        const d = new Date(item.created_at);
        if (!isNaN(d.getTime())) {
            dateStr = d.toISOString().split('T')[0];
            timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        }
    }

    const rawDist = item.np_distance || item.ph_distance || item.distance;
    let distanceStr = '';
    if (rawDist) {
        const num = parseFloat(String(rawDist));
        distanceStr = !isNaN(num) ? `${num.toFixed(1)} km` : `${rawDist} km`;
    }

    return {
        id: item.id,
        name: item.patient_name ? item.patient_name.trim() : 'Emergency Patient',
        time: timeStr,
        pickupTime: item.time || (item.eta_minutes ? `${item.eta_minutes} mins` : timeStr),
        distance: distanceStr,
        amount: item.amount ? `₹${item.amount}` : '',
        status: displayStatus,
        rawStatus: rawSt,
        address: item.pickup_address || '--',
        dropAddress: item.drop_address || '--',
        emergencyType: item.emergency_type ? item.emergency_type.trim() : 'Emergency',
        phone: item.requester_phone || '--',
        ambulanceNo: item.ambulance_no || '--',
        driverName: item.driver_name || '--',
        cancellationReason: item.cancellation_reason || '--',
        createdAt: item.created_at || dateStr,
    };
};

/**
 * Calculates statistics for given trip items
 */
export const calculateTripStats = (trips: ExportTripItem[]): ReportSummaryStats => {
    let completed = 0;
    let cancelled = 0;
    let other = 0;
    let totalDist = 0;

    trips.forEach(trip => {
        const st = String(trip.status || '').toLowerCase();
        if (st.includes('complete')) completed++;
        else if (st.includes('cancel')) cancelled++;
        else other++;

        if (trip.distance) {
            const num = parseFloat(trip.distance.replace(/[^0-9.]/g, ''));
            if (!isNaN(num)) totalDist += num;
        }
    });

    return {
        total: trips.length,
        completed,
        cancelled,
        other,
        totalDistanceKm: parseFloat(totalDist.toFixed(1)),
    };
};

/**
 * Builds an Excel-compatible spreadsheet (CSV formatted with SheetJS XLSX)
 * with all trips for the specified date range.
 */
export const generateTripExcelReport = (
    trips: ExportTripItem[],
    filters: ExportFilterParams,
): { csvString: string; base64Xlsx: string; stats: ReportSummaryStats } => {
    const stats = calculateTripStats(trips);
    const nowStr = new Date().toLocaleString();

    // 1. Metadata Block (based purely on date range and all data)
    const metaRows: any[][] = [
        ['SECURE AMBULANCE - TRIP DISPATCH HISTORY REPORT'],
        ['Generated Date & Time:', nowStr],
        ['Report Date Range:', `${filters.startDate} to ${filters.endDate}`],
        ['Total Trips in Period:', stats.total],
        ['Completed Trips:', stats.completed],
        ['Cancelled Trips:', stats.cancelled],
        ['Active / Dispatched:', stats.other],
        ['Total Distance Recorded:', `${stats.totalDistanceKm} km`],
        [], // blank separator row
    ];

    // 2. Table Column Headers
    const headers = [
        'S.No',
        'Trip ID',
        'Date',
        'Time',
        'Patient Name',
        'Phone Number',
        'Emergency Type',
        'Pickup Address',
        'Drop Address / Hospital',
        'Distance',
        'Status',
        'Ambulance No',
        'Driver Name',
        'Cancellation Reason',
    ];

    // 3. Table Rows
    const dataRows = trips.map((trip, idx) => {
        let datePart = '--';
        let timePart = trip.time || '--';

        if (trip.createdAt) {
            const d = new Date(trip.createdAt);
            if (!isNaN(d.getTime())) {
                datePart = d.toISOString().split('T')[0];
                if (!trip.time || trip.time === '--') {
                    timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                }
            } else {
                datePart = trip.createdAt;
            }
        }

        return [
            idx + 1,
            `#${trip.id}`,
            datePart,
            timePart,
            trip.name || 'Emergency Patient',
            trip.phone || '--',
            trip.emergencyType || 'General Emergency',
            trip.address || '--',
            trip.dropAddress || '--',
            trip.distance || '--',
            trip.status || '--',
            trip.ambulanceNo || '--',
            trip.driverName || '--',
            trip.cancellationReason || '--',
        ];
    });

    // 4. Create SheetJS Workbook
    const ws = XLSX.utils.aoa_to_sheet([...metaRows, headers, ...dataRows]);

    // Set Column Widths for Excel viewing
    ws['!cols'] = [
        { wch: 6 },
        { wch: 10 },
        { wch: 12 },
        { wch: 10 },
        { wch: 22 },
        { wch: 15 },
        { wch: 18 },
        { wch: 30 },
        { wch: 30 },
        { wch: 12 },
        { wch: 14 },
        { wch: 16 },
        { wch: 18 },
        { wch: 25 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trip History');

    // 5. Convert to CSV string
    const csvString = XLSX.utils.sheet_to_csv(ws);

    // 6. Generate real XLSX in base64
    const base64Xlsx = XLSX.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
    });

    return {
        csvString,
        base64Xlsx,
        stats,
    };
};

/**
 * Fetches all trips from the backend API based on the selected date range only.
 * Captures all statuses (completed, cancelled, assigned, dispatched, arriving, etc.).
 */
export const fetchAllTripsForExport = async (
    filters: ExportFilterParams,
): Promise<ExportTripItem[]> => {
    try {
        // Date range filter for created_at between startDate and endDate
        const dateFilter: RequestFilterItem = {
            column: 'created_at',
            operator: 'BETWEEN',
            value: [filters.startDate, filters.endDate],
        };

        const payload: GetAmbulanceRequestPayload = {
            pageIndex: 1,
            pageSize: 1000, // Fetch all records for the date range
            sortKey: 'created_at',
            sortValue: 'DESC',
            filters: [dateFilter],
        };

        console.log('📡 [EXPORT SERVICE] Fetching ALL trips for dates:', payload);
        const res = await getAmbulanceRequestApi(payload);

        let dataItems: AmbulanceRequestItem[] = [];
        const rawData: any = res?.data?.data;
        const rawRes: any = res?.data;

        if (Array.isArray(rawData)) {
            dataItems = rawData;
        } else if (Array.isArray(rawData?.records)) {
            dataItems = rawData.records;
        } else if (Array.isArray(rawData?.items)) {
            dataItems = rawData.items;
        } else if (Array.isArray(rawData?.rows)) {
            dataItems = rawData.rows;
        } else if (Array.isArray(rawRes?.result)) {
            dataItems = rawRes.result;
        } else if (Array.isArray(rawRes?.records)) {
            dataItems = rawRes.records;
        } else if (Array.isArray(rawRes)) {
            dataItems = rawRes;
        }

        return dataItems.map(normalizeItemForExport);
    } catch (error) {
        console.warn('❌ [EXPORT SERVICE] Error fetching all trips for dates:', error);
        throw error;
    }
};

/**
 * Downloads the Excel (.xlsx) file directly into the device's Downloads directory.
 */
export const downloadTripReportToDevice = async (
    trips: ExportTripItem[],
    filters: ExportFilterParams,
): Promise<{ success: boolean; fileName?: string }> => {
    if (!trips || trips.length === 0) {
        Alert.alert(
            'No Trips in Date Range',
            `There are no trips between ${filters.startDate} and ${filters.endDate} to download.`,
        );
        return { success: false };
    }

    try {
        const { base64Xlsx } = generateTripExcelReport(trips, filters);
        const fileName = `Trip_Report_${filters.startDate}_to_${filters.endDate}.xlsx`;
        const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        if (DownloadModule && typeof DownloadModule.downloadFile === 'function') {
            await DownloadModule.downloadFile(base64Xlsx, fileName, mimeType);
            Alert.alert(
                'Download Complete ✅',
                `File saved to your device Downloads folder:\n\n📁 ${fileName}`,
                [{ text: 'OK' }],
            );
            return { success: true, fileName };
        } else {
            Alert.alert(
                'Notice',
                'Download module not available. Please restart the app.',
            );
            return { success: false };
        }
    } catch (error: any) {
        console.warn('❌ [EXPORT SERVICE] Download error:', error);
        Alert.alert('Download Error', error?.message || 'Could not download trip history report.');
        return { success: false };
    }
};
