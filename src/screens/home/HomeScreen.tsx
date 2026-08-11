import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

const HomeScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
         

            {/* --- Main Scrollable Content --- */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* --- Hero Card (Emergency Request) --- */}
                <View style={styles.heroCard}>
                    <View style={styles.heroTextContent}>
                        <Text style={styles.heroSubtext}>Waiting for new</Text>
                        <Text style={styles.heroTitle}>Emergency Request</Text>
                    </View>
                    <View style={styles.heroImagePlaceholder}>
                        <Text style={styles.ambulanceEmoji}>🚑</Text>
                    </View>
                </View>

                {/* --- Today's Overview Section --- */}
                <View style={styles.overviewSection}>
                    <Text style={styles.sectionTitle}>Today's Overview</Text>

                    <View style={styles.overviewCard}>
                        {/* Completed Row */}
                        <View style={styles.overviewRow}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: '#E6F4EA' }]}>
                                    <Text style={{ color: '#137333', fontWeight: 'bold' }}>✓</Text>
                                </View>
                                <Text style={styles.rowLabel}>Completed</Text>
                            </View>
                            <Text style={styles.rowValue}>04</Text>
                        </View>

                        {/* Cancelled Row */}
                        <View style={styles.overviewRow}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: '#FCE8E6' }]}>
                                    <Text style={{ color: '#C5221F', fontWeight: 'bold' }}>✕</Text>
                                </View>
                                <Text style={styles.rowLabel}>Cancelled</Text>
                            </View>
                            <Text style={styles.rowValue}>01</Text>
                        </View>

                        {/* Earnings Row */}
                        <View style={[styles.overviewRow, styles.lastRow]}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: '#FEF3E1' }]}>
                                    <Text style={{ color: '#E37400', fontWeight: 'bold' }}>₹</Text>
                                </View>
                                <Text style={styles.rowLabel}>Earnings</Text>
                            </View>
                            <Text style={styles.rowValue}>₹1,250</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FD',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F8F9FD',
    },
    menuIcon: {
        fontSize: 24,
        color: '#1A2541',
    },
    bellIcon: {
        fontSize: 20,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#16A34A',
        marginRight: 6,
    },
    onlineText: {
        fontFamily: 'GoogleSans-Bold',
        color: '#16A34A',
        fontSize: 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    heroCard: {
        backgroundColor: '#F0F5FF',
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    heroTextContent: {
        flex: 1,
    },
    heroSubtext: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    heroTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 18,
        color: '#1A2541',
    },
    heroImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ambulanceEmoji: {
        fontSize: 45,
    },
    overviewSection: {
        marginHorizontal: 20,
        marginTop: 30,
    },
    sectionTitle: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 18,
        color: '#1A2541',
        marginBottom: 15,
    },
    overviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    overviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    rowLabel: {
        fontFamily: 'GoogleSans-Medium',
        fontSize: 16,
        color: '#4B5563',
    },
    rowValue: {
        fontFamily: 'GoogleSans-Bold',
        fontSize: 18,
        color: '#1A2541',
    }
});