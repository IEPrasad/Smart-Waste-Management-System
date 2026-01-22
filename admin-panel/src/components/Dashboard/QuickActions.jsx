import React, { useState } from 'react';
import styled from 'styled-components';
import { FileText, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DriverContactModal from './DriverContactModal';

const Container = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E2E8F0;
`;

const Title = styled.h3`
  font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const ActionButton = styled.button`
  background: white;
  border: 1px solid #CBD5E1; 
  border-radius: 12px;
  padding: 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); /* Strong consistent shadow */
  color: #0F172A;
  
  &:active {
    background: #F8FAFC;
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
`;

const Label = styled.span`
  font-size: 12px; font-weight: 600; color: inherit;
`;

const QuickActions = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleAction = (action) => {
    if (action === 'Contact Drivers') {
      setIsContactOpen(true);
      return;
    }
    toast.success(`Action triggered: ${action}`);
  };

  return (
    <Container>
      <Title>Quick Actions</Title>
      <Grid>
        <ActionButton onClick={() => handleAction('Export Report')}>
          <FileText size={20} color="#3B82F6" />
          <Label>Report</Label>
        </ActionButton>
        <ActionButton onClick={() => handleAction('Contact Drivers')}>
          <Phone size={20} color="#22C55E" />
          <Label>Drivers</Label>
        </ActionButton>
      </Grid>

      <DriverContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </Container>
  );
};

export default QuickActions;
