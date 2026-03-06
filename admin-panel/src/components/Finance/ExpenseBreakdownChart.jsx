import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Truck } from 'lucide-react';

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748B;
  margin: 0;
`;

const ChartContainer = styled.div`
  height: 280px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E2E8F0;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748B;
  font-weight: 600;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #0F172A;
`;

const ExpenseBreakdownChart = ({ data, totalDriverCosts, totalVehicleCosts }) => {
  return (
    <Card>
      <Header>
        <Title>Expense Breakdown</Title>
        <Subtitle>Monthly comparison</Subtitle>
      </Header>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => `LKR ${(value / 1000).toFixed(0)}K`}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="drivers" name="Driver Costs" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
            <Bar dataKey="vehicles" name="Vehicle Costs" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <Stats>
        <StatItem>
          <StatIcon $bg="#EFF6FF" $color="#3B82F6">
            <Users size={20} />
          </StatIcon>
          <StatInfo>
            <StatLabel>Driver Costs</StatLabel>
            <StatValue>LKR {(totalDriverCosts / 1000000).toFixed(1)}M</StatValue>
          </StatInfo>
        </StatItem>
        <StatItem>
          <StatIcon $bg="#FFFBEB" $color="#F59E0B">
            <Truck size={20} />
          </StatIcon>
          <StatInfo>
            <StatLabel>Vehicle Costs</StatLabel>
            <StatValue>LKR {(totalVehicleCosts / 1000).toFixed(0)}K</StatValue>
          </StatInfo>
        </StatItem>
      </Stats>
    </Card>
  );
};

export default ExpenseBreakdownChart;
