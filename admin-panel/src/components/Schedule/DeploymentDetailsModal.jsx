import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, MapPin, CheckCircle2, Clock, AlertCircle,
    User, Phone, Navigation, Trash2, Leaf, Recycle
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import useEscapeKey from '../../hooks/useEscapeKey';

const theme = {
    colors: {
        primary: {
            main: '#2563EB',
            light: '#DBEAFE',
            dark: '#1E40AF',
        },
        success: {
            main: '#10B981',
            light: '#D1FAE5',
            dark: '#065F46',
        },
        warning: {
            main: '#F59E0B',
            light: '#FEF3C7',
        },
        danger: {
            main: '#EF4444',
            light: '#FEE2E2',
            bg: '#DC2626'
        },
        text: {
            primary: '#0F172A',
            secondary: '#64748B',
            muted: '#94A3B8',
        },
        white: '#FFFFFF',
        background: '#F8FAFC',
    },
    shadows: {
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    radius: {
        lg: '24px',
        md: '16px',
        sm: '12px'
    }
};

const Overlay = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
`;

const ModalContainer = styled(motion.div)`
    background: ${theme.colors.white};
    width: 100%;
    max-width: 900px;
    height: auto;
    max-height: 90vh;
    border-radius: ${theme.radius.lg};
    box-shadow: ${theme.shadows.modal};
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
`;

const ModalHeader = styled.div`
    padding: 24px 32px;
    border-bottom: 1px solid #F1F5F9;
    background: #F8FAFC;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const DriverInfoBlock = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const Avatar = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: ${theme.colors.primary.light};
    color: ${theme.colors.primary.main};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 800;
    border: 2px solid ${theme.colors.white};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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

const ModalBody = styled.div`
    padding: 24px 0 0 0;
    overflow-y: auto;
    flex: 1;
    background: #FFFFFF;

    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-track {
        background: #F1F5F9;
    }
    &::-webkit-scrollbar-thumb {
        background: #CBD5E1;
        border-radius: 4px;
    }
`;

const TabContainer = styled.div`
    display: flex;
    gap: 16px;
    padding: 0 32px;
    border-bottom: 1px solid #F1F5F9;
    margin-bottom: 24px;
`;

const TabContent = styled.button`
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 2px solid ${props => props.$active ? props.$color : 'transparent'};
    color: ${props => props.$active ? props.$color : theme.colors.text.secondary};
    font-weight: ${props => props.$active ? '700' : '600'};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        color: ${props => props.$color};
        background: ${props => props.$hoverBg};
        border-radius: 8px 8px 0 0;
    }
`;

const PickupList = styled.div`
    padding: 0 32px 24px 32px;
`;

const PickupCard = styled(motion.div)`
    padding: 20px;
    background: ${theme.colors.white};
    border: 1px solid #E2E8F0;
    border-radius: ${theme.radius.md};
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${theme.colors.primary.main};
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
    }
`;

const CitizenInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const CitizenName = styled.h4`
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: ${theme.colors.text.primary};
`;

const MetaInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: ${theme.colors.text.secondary};
`;

const Badge = styled.span`
    padding: 4px 12px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 4px;
    background: ${props => props.$bg || '#F1F5F9'};
    color: ${props => props.$color || '#64748B'};
`;

const WasteTypeIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$type === 'Organic' ? '#DCFCE7' : '#DBEAFE'};
    color: ${props => props.$type === 'Organic' ? '#166534' : '#1E40AF'};
`;

const DistanceText = styled.div`
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
`;

const DeploymentDetailsModal = ({ isOpen, onClose, driver, initialPickups = [] }) => {
    const [pickups, setPickups] = useState(initialPickups);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    useEscapeKey(onClose, isOpen);

    useEffect(() => {
        if (isOpen && driver) {
            fetchPickupDetails();
        }
    }, [isOpen, driver]);

    const fetchPickupDetails = async () => {
        setLoading(true);
        try {
            // 1. Fetch pickups for this driver:
            // - Any status from today
            // - Any pending/missed status from the past
            const today = new Date().toISOString().split('T')[0];
            const { data: pickupData, error: pickupError } = await supabase
                .from('pickups')
                .select('*, citizens(*)')
                .eq('driver_id', driver.id)
                .or(`scheduled_date.eq.${today},status.in.(pending,missed)`);

            if (pickupError) throw pickupError;

            // Use initial pickups if fetch returns nothing but we have local data
            const basePickups = (pickupData && pickupData.length > 0) ? pickupData : initialPickups;

            if (basePickups.length === 0) {
                setPickups([]);
                setLoading(false);
                return;
            }

            // 2. For each citizen, fetch their waste requests to get types
            const citizenIds = basePickups.map(p => p.citizen_id);
            const { data: requestData } = await supabase
                .from('waste_requests')
                .select('user_id, type')
                .in('user_id', citizenIds)
                .in('status', ['pending', 'scheduled']);

            // Combine data
            const enrichedPickups = basePickups.map(p => {
                const requests = requestData?.filter(r => r.user_id === p.citizen_id) || [];
                const types = [...new Set(requests.map(r => r.type))];
                return {
                    ...p,
                    waste_types: types.length > 0 ? types : ['Normal']
                };
            });

            // 3. Simple distance sorting (simulated from a base point if no driver location)
            // Base point (e.g., city center)
            const baseLat = 6.9271;
            const baseLng = 79.8612;

            const sorted = enrichedPickups.sort((a, b) => {
                const latA = a.lat || 0;
                const lngA = a.lng || 0;
                const latB = b.lat || 0;
                const lngB = b.lng || 0;

                const distA = Math.sqrt(Math.pow(latA - baseLat, 2) + Math.pow(lngA - baseLng, 2));
                const distB = Math.sqrt(Math.pow(latB - baseLat, 2) + Math.pow(lngB - baseLng, 2));
                return distA - distB;
            });

            setPickups(sorted);
        } catch (error) {
            console.error('Error fetching deployment details:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'All', label: 'All Pickups', color: theme.colors.primary.main, hoverBg: theme.colors.primary.light },
        { id: 'pending', label: 'Pending', color: theme.colors.warning.main, hoverBg: theme.colors.warning.light },
        { id: 'collected', label: 'Completed', color: theme.colors.success.main, hoverBg: theme.colors.success.light },
        { id: 'missed', label: 'Missed', color: theme.colors.danger.main, hoverBg: theme.colors.danger.light },
    ];

    const filteredPickups = pickups.filter(p => {
        if (activeTab === 'All') return true;
        return p.status === activeTab;
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <ModalContainer
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <ModalHeader>
                        <DriverInfoBlock>
                            <Avatar>
                                {driver.photo_url ? (
                                    <img src={driver.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    driver.full_name?.charAt(0)
                                )}
                            </Avatar>
                            <div>
                                <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '800' }}>{driver.full_name}</h2>
                                <MetaInfo>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Navigation size={14} /> {driver.vehicle_number || 'No Vehicle'}
                                    </span>
                                    <span style={{ color: '#E2E8F0' }}>|</span>
                                    <span>{pickups.length} Total Assignments</span>
                                </MetaInfo>
                            </div>
                        </DriverInfoBlock>
                        <CloseButton onClick={onClose}>
                            <X size={20} strokeWidth={2.5} />
                        </CloseButton>
                    </ModalHeader>

                    <ModalBody>
                        <TabContainer>
                            {tabs.map(tab => {
                                const count = tab.id === 'All' ? pickups.length : pickups.filter(p => p.status === tab.id).length;
                                return (
                                    <TabContent
                                        key={tab.id}
                                        $active={activeTab === tab.id}
                                        $color={tab.color}
                                        $hoverBg={tab.hoverBg}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.label}
                                        <Badge $bg={activeTab === tab.id ? tab.color : '#F1F5F9'} $color={activeTab === tab.id ? theme.colors.white : theme.colors.text.secondary}>
                                            {count}
                                        </Badge>
                                    </TabContent>
                                );
                            })}
                        </TabContainer>

                        <PickupList>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Pickup Queue <span style={{ color: theme.colors.text.muted, fontSize: '14px', fontWeight: 'normal' }}>(Sorted by Distance)</span></h3>
                                <Badge $bg={theme.colors.primary.light} $color={theme.colors.primary.main}>
                                    Live Progress: {pickups.filter(p => p.status === 'collected').length}/{pickups.length}
                                </Badge>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                    <Clock size={40} className="animate-spin" style={{ color: theme.colors.text.muted }} />
                                    <p style={{ color: theme.colors.text.secondary, marginTop: '16px' }}>Loading pickup data...</p>
                                </div>
                            ) : filteredPickups.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '100px 0', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
                                    <AlertCircle size={40} style={{ color: theme.colors.text.muted, marginBottom: '16px' }} />
                                    <p style={{ color: theme.colors.text.secondary }}>No pickups found for this category.</p>
                                </div>
                            ) : (
                                filteredPickups.map((pickup, idx) => (
                                    <PickupCard
                                        key={pickup.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {pickup.waste_types.map((type, tIdx) => (
                                                    <WasteTypeIcon key={tIdx} $type={type} title={type}>
                                                        {type === 'Organic' ? <Leaf size={18} /> : type === 'Recycle' ? <Recycle size={18} /> : <Trash2 size={18} />}
                                                    </WasteTypeIcon>
                                                ))}
                                            </div>
                                            <CitizenInfo>
                                                <CitizenName>{pickup.citizens?.full_name}</CitizenName>
                                                <MetaInfo>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin size={14} /> {pickup.citizens?.division}
                                                    </span>
                                                    <span style={{ color: '#E2E8F0' }}>|</span>
                                                    <span>{pickup.citizens?.assessment_number}</span>
                                                </MetaInfo>
                                            </CitizenInfo>
                                        </div>

                                        <DistanceText>
                                            <Badge
                                                $bg={
                                                    pickup.status === 'collected' ? theme.colors.success.light :
                                                        pickup.status === 'missed' ? theme.colors.danger.light :
                                                            theme.colors.warning.light
                                                }
                                                $color={
                                                    pickup.status === 'collected' ? theme.colors.success.dark :
                                                        pickup.status === 'missed' ? theme.colors.danger.main :
                                                            '#92400E'
                                                }
                                            >
                                                {pickup.status === 'collected' && <CheckCircle2 size={12} />}
                                                {pickup.status === 'missed' && <AlertCircle size={12} />}
                                                {pickup.status === 'pending' && <Clock size={12} />}
                                                {pickup.status}
                                            </Badge>
                                            <span style={{ fontSize: '11px', color: theme.colors.text.muted, marginTop: '4px' }}>
                                                Priority #{idx + 1}
                                            </span>
                                        </DistanceText>
                                    </PickupCard>
                                ))
                            )}
                        </PickupList>
                    </ModalBody>
                </ModalContainer>
            </Overlay>
        </AnimatePresence>
    );
};

export default DeploymentDetailsModal;
