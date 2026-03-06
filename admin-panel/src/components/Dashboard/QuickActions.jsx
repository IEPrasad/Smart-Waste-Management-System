import React, { useState } from 'react';
import styled from 'styled-components';
import { FileText, Phone, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DriverContactModal from './DriverContactModal';
import ReportTemplate from './ReportTemplate';
import { generateOperationalReportData } from '../../services/ReportService';

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
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportReport = async () => {
    setIsGenerating(true);
    const id = toast.loading('Generating operational report...');

    try {
      const data = await generateOperationalReportData();
      setReportData(data);

      // Small timeout to allow the ReportTemplate to render in the DOM
      setTimeout(() => {
        window.print();
        toast.success('Report generated successfully', { id });
        setIsGenerating(false);
      }, 500);

    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Failed to generate report', { id });
      setIsGenerating(false);
    }
  };

  const handleAction = (action) => {
    if (action === 'Contact Drivers') {
      setIsContactOpen(true);
      return;
    }
    if (action === 'Export Report') {
      handleExportReport();
      return;
    }
    toast.success(`Action triggered: ${action}`);
  };

  return (
    <Container>
      <Title>Quick Actions</Title>
      <Grid>
        <ActionButton onClick={() => handleAction('Export Report')} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 size={20} color="#3B82F6" className="animate-spin" />
          ) : (
            <FileText size={20} color="#3B82F6" />
          )}
          <Label>{isGenerating ? 'Wait...' : 'Report'}</Label>
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

      <ReportTemplate data={reportData} />
    </Container>
  );
};

export default QuickActions;
