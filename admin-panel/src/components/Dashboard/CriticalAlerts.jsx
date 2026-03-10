import React, { useState } from 'react';
import styled from 'styled-components';
import { AlertTriangle, Wrench, Fuel } from 'lucide-react';
import CriticalIssuesModal from './CriticalIssuesModal';
import MaintenanceModal from './MaintenanceModal';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const AlertCard = styled.button`
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid ${props => props.$color};
  background: ${props => props.$bg};
  display: flex; flex-direction: column; gap: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex; align-items: center; gap: 8px;
  font-weight: 700; font-size: 14px;
  color: ${props => props.$color};
`;

const Message = styled.div`
  font-size: 24px; font-weight: 800; color: #0F172A;
`;

const Sub = styled.div`
  font-size: 12px; color: ${props => props.$color}; opacity: 0.9;
`;

const CriticalAlerts = () => {
  const [isIssuesOpen, setIsIssuesOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

  return (
    <Container>
      <AlertCard $color="#EF4444" $bg="#FEF2F2" onClick={() => setIsIssuesOpen(true)}>
        <Header $color="#DC2626"><AlertTriangle size={16} /> Critical Issues</Header>
        <Message>3</Message>
        <Sub>Requires immediate attention</Sub>
      </AlertCard>
      <AlertCard $color="#F59E0B" $bg="#FFFBEB" onClick={() => setIsMaintenanceOpen(true)}>
        <Header $color="#D97706"><Wrench size={16} /> Maintenance</Header>
        <Message>2</Message>
        <Sub>Trucks due for service</Sub>
      </AlertCard>

      <CriticalIssuesModal isOpen={isIssuesOpen} onClose={() => setIsIssuesOpen(false)} />
      <MaintenanceModal isOpen={isMaintenanceOpen} onClose={() => setIsMaintenanceOpen(false)} />
    </Container>
  );
};

export default CriticalAlerts;
