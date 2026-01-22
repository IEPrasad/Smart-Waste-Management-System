import React from 'react';
import styled from 'styled-components';
import { Activity, TrendingUp, CheckCircle } from 'lucide-react';

const Card = styled.div`
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
`;

const Content = styled.div`
  z-index: 2;
`;

const Title = styled.h2`
  font-size: 18px;
  color: #64748B;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex; align-items: center; gap: 8px;
`;

const Score = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1;
  margin-bottom: 8px;
`;

const Subtext = styled.p`
  font-size: 14px;
  color: #64748B;
  margin: 0;
  display: flex; align-items: center; gap: 6px;
`;

const DialContainer = styled.div`
  width: 120px;
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Simple SVG Radial Dial
const RadialDial = ({ percentage }) => {
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
            <circle
                stroke="#E2E8F0"
                strokeWidth={stroke}
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="#22C55E"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                strokeLinecap="round"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};

const CityHealthIndex = ({ score = 92 }) => {
    return (
        <Card>
            <Content>
                <Title>
                    <Activity size={20} color="#2563EB" />
                    City Health Score
                </Title>
                <Score>{score}%</Score>
                <Subtext>
                    <TrendingUp size={16} color="#22C55E" />
                    <span style={{ color: '#22C55E', fontWeight: 600 }}>+4%</span> from last week
                </Subtext>
            </Content>

            <DialContainer>
                <RadialDial percentage={score} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={24} color="#22C55E" />
                </div>
            </DialContainer>

            {/* Decorative Background Gradient */}
            <div style={{
                position: 'absolute',
                right: '-20px', top: '-20px',
                width: '150px', height: '150px',
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, rgba(255,255,255,0) 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />
        </Card>
    );
};

export default CityHealthIndex;
