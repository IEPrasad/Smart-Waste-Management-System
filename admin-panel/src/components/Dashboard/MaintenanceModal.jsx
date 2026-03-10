import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, Truck, ShieldCheck, Activity, Calendar } from 'lucide-react';

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
  width: 100%; max-width: 700px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-height: 85vh;
  display: flex; flex-direction: column;
`;

const Header = styled.div`
  padding: 24px;
  background: #FFFBEB;
  border-bottom: 1px solid #FEF3C7;
  display: flex; justify-content: space-between; align-items: flex-start;
`;

const TitleBlock = styled.div``;

const Title = styled.h3`
  font-size: 20px; font-weight: 800; color: #92400E; margin: 0 0 4px 0;
  display: flex; align-items: center; gap: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px; color: #B45309; margin: 0; opacity: 0.9;
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
  padding: 24px;
  overflow-y: auto;
  background: #FAFAFA;
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px;
`;

const StatValue = styled.div`font-size: 24px; font-weight: 800; color: #1F2937;`;
const StatLabel = styled.div`font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase;`;

const SectionTitle = styled.h4`
    font-size: 14px; color: #4B5563; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;
`;

const TruckItem = styled.div`
    background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
`;

const TruckInfo = styled.div`display: flex; align-items: center; gap: 12px;`;
const TruckIcon = styled.div`
    width: 40px; height: 40px; border-radius: 8px; background: #FFFBEB; color: #D97706;
    display: flex; align-items: center; justify-content: center;
`;

const StatusBar = styled.div`
    flex: 1; max-width: 150px; height: 6px; background: #F3F4F6; border-radius: 6px; overflow: hidden;
    position: relative;
    &::after {
        content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: ${props => props.width};
        background: ${props => props.color};
    }
`;

const ActionBtn = styled.button`
    padding: 6px 12px; background: white; border: 1px solid #E5E7EB; border-radius: 6px;
    font-size: 12px; font-weight: 600; color: #4B5563; cursor: pointer;
    &:hover { background: #EEF2FF; color: #4F46E5; border-color: #C7D2FE; }
`;

const MaintenanceModal = ({ isOpen, onClose }) => {
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
                            <Title><Wrench size={24} /> Fleet Maintenance</Title>
                            <Subtitle>2 Vehicles require service checks</Subtitle>
                        </TitleBlock>
                        <CloseButton onClick={onClose}><X size={20} strokeWidth={2.5} /></CloseButton>
                    </Header>

                    <Body>
                        <StatsGrid>
                            <StatCard>
                                <Truck size={20} color="#3B82F6" style={{ marginBottom: 4 }} />
                                <StatValue>28</StatValue>
                                <StatLabel>Total Fleet</StatLabel>
                            </StatCard>
                            <StatCard>
                                <Activity size={20} color="#22C55E" style={{ marginBottom: 4 }} />
                                <StatValue>24</StatValue>
                                <StatLabel>Active</StatLabel>
                            </StatCard>
                            <StatCard>
                                <Wrench size={20} color="#D97706" style={{ marginBottom: 4 }} />
                                <StatValue style={{ color: '#D97706' }}>2</StatValue>
                                <StatLabel>In Service</StatLabel>
                            </StatCard>
                        </StatsGrid>

                        <SectionTitle><Calendar size={16} /> Due for Service</SectionTitle>

                        <TruckItem>
                            <TruckInfo>
                                <TruckIcon><Truck size={20} /></TruckIcon>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>Vehicle LC-1122</div>
                                    <div style={{ fontSize: 12, color: '#6B7280' }}>120,500 km • Last Service: 6 months ago</div>
                                </div>
                            </TruckInfo>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626' }}>CRITICAL</span>
                                <StatusBar width="90%" color="#DC2626" />
                            </div>
                            <ActionBtn>Schedule</ActionBtn>
                        </TruckItem>

                        <TruckItem>
                            <TruckInfo>
                                <TruckIcon><Truck size={20} /></TruckIcon>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>Vehicle NA-9988</div>
                                    <div style={{ fontSize: 12, color: '#6B7280' }}>85,000 km • Last Service: 3 months ago</div>
                                </div>
                            </TruckInfo>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706' }}>WARNING</span>
                                <StatusBar width="75%" color="#D97706" />
                            </div>
                            <ActionBtn>Schedule</ActionBtn>
                        </TruckItem>

                    </Body>
                </Content>
            </Overlay>
        </AnimatePresence>
    );
};

export default MaintenanceModal;
