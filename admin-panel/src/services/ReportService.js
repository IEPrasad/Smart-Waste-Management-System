import { supabase } from '../lib/supabaseClient';

/**
 * Aggregates operational data for the dashboard report.
 * @returns {Promise<Object>} The aggregated report data.
 */
export const generateOperationalReportData = async () => {
    try {
        // 1. Fetch Driver Metrics
        const { data: drivers, error: driverError } = await supabase
            .from('driver')
            .select('id, full_name, is_online, current_vehicle_id');

        if (driverError) throw driverError;

        // 2. Fetch Waste Analytics per Division
        const { data: pickupLogs, error: logsError } = await supabase
            .from('pickup_logs')
            .select('gn_division, compost_weight, recycling_weight, status, created_at');

        if (logsError) throw logsError;

        // 3. Fetch Fleet/Request Status & Detailed Issues
        const [pendingRes, ongoingRes, totalIssuesRes, pendingIssuesRes, resolvedIssuesRes] = await Promise.all([
            supabase.from('waste_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('pickups').select('id', { count: 'exact', head: true }).eq('status', 'ongoing'),
            supabase.from('waste_issues').select('id', { count: 'exact', head: true }),
            supabase.from('waste_issues').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('waste_issues').select('id', { count: 'exact', head: true }).eq('status', 'resolved')
        ]);

        // Process Division Data & Monthly Trends
        const divisionStats = {};
        const monthlyTrends = {};

        pickupLogs.forEach(log => {
            // Division Stats
            const div = log.gn_division || 'Other';
            if (!divisionStats[div]) {
                divisionStats[div] = { compost: 0, recycle: 0, total: 0 };
            }
            divisionStats[div].compost += Number(log.compost_weight || 0);
            divisionStats[div].recycle += Number(log.recycling_weight || 0);
            divisionStats[div].total += 1;

            // Monthly Trends
            const date = new Date(log.created_at);
            if (!isNaN(date.getTime())) {
                const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                if (!monthlyTrends[monthKey]) {
                    monthlyTrends[monthKey] = { name: monthKey, compost: 0, recycle: 0, sortKey: date.getTime() };
                }
                monthlyTrends[monthKey].compost += Number(log.compost_weight || 0);
                monthlyTrends[monthKey].recycle += Number(log.recycling_weight || 0);
            }
        });

        const formattedDivisions = Object.entries(divisionStats).map(([name, stats]) => ({
            name,
            ...stats
        })).sort((a, b) => (b.compost + b.recycle) - (a.compost + a.recycle));

        const formattedMonthly = Object.values(monthlyTrends)
            .sort((a, b) => a.sortKey - b.sortKey)
            .map(({ name, compost, recycle }) => ({ name, compost, recycle }));

        // Summary Calculations
        const totalWaste = pickupLogs.reduce((sum, log) => sum + Number(log.compost_weight || 0) + Number(log.recycling_weight || 0), 0);
        const onlineDrivers = drivers.filter(d => d.is_online).length;

        return {
            generatedAt: new Date().toLocaleString(),
            summary: {
                totalWaste: totalWaste.toFixed(2),
                activeDrivers: onlineDrivers,
                totalDrivers: drivers.length,
                pendingRequests: pendingRes.count || 0,
                ongoingPickups: ongoingRes.count || 0,
                issues: {
                    total: totalIssuesRes.count || 0,
                    pending: pendingIssuesRes.count || 0,
                    resolved: resolvedIssuesRes.count || 0
                }
            },
            drivers: drivers.map(d => ({
                name: d.full_name,
                status: d.is_online ? 'Online' : 'Offline',
                vehicle: d.current_vehicle_id ? 'Assigned' : 'Unassigned'
            })),
            divisions: formattedDivisions,
            trends: formattedMonthly
        };
    } catch (error) {
        console.error('Error generating report data:', error);
        throw error;
    }
};
