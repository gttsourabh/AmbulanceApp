import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';

interface TermsSection {
    icon: string;
    title: string;
    content: string;
    clauses?: string[];
}

const TERMS_SECTIONS: TermsSection[] = [
    {
        icon: 'file-certificate-outline',
        title: '1. Driver Agreement & Acceptance',
        content:
            'By accessing or using the Arvaya Ambulance Driver Application, you enter into a binding agreement with Arvaya ("Care · Track · Save Lives"). If you do not agree to these terms, you must not access or operate the platform.',
        clauses: [
            'These terms govern all ambulance drivers providing emergency patient transit and medical dispatch response.',
            'Arvaya acts as an emergency dispatch and real-time coordination technology platform connecting patients, dispatchers, and verified ambulance drivers.',
            'You acknowledge that emergency healthcare transport requires the highest standard of care, promptness, and professional ethics.',
        ],
    },
    {
        icon: 'card-account-details-star-outline',
        title: '2. Eligibility & Document Verification',
        content:
            'Every driver must be fully licensed and legally certified prior to receiving emergency trip assignments:',
        clauses: [
            'Valid Commercial License: Driver must possess a valid, unexpired Commercial Driving License (LMV/HMV) registered in India.',
            'Vehicle Documentation: Ambulance vehicle must have an active RC Book, Commercial Vehicle Insurance, and Pollution Under Control (PUC) certificate.',
            'Verification Status: Drivers with unverified, expired, or rejected documents will be automatically restricted from toggling ONLINE until updated and re-verified.',
            'Duty of Notification: Drivers must notify Arvaya immediately of any license endorsements, vehicle modifications, or accidents.',
        ],
    },
    {
        icon: 'toggle-switch-outline',
        title: '3. Availability, Shifts & Response SLA',
        content:
            'Arvaya provides flexible duty management while upholding critical emergency response benchmarks:',
        clauses: [
            'Online/Offline Status: Toggling your status to "ONLINE" signals full readiness to accept and execute emergency patient dispatch assignments.',
            'Target Response SLA: To fulfill the critical medical objective of response time < 5 minutes, drivers must act promptly upon receiving incoming trip requests.',
            'Accept/Reject Protocol: When an emergency request is presented (with a 20-second dispatch countdown), drivers may accept or reject. Habitual rejection without emergency cause damages patient care and may trigger automated dispatch re-routing and account review.',
            'Shift Discipline: Drivers must toggle "OFFLINE" immediately when taking breaks, fueling, or ending duty.',
        ],
    },
    {
        icon: 'routes',
        title: '4. Trip Lifecycle & Standard Operating Protocol',
        content:
            'Drivers must adhere strictly to the sequential system flow designed for safety and transparency:',
        clauses: [
            'Stage 1 — Acceptance: Review patient pickup location, destination hospital, emergency type, and tap "Accept".',
            'Stage 2 — En-Route to Pickup: Immediately begin navigation toward the patient using the integrated live GPS routing.',
            'Stage 3 — On-Scene Arrival: Upon reaching the patient location, update trip status to "Arrived at Location" / "On-Scene".',
            'Stage 4 — Patient Pickup & OTP Verification: Verify the patient identity by inputting the secure 4-digit pickup OTP provided by the patient/requester before starting transit.',
            'Stage 5 — En-Route to Hospital: Navigate with urgency to the destination hospital. Update status to "Reached Hospital".',
            'Stage 6 — Trip Completion: Hand over patient to the hospital triage team and confirm "Complete Trip" in the app.',
        ],
    },
    {
        icon: 'crosshairs-gps',
        title: '5. GPS Tracking & Navigation Compliance',
        content:
            'Accurate telemetry is vital to dispatching the nearest driver and informing anxious families of arrival times:',
        clauses: [
            'Continuous GPS Telemetry: Driver device GPS location is transmitted every 10 seconds during active navigation and online duty.',
            'Zero Tolerance for Tampering: The use of mock location tools, GPS spoofers, network blockers, or unauthorized third-party modification apps is strictly prohibited and leads to immediate permanent ban.',
            'Low Network Resilience: The application is designed to queue updates in low-network conditions; drivers must ensure device cellular data remains active.',
        ],
    },
    {
        icon: 'ambulance',
        title: '6. Patient Care, Safety & Code of Conduct',
        content:
            'Emergency ambulance operation carries profound public trust and legal accountability:',
        clauses: [
            'Priority Driving: Drive with siren and beacon only when responding to verified emergencies or actively transporting patients; obey all traffic regulations and prioritize road safety.',
            'Patient Dignity & Confidentiality: Maintain strict confidentiality regarding patient identity, medical condition, and emergency details. Photography or sharing of patient information is strictly prohibited.',
            'Zero Substance Tolerance: Absolute zero tolerance for operating an emergency vehicle under the influence of alcohol, narcotics, or fatigue-inducing medication.',
            'Respectful Communication: Maintain polite and reassuring communication with patients, family members, dispatch operators, and hospital staff.',
        ],
    },
    {
        icon: 'currency-inr',
        title: '7. Fares, Earnings & Audit Trail',
        content:
            'All trips, distances, and earnings are governed by transparent, logged records:',
        clauses: [
            'Audit Trail: Every status transition, timestamp, GPS track, and distance calculation is preserved in immutable audit logs.',
            'Earnings Breakdown: Completed trips reflect standard base fare and distance metrics visible in the Earnings tab.',
            'Dispute Resolution: Any fare or route discrepancy may be submitted to Operations with reference to the specific Request ID.',
        ],
    },
    {
        icon: 'shield-alert-outline',
        title: '8. Suspension, Violations & Termination',
        content:
            'Arvaya reserves the right to suspend or terminate driver platform access under the following conditions:',
        clauses: [
            'Failure to maintain valid driving license, vehicle fitness, or insurance documentation.',
            'Unexcused cancellations or abandoning a patient after accepting an emergency trip.',
            'Substantiated patient complaints of reckless driving, extortion, or unprofessional conduct.',
            'Manipulation of trip distances, GPS coordinates, or completion records.',
        ],
    },
];

const TermsConditionsScreen = () => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Header
                backEnabled
                title="Terms & Conditions"
                showRightIcon={false}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Top Banner Card */}
                <View style={styles.topCard}>
                    <View style={styles.badgeRow}>
                        <View style={styles.badgePill}>
                            <AppIcon
                                family="material"
                                name="file-document-edit-outline"
                                size={14}
                                color={colors.primary}
                            />
                            <Text style={styles.badgeText}>DRIVER AGREEMENT</Text>
                        </View>
                        <Text style={styles.versionDate}>Version 1.0 · 2026</Text>
                    </View>

                    <Text style={styles.bannerHeading}>
                        Arvaya Ambulance Service
                    </Text>

                    <Text style={styles.bannerDescription}>
                        Please read these Terms & Conditions carefully. As an ambulance driver, your adherence to these operational protocols ensures rapid emergency response, patient safety, and seamless dispatch coordination.
                    </Text>
                </View>

                {/* Terms Sections */}
                {TERMS_SECTIONS.map((section, idx) => (
                    <View key={idx} style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconCircle}>
                                <AppIcon
                                    family="material"
                                    name={section.icon}
                                    size={20}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.sectionTitle}>
                                {section.title}
                            </Text>
                        </View>

                        <Text style={styles.sectionContent}>
                            {section.content}
                        </Text>

                        {section.clauses && section.clauses.length > 0 && (
                            <View style={styles.clausesContainer}>
                                {section.clauses.map((clause, cIdx) => (
                                    <View key={cIdx} style={styles.clauseRow}>
                                        <View style={styles.clauseBullet}>
                                            <AppIcon
                                                family="material"
                                                name="check"
                                                size={12}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <Text style={styles.clauseText}>
                                            {clause}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                {/* Footer copyright */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerBrand}>Arvaya Driver Platform</Text>
                    <Text style={styles.footerCopyright}>
                        © 2026 Arvaya Inc. Care · Track · Save Lives
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsConditionsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 36,
    },
    topCard: {
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E8EFF1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 0.5,
    },
    versionDate: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 12,
        color: colors.textLight,
        fontWeight: '500',
    },
    bannerHeading: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 6,
        fontFamily: typography.fontFamily.bold,
    },
    bannerDescription: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 13,
        lineHeight: 20,
        color: colors.textSecondary,
    },
    sectionCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EAEFF2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
        fontFamily: typography.fontFamily.semiBold,
    },
    sectionContent: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 13,
        lineHeight: 20,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    clausesContainer: {
        gap: 10,
        paddingLeft: 2,
    },
    clauseRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    clauseBullet: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    clauseText: {
        flex: 1,
        fontFamily: typography.fontFamily.regular,
        fontSize: 13,
        lineHeight: 19,
        color: colors.textPrimary,
    },

    footerContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    footerBrand: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 2,
    },
    footerCopyright: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 11,
        color: colors.textLight,
    },
});
