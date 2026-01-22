import React, { useState } from 'react';
import styled from 'styled-components';
import FinancialKPICards from '../../components/Finance/FinancialKPICards';
import WasteAnalyticsChart from '../../components/Finance/WasteAnalyticsChart';
import ExpenseBreakdownChart from '../../components/Finance/ExpenseBreakdownChart';
import RewardRequestsTable from '../../components/Finance/RewardRequestsTable';
import { Toaster } from 'react-hot-toast';

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
    return (
        <PageContainer>
            <Toaster position="top-right" />

            <Header>
                <Title>Finance & Rewards</Title>
                <Subtitle>Manage financial overview and citizen reward approvals</Subtitle>
            </Header>

            <FinancialKPICards />

            <ChartsGrid>
                <WasteAnalyticsChart />
                <ExpenseBreakdownChart />
            </ChartsGrid>

            <RewardRequestsTable />
        </PageContainer>
    );
};

export default Finance;
