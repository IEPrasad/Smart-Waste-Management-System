import React from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Leaf, Recycle } from 'lucide-react';

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

const WasteAnalyticsChart = ({ compost, recycle }) => {
  const pieData = [
    { name: 'Compost', value: Number(compost.weight), color: '#22C55E' },
    { name: 'Recycle', value: Number(recycle.weight), color: '#3B82F6' }
  ];

  return (
    <Card>
      <Header>
        <Title>Waste Analytics</Title>
        <Subtitle>Distribution and trends</Subtitle>
      </Header>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} tonnes`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <Stats>
        <StatItem>
          <StatIcon $bg="#F0FDF4" $color="#22C55E">
            <Leaf size={20} />
          </StatIcon>
          <StatInfo>
            <StatLabel>Compost</StatLabel>
            <StatValue>{(compost.weight / 1000).toFixed(1)}t</StatValue>
          </StatInfo>
        </StatItem>
        <StatItem>
          <StatIcon $bg="#EFF6FF" $color="#3B82F6">
            <Recycle size={20} />
          </StatIcon>
          <StatInfo>
            <StatLabel>Recycle</StatLabel>
            <StatValue>{(recycle.weight / 1000).toFixed(1)}t</StatValue>
          </StatInfo>
        </StatItem>
      </Stats>
    </Card>
  );
};

export default WasteAnalyticsChart;
