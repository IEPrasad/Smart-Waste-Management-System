import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AlertTriangle, Wrench } from 'lucide-react';
import CriticalIssuesModal from './CriticalIssuesModal';
import MaintenanceModal from './MaintenanceModal';
import { supabase } from '../../lib/supabaseClient';

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

 
  const [criticalCount, setCriticalCount] = useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  // number updates after resolve
  useEffect(() => {
    if (!isIssuesOpen) {
      loadCounts();
    }
  }, [isIssuesOpen]);

  async function loadCounts() {
    // count high priority 
    const { count: issueCount } = await supabase
      .from('waste_issues')
      .select('id', { count: 'exact', head: true })
      .eq('priority', 'high')
      .eq('status', 'open');

   
    const { count: vehicleCount } = await supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Maintenance');

    setCriticalCount(issueCount || 0);
    setMaintenanceCount(vehicleCount || 0);
  }

  return (
    <Container>
      <AlertCard $color="#EF4444" $bg="#FEF2F2" onClick={() => setIsIssuesOpen(true)}>
        <Header $color="#DC2626"><AlertTriangle size={16} /> Critical Issues</Header>
        <Message>{criticalCount}</Message>
        <Sub $color="#DC2626">Requires immediate attention</Sub>
      </AlertCard>

      <AlertCard $color="#F59E0B" $bg="#FFFBEB" onClick={() => setIsMaintenanceOpen(true)}>
        <Header $color="#D97706"><Wrench size={16} /> Maintenance</Header>
        <Message>{maintenanceCount}</Message>
        <Sub $color="#D97706">Trucks due for service</Sub>
      </AlertCard>

      <CriticalIssuesModal isOpen={isIssuesOpen} onClose={() => setIsIssuesOpen(false)} />
      <MaintenanceModal isOpen={isMaintenanceOpen} onClose={() => setIsMaintenanceOpen(false)} />
    </Container>
  );
};

export default CriticalAlerts;