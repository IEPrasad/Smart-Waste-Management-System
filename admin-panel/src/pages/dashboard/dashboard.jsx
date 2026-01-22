import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabaseClient';
import CityHealthIndex from '../../components/Dashboard/CityHealthIndex';
import LiveActivityFeed from '../../components/Dashboard/LiveActivityFeed';
import CriticalAlerts from '../../components/Dashboard/CriticalAlerts';
import QuickActions from '../../components/Dashboard/QuickActions';
import WasteTrendsChart from '../../components/Dashboard/WasteTrendsChart';
import { Toaster, toast } from 'react-hot-toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8FAFC;
  padding: 32px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: flex; flex-direction: column; gap: 24px;
`;

// --- Mock Greeting Logic ---
const Greetings = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12) timeGreeting = 'Good Afternoon';
    if (hour >= 18) timeGreeting = 'Good Evening';

    return (
        <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>{timeGreeting}, Admin</h1>
            <p style={{ color: '#64748B', fontSize: '16px', margin: 0 }}>Here is your city's waste management overview.</p>
        </div>
    );
};

const Dashboard = () => {
    return (
        <PageContainer>
            <Toaster position="top-right" />
            <Greetings />

            <ContentGrid>
                {/* Left Column (Main Stats) */}
                <Column>
                    <CityHealthIndex />
                    <WasteTrendsChart />
                    <div style={{ background: '#EFF6FF', padding: '24px', borderRadius: '24px', border: '1px solid #BFDBFE' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#1E40AF' }}>System Status</h3>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 600, textTransform: 'uppercase' }}>Active Trucks</div>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E40AF' }}>24<span style={{ fontSize: '14px', color: '#60A5FA', fontWeight: 500 }}>/28</span></div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 600, textTransform: 'uppercase' }}>Completed Routes</div>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E40AF' }}>12</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 600, textTransform: 'uppercase' }}>Pending Issues</div>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E40AF' }}>5</div>
                            </div>
                        </div>
                    </div>
                </Column>

                {/* Right Column (Sidebar) */}
                <Column>
                    <CriticalAlerts />
                    <QuickActions />
                    <LiveActivityFeed />
                </Column>
            </ContentGrid>
        </PageContainer>
    );
};

export default Dashboard;