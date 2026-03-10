import React, { useState } from 'react';
import styled from 'styled-components';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { BarChart3, LineChart as LineIcon, Calendar } from 'lucide-react';

const Card = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex; flex-direction: column; gap: 20px;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
`;

const Title = styled.h3`
  font-size: 18px; color: #0F172A; margin: 0; font-weight: 700;
  display: flex; align-items: center; gap: 8px;
`;

const Controls = styled.div`
  display: flex; gap: 8px; background: #F1F5F9; padding: 4px; border-radius: 12px;
`;

const ToggleBtn = styled.button`
  border: none; background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#0F172A' : '#64748B'};
  padding: 6px 12px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  display: flex; align-items: center; gap: 6px;
  transition: all 0.2s;

  &:hover { color: #0F172A; }
`;

// Mock Data
const DATA = [
    { name: 'Mon', compost: 400, recycle: 240 },
    { name: 'Tue', compost: 300, recycle: 139 },
    { name: 'Wed', compost: 200, recycle: 980 }, // Organic Day peak maybe?
    { name: 'Thu', compost: 278, recycle: 390 },
    { name: 'Fri', compost: 189, recycle: 480 },
    { name: 'Sat', compost: 239, recycle: 380 },
    { name: 'Sun', compost: 349, recycle: 430 },
];

const WasteTrendsChart = () => {
    const [viewType, setViewType] = useState('bar'); // 'bar' | 'line'

    return (
        <Card>
            <Header>
                <Title><Calendar size={20} color="#64748B" /> Collection Trends</Title>
                <Controls>
                    <ToggleBtn $active={viewType === 'bar'} onClick={() => setViewType('bar')}>
                        <BarChart3 size={16} /> Bar
                    </ToggleBtn>
                    <ToggleBtn $active={viewType === 'line'} onClick={() => setViewType('line')}>
                        <LineIcon size={16} /> Line
                    </ToggleBtn>
                </Controls>
            </Header>

            <div style={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {viewType === 'bar' ? (
                        <BarChart data={DATA} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: '#F1F5F9' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="compost" name="Organic (kg)" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={32} />
                            <Bar dataKey="recycle" name="Recycle (kg)" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                    ) : (
                        <AreaChart data={DATA}>
                            <defs>
                                <linearGradient id="colorCompost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRecycle" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area type="monotone" dataKey="compost" name="Organic (kg)" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorCompost)" />
                            <Area type="monotone" dataKey="recycle" name="Recycle (kg)" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRecycle)" />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default WasteTrendsChart;
