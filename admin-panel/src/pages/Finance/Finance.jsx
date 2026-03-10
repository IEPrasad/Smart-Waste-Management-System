import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FinancialKPICards from '../../components/Finance/FinancialKPICards';
import WasteAnalyticsChart from '../../components/Finance/WasteAnalyticsChart';
import ExpenseBreakdownChart from '../../components/Finance/ExpenseBreakdownChart';
import RewardRequestsTable from '../../components/Finance/RewardRequestsTable';
import { Toaster } from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8FAFC;
  padding: 32px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #64748B;
  margin: 0;
  font-size: 14px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Finance = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    totalWaste: 0,
    compost: { weight: 0, percentage: 0 },
    recycle: { weight: 0, percentage: 0 }
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // Fetch Pickup Logs for Waste & Operation Costs
      const { data: logs, error: logsError } = await supabase
        .from('pickup_logs')
        .select('*')
        .eq('status', 'completed');

      if (logsError) throw logsError;

      // Fetch Withdrawal Requests for Reward Expenses
      const { data: withdrawals, error: withError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('status', 'approved');

      if (withError) throw withError;

      // Aggregations
      let totalCompost = 0;
      let totalRecycle = 0;
      const monthlyMap = {};

      logs.forEach(log => {
        const cWeight = Number(log.compost_weight || 0);
        const rWeight = Number(log.recycling_weight || 0);
        totalCompost += cWeight;
        totalRecycle += rWeight;

        // Monthly breakdown
        const date = new Date(log.created_at);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { month: monthKey, drivers: 0, vehicles: 0, recyclables: 0 };
        }

        // Operational Cost Estimates
        monthlyMap[monthKey].drivers += (cWeight + rWeight) * 8;
        monthlyMap[monthKey].vehicles += (cWeight + rWeight) * 4;
      });

      const totalWaste = totalCompost + totalRecycle;

      // Reward Expenses
      let totalRewards = 0;
      withdrawals.forEach(w => {
        totalRewards += Number(w.amount || 0);
        const date = new Date(w.requested_at);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        // Note: We only add rewards to months that have pickup logs too for chart simplicity
        if (monthlyMap[monthKey]) {
          monthlyMap[monthKey].drivers += Number(w.amount || 0); // Include rewards in "Driver/Personal" related costs
        }
      });

      const totalDriverCosts = totalWaste * 8 + totalRewards;
      const totalVehicleCosts = totalWaste * 4;
      const totalExpenses = totalDriverCosts + totalVehicleCosts;
      const totalIncome = totalWaste * 25; // Management Revenue Estimate

      setStats({
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        totalWaste: totalWaste / 1000, // in tonnes
        compost: { weight: totalCompost, percentage: totalWaste > 0 ? (totalCompost / totalWaste) * 100 : 0 },
        recycle: { weight: totalRecycle, percentage: totalWaste > 0 ? (totalRecycle / totalWaste) * 100 : 0 }
      });

      // Convert map to sorted array (last 4 months)
      const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sortedMonthly = Object.values(monthlyMap).sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
      setMonthlyData(sortedMonthly.slice(-4));

    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initialOptions = {
    "client-id": "test", // Replace with your real PayPal Client ID later
    currency: "USD",
    intent: "capture",
    components: "buttons,card-fields",
    "data-sdk-integration-source": "react-paypal-js",
  };

  if (loading) return <PageContainer>Loading metrics...</PageContainer>;

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PageContainer>
        <Toaster position="top-right" />

        <Header>
          <Title>Finance & Rewards</Title>
          <Subtitle>Manage financial overview and citizen reward approvals</Subtitle>
        </Header>

        <FinancialKPICards stats={stats} />

        <ChartsGrid>
          <WasteAnalyticsChart compost={stats.compost} recycle={stats.recycle} />
          <ExpenseBreakdownChart data={monthlyData} totalDriverCosts={stats.totalExpenses - (stats.totalWaste * 1000 * 4)} totalVehicleCosts={stats.totalWaste * 1000 * 4} />
        </ChartsGrid>

        <RewardRequestsTable />
      </PageContainer>
    </PayPalScriptProvider>
  );
};

export default Finance;
