import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '../../theme';
import { AppIcon } from '../../icons';
import Header from '../../components/Header/Header';

interface PolicySection {
    icon: string;
    title: string;
    description: string;
    bulletPoints?: string[];
}

const POLICY_SECTIONS: PolicySection[] = [
    {
        icon: 'shield-check-outline',
        title: '1. Overview & Commitment',
        description:
            'Arvaya ("Care · Track · Save Lives") operates an advanced emergency ambulance tracking and dispatch ecosystem. We are committed to protecting the privacy, confidentiality, and security of our drivers, emergency medical technicians, and the patients we serve.',
        bulletPoints: [
            'Applies to all licensed ambulance drivers utilizing the Arvaya Driver Mobile Application.',
            'Ensures compliance with national digital healthcare and data privacy frameworks.',
            'Governs collection, processing, and storage of location, trip, and credential data.',
        ],
    },
    {
        icon: 'map-marker-radius-outline',
        title: '2. Real-Time GPS Location Data',
        description:
            'Continuous and background location tracking is essential to the core functionality of the Arvaya emergency response system.',
        bulletPoints: [
            'Foreground & Background GPS: Live GPS coordinates are collected every 10 seconds while your availability is set to ONLINE or during an active emergency trip.',
            'Automated Dispatching: Location data enables the admin dispatcher to assign the nearest available ambulance within the configured zone to critical patients.',
            'Live Navigation & ETA: Used with Google Maps Platform to provide real-time turn-by-turn routing and calculate precise ETA (<10s latency).',
            'Trip Status Sharing: Live vehicle location is securely transmitted to the assigned patient and hospital during En-Route and On-Scene phases.',
            'Offline Privacy: When toggled to OFFLINE, background location tracking is automatically paused.',
        ],
    },
    {
        icon: 'card-account-details-outline',
        title: '3. Information We Collect',
        description:
            'To maintain compliance, regulatory verification, and operational readiness, Arvaya collects and verifies the following driver data:',
        bulletPoints: [
            'Identity & Contact: Full name, mobile number, emergency contact, and profile photograph.',
            'Licensing & Credentials: Commercial driving license number, validity, and document images.',
            'Vehicle Information: Ambulance registration number, RC book, vehicle type, insurance certificate, and pollution certificate status.',
            'Device & Telemetry: FCM registration token (for emergency push notifications), device model, battery status, and network connection quality.',
            'Trip & Operational Data: Trip records, pickup/drop coordinates, patient emergency type, response duration, and distance logged.',
        ],
    },
    {
        icon: 'cog-transfer-outline',
        title: '4. How We Use Your Information',
        description:
            'Collected information is strictly utilized to operate and improve emergency ambulance services:',
        bulletPoints: [
            'Emergency Assignment: Routing urgent SOS requests to drivers with the fastest arrival potential (< 5 min target response).',
            'Trip Verification: Authenticating patient pickup via digital OTP verification at the scene.',
            'Audit Trail & Accountability: Maintaining complete trip history, route overviews, and compliance logs for safety audits.',
            'Earnings & Records: Calculating completed trip summaries, distance, and driver compensation accurately.',
        ],
    },
    {
        icon: 'account-group-outline',
        title: '5. Data Sharing & Disclosure',
        description:
            'Data is shared exclusively on a need-to-know basis to ensure immediate life-saving medical transport:',
        bulletPoints: [
            'With Patients: Driver name, mobile contact, ambulance vehicle number, and live map tracking during active trips.',
            'With Dispatchers & Hospitals: Online availability, current location, emergency trip status, and estimated hospital arrival times.',
            'Third-Party Partners: Google Maps Platform (mapping), Firebase Cloud Messaging (instant alert delivery), and SMS gateways.',
            'Zero Commercial Sale: Arvaya never sells, leases, or monetizes personal or operational driver data to third-party marketers.',
        ],
    },
    {
        icon: 'lock-outline',
        title: '6. Data Security & Storage',
        description:
            'We enforce enterprise-grade security protocols to protect driver and mission-critical data:',
        bulletPoints: [
            'Encrypted Communication: All API requests are transmitted over secure TLS 1.3 / SSL encrypted connections.',
            'Role-Based Access Control (RBAC): Strict administrative permissions ensure only authorized dispatchers view driver logs.',
            'Encrypted Tokens: Driver session tokens are securely persisted in encrypted mobile storage.',
            'High Availability: Infrastructure is engineered for 24/7 operations with 99.5% uptime SLA.',
        ],
    },
    {
        icon: 'account-cog-outline',
        title: '7. Driver Rights & Account Control',
        description:
            'As an Arvaya driver, you maintain transparency and control over your profile and credentials:',
        bulletPoints: [
            'View & Update: Access and review your verified documents, contact details, and vehicle details via the Profile tab.',
            'Status Toggle: Freely control your duty availability between ONLINE and OFFLINE.',
            'Data Enquiries: Request historical trip exports or account closure by contacting Arvaya Operations.',
        ],
    },
];

const PrivacyPolicyScreen = () => {
    const handleEmailSupport = () => {
        Linking.openURL('mailto:privacy@arvaya.com?subject=Arvaya%20Driver%20Privacy%20Inquiry');
    };

    const handleCallSupport = () => {
        Linking.openURL('tel:+918012345678');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Header
                backEnabled
                title="Privacy Policy"
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
                                name="shield-check"
                                size={14}
                                color={colors.primary}
                            />
                            <Text style={styles.badgeText}>ARVAYA DRIVER APP</Text>
                        </View>
                        <Text style={styles.versionDate}>Updated: Sep 2026</Text>
                    </View>

                    <Text style={styles.bannerHeading}>
                        Care · Track · Save Lives
                    </Text>

                    <Text style={styles.bannerDescription}>
                        This Privacy Policy describes how the Arvaya Ambulance Tracking System collects, uses, and safeguards your location, vehicle, and profile data when using our emergency driver mobile application.
                    </Text>
                </View>

                {/* Policy Sections */}
                {POLICY_SECTIONS.map((section, idx) => (
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

                        <Text style={styles.sectionDescription}>
                            {section.description}
                        </Text>

                        {section.bulletPoints && section.bulletPoints.length > 0 && (
                            <View style={styles.bulletsContainer}>
                                {section.bulletPoints.map((bp, bIdx) => (
                                    <View key={bIdx} style={styles.bulletRow}>
                                        <View style={styles.bulletDot} />
                                        <Text style={styles.bulletText}>{bp}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                {/* Contact Card */}
                <View style={styles.contactCard}>
                    <View style={styles.contactHeader}>
                        <View style={styles.contactIconCircle}>
                            <AppIcon
                                family="material"
                                name="headphones"
                                size={22}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.contactTextWrapper}>
                            <Text style={styles.contactTitle}>Privacy Questions or Concerns?</Text>
                            <Text style={styles.contactSubtitle}>Our operations team is available 24x7</Text>
                        </View>
                    </View>

                    <View style={styles.contactActionsRow}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleEmailSupport}
                            activeOpacity={0.8}
                        >
                            <AppIcon
                                family="material"
                                name="email-outline"
                                size={16}
                                color={colors.primary}
                            />
                            <Text style={styles.actionButtonText}>Email Privacy Team</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.callButton]}
                            onPress={handleCallSupport}
                            activeOpacity={0.8}
                        >
                            <AppIcon
                                family="material"
                                name="phone-outline"
                                size={16}
                                color={colors.white}
                            />
                            <Text style={[styles.actionButtonText, styles.callButtonText]}>
                                Call Support
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer copyright */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerBrand}>Arvaya Ambulance Tracking System</Text>
                    <Text style={styles.footerCopyright}>
                        © 2026 Arvaya Inc. All rights reserved.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyPolicyScreen;

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
    sectionDescription: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 13,
        lineHeight: 20,
        color: colors.textSecondary,
        marginBottom: 10,
    },
    bulletsContainer: {
        gap: 8,
        paddingLeft: 4,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginTop: 7,
    },
    bulletText: {
        flex: 1,
        fontFamily: typography.fontFamily.regular,
        fontSize: 13,
        lineHeight: 19,
        color: colors.textPrimary,
    },
    contactCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        marginTop: 6,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: colors.primaryLight,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    contactIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactTextWrapper: {
        flex: 1,
    },
    contactTitle: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    contactSubtitle: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 12,
        color: colors.textSecondary,
    },
    contactActionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
    },
    actionButtonText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
    callButton: {
        backgroundColor: colors.primary,
    },
    callButtonText: {
        fontFamily: typography.fontFamily.semiBold,
        color: '#FFFFFF',
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
