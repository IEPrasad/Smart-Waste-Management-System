import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Radio, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  height: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;
  display: flex; align-items: center; gap: 8px;
`;

const LiveBadge = styled.span`
  background: #FEF2F2; color: #EF4444;
  font-size: 11px; font-weight: 700; padding: 2px 8px;
  border-radius: 99px; display: flex; align-items: center; gap: 4px; border: 1px solid #FECACA;
`;

const Pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const Dot = styled.div`
  width: 6px; height: 6px; border-radius: 50%; background: #EF4444;
  animation: ${Pulse} 2s infinite ease-in-out;
`;

const FeedList = styled.div`
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 12px;
  padding-right: 4px;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
`;

const FeedItem = styled.div`
  display: flex; gap: 12px;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 12px;
  border: 1px solid #F1F5F9;
  font-size: 13px; color: #334155;
  animation: fadeIn 0.3s ease-in-out;
`;

const IconWrapper = styled.div`
  width: 32px; height: 32px; border-radius: 8px;
  background: ${props => props.$bg}; color: ${props => props.$color};
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;

const Time = styled.span`
  font-size: 11px; color: #94A3B8; display: block; margin-top: 4px;
`;

const MOCK_EVENTS = [
    { id: 1, type: 'truck', msg: 'Vehicle NA-1234 started Route A', time: 'Just now', icon: Truck, color: '#3B82F6', bg: '#EFF6FF' },
    { id: 2, type: 'issue', msg: 'New High Priority Issue reported in Zone B', time: '2 mins ago', icon: AlertCircle, color: '#EF4444', bg: '#FEF2F2' },
    { id: 3, type: 'resolve', msg: 'Driver Lahiru resolved Issue #421', time: '15 mins ago', icon: CheckCircle2, color: '#22C55E', bg: '#F0FDF4' },
    { id: 4, type: 'truck', msg: 'Vehicle LC-5566 completed Route C', time: '32 mins ago', icon: Truck, color: '#3B82F6', bg: '#EFF6FF' },
];

const LiveActivityFeed = () => {
    return (
        <Card>
            <Header>
                <Title>
                    <Radio size={18} /> Live Activity
                </Title>
                <LiveBadge><Dot /> LIVE</LiveBadge>
            </Header>
            <FeedList>
                {MOCK_EVENTS.map(event => {
                    const Icon = event.icon;
                    return (
                        <FeedItem key={event.id}>
                            <IconWrapper $bg={event.bg} $color={event.color}>
                                <Icon size={16} />
                            </IconWrapper>
                            <div>
                                <div style={{ fontWeight: 500 }}>{event.msg}</div>
                                <Time>{event.time}</Time>
                            </div>
                        </FeedItem>
                    );
                })}
            </FeedList>
        </Card>
    );
};

export default LiveActivityFeed;
