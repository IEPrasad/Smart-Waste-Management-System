import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
`;

const Content = styled(motion.div)`
  background: white;
  width: 100%; max-width: 600px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-height: 85vh;
  display: flex; flex-direction: column;
`;

const Header = styled.div`
  padding: 24px;
  background: #FEF2F2;
  border-bottom: 1px solid #FECACA;
  display: flex; justify-content: space-between; align-items: flex-start;
`;

const TitleBlock = styled.div``;

const Title = styled.h3`
  font-size: 20px; font-weight: 800; color: #991B1B; margin: 0 0 4px 0;
  display: flex; align-items: center; gap: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px; color: #B91C1C; margin: 0; opacity: 0.9;
`;

const CloseButton = styled.button`
  background: #EF4444;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;

  &:hover {
    background: #DC2626;
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
  }
`;

const Body = styled.div`
  padding: 0;
  overflow-y: auto;
  background: #FAFAFA;
`;

const IssueItem = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
  background: white;
  transition: all 0.2s;
  
  &:hover {
    background: #FEF2F2;
  }
`;

const IssueHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
`;

const SeverityBadge = styled.span`
  background: #FEF2F2; color: #DC2626;
  font-size: 11px; font-weight: 700; padding: 4px 10px;
  border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px;
  border: 1px solid #FECACA;
`;

const Time = styled.span`
  font-size: 13px; color: #6B7280; display: flex; align-items: center; gap: 4px;
`;

const Description = styled.p`
  font-size: 15px; color: #1F2937; margin: 0 0 12px 0; line-height: 1.5; font-weight: 500;
`;

const Location = styled.div`
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #4B5563;
  margin-bottom: 16px;
`;

const Actions = styled.div`
  display: flex; gap: 12px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s;
  border: none;
  
  ${props => props.$primary ? `
    background: #DC2626; color: white;
    &:hover { background: #B91C1C; }
  ` : `
    background: white; color: #4B5563; border: 1px solid #E5E7EB;
    &:hover { background: #F3F4F6; color: #111827; }
  `}
`;

// Mock Data for specific critical view
const CRITICAL_ISSUES = [
  { id: 101, type: 'Hazardous Spill', desc: 'Chemical leakage reported near School Zone.', location: 'Zone A - Main St', time: '10 mins ago' },
  { id: 102, type: 'Blocked Access', desc: 'Garbage truck cannot access narrow lane due to illegal parking.', location: 'Zone C - 5th Ave', time: '25 mins ago' },
  { id: 103, type: 'Overflowing Bin', desc: 'Major overflow at central market causing health risk.', location: 'Zone B - Market', time: '1 hour ago' },
];

const CriticalIssuesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Content
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <Header>
            <TitleBlock>
              <Title><AlertTriangle size={24} /> Critical Issues</Title>
              <Subtitle>3 High-Priority incidents require immediate attention</Subtitle>
            </TitleBlock>
            <CloseButton onClick={onClose}><X size={20} strokeWidth={2.5} /></CloseButton>
          </Header>

          <Body>
            {CRITICAL_ISSUES.map(issue => (
              <IssueItem key={issue.id}>
                <IssueHeader>
                  <SeverityBadge>Critical</SeverityBadge>
                  <Time><Clock size={14} /> {issue.time}</Time>
                </IssueHeader>
                <Description>{issue.desc}</Description>
                <Location><MapPin size={14} /> {issue.location}</Location>
                <Actions>
                  <ActionButton>View Details</ActionButton>
                  <ActionButton $primary>Resolve Now <ArrowRight size={14} /></ActionButton>
                </Actions>
              </IssueItem>
            ))}
          </Body>
        </Content>
      </Overlay>
    </AnimatePresence>
  );
};

export default CriticalIssuesModal;
