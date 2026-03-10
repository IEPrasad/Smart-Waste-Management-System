import React from 'react';
import styled from 'styled-components';
import { DollarSign, TrendingUp, TrendingDown, Scale, Trash2 } from 'lucide-react';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${props => props.$gradient};
  border-radius: 20px;
  padding: 24px;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.div`
  font-size: 14px;
  opacity: 0.9;
  font-weight: 600;
`;

const Value = styled.div`
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const Trend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  opacity: 0.95;
`;

const FinancialKPICards = ({ stats }) => {
  const metrics = [
    {
      label: 'Total Income',
      value: `LKR ${stats.totalIncome.toLocaleString()}`,
      trend: '+12% from last month',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      icon: DollarSign
    },
    {
      label: 'Total Expenses',
      value: `LKR ${stats.totalExpenses.toLocaleString()}`,
      trend: '+8% from last month',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      icon: TrendingDown
    },
    {
      label: 'Net Balance',
      value: `LKR ${stats.netBalance.toLocaleString()}`,
      trend: '+22% from last month',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      icon: Scale
    },
    {
      label: 'Waste Collected',
      value: `${stats.totalWaste.toFixed(1)} tonnes`,
      trend: '+6% from last week',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      icon: Trash2
    }
  ];

  return (
    <Grid>
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trendUp ? TrendingUp : TrendingDown;

        return (
          <Card key={idx} $gradient={metric.gradient}>
            <Header>
              <Label>{metric.label}</Label>
              <IconWrapper>
                <Icon size={24} />
              </IconWrapper>
            </Header>
            <Value>{metric.value}</Value>
            <Trend>
              <TrendIcon size={16} />
              {metric.trend}
            </Trend>
          </Card>
        );
      })}
    </Grid>
  );
};

export default FinancialKPICards;
