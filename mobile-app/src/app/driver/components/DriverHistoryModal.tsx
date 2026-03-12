import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';

interface DriverHistoryModalProps {
    visible: boolean;
    onClose: () => void;
    driverId: string | null;
}

export default function DriverHistoryModal({ visible, onClose, driverId }: DriverHistoryModalProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible && driverId) {
            fetchHistory();
        }
    }, [visible, driverId]);

    const fetchHistory = async () => {
        setLoading(true);
        // Fetch ALL logs for this driver, ordered by newest first
        const { data, error } = await supabase
            .from('pickup_logs')
            .select('*')
            .eq('driver_id', driverId)
            .order('created_at', { ascending: false });

        if (data) {
            setLogs(data);
        } else if (error) {
            console.error("History Error:", error);
        }
        setLoading(false);
    };

    // Helper to get color based on status
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#4CAF50'; // Green
            case 'skipped': return '#2196F3';   // Blue
            case 'pending': return '#FFC107';   // Yellow
            default: return '#999';
        }
    };

    // Helper to format Date & Time
    const formatDateTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    const renderItem = ({ item }: { item: any }) => {
        const { date, time } = formatDateTime(item.created_at || new Date());
        const statusColor = getStatusColor(item.status);

        return (
            <View style={styles.logCard}>
                {/* 1. Header Row: Status & Time */}
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{item.status?.toUpperCase() || 'UNKNOWN'}</Text>
                    </View>
                    <View style={styles.dateTimeBox}>
                        <Text style={styles.dateText}>{date}</Text>
                        <Text style={styles.timeText}>{time}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* 2. Body: Citizen Details */}
                <View style={styles.bodyRow}>
                    <View>
                        <Text style={styles.label}>Citizen Name</Text>
                        <Text style={styles.citizenName}>{item.citizen_name || "Unknown"}</Text>
                    </View>
                    <View>
                        <Text style={[styles.label, {textAlign:'right'}]}>Division</Text>
                        <Text style={styles.divisionText}>{item.gn_division || "N/A"}</Text>
                    </View>
                </View>

                {/* 3. Metrics Row (Weights) - Only show if completed */}
                {item.status === 'completed' && (
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricBox}>
                            <FontAwesome5 name="leaf" size={14} color="#4CAF50" />
                            <Text style={styles.metricLabel}> Compost:</Text>
                            <Text style={styles.metricValue}>{item.compost_weight || 0}g</Text>
                        </View>
                        <View style={styles.metricBox}>
                            <FontAwesome5 name="recycle" size={14} color="#2196F3" />
                            <Text style={styles.metricLabel}> Recycle:</Text>
                            <Text style={styles.metricValue}>{item.recycling_weight || 0}g</Text>
                        </View>
                    </View>
                )}

                {/* 4. Skipped Reason - Only show if skipped */}
                {item.status === 'skipped' && item.note && (
                    <View style={styles.noteBox}>
                        <Text style={styles.noteLabel}>Reason:</Text>
                        <Text style={styles.noteText}>{item.note}</Text>
                    </View>
                )}

                {/* 5. Footer: Location Coords */}
                <View style={styles.footer}>
                    <Ionicons name="location-sharp" size={12} color="#888" />
                    <Text style={styles.coordText}>
                        {item.lat?.toFixed(5)}, {item.lng?.toFixed(5)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Pickup History</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialIcons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {loading ? (
                    <ActivityIndicator size="large" color="#00e5bc" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={logs}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <MaterialIcons name="history" size={50} color="#ccc" />
                                <Text style={styles.emptyText}>No history found yet.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd',
        paddingTop: 20 // Adjust for status bar if needed
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    closeBtn: { padding: 5 },

    listContent: { padding: 15, paddingBottom: 50 },

    // CARD STYLES
    logCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: {
        paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20,
    },
    statusText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    dateTimeBox: { alignItems: 'flex-end' },
    dateText: { fontSize: 12, color: '#666', fontWeight: '600' },
    timeText: { fontSize: 12, color: '#999' },

    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },

    bodyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    label: { fontSize: 10, color: '#999', textTransform: 'uppercase', fontWeight: 'bold' },
    citizenName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    divisionText: { fontSize: 14, color: '#555' },

    metricsContainer: {
        flexDirection: 'row', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10, marginTop: 5
    },
    metricBox: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    metricLabel: { fontSize: 13, color: '#555' },
    metricValue: { fontSize: 13, fontWeight: 'bold', color: '#333', marginLeft: 2 },

    noteBox: { backgroundColor: '#FFEBEE', padding: 10, borderRadius: 8, marginTop: 5 },
    noteLabel: { fontSize: 12, fontWeight: 'bold', color: '#D32F2F' },
    noteText: { fontSize: 13, color: '#D32F2F' },

    footer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'flex-end' },
    coordText: { fontSize: 10, color: '#aaa', marginLeft: 4 },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', fontSize: 16, marginTop: 10 }
});