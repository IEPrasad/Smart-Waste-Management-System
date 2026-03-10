import React, { useState, useMemo } from 'react';
import {
    Calendar, Clock, MapPin, Truck, CheckCircle2, AlertCircle,
    ChevronRight, MoreVertical, Filter, ArrowUpRight,
    Leaf, Recycle, Trash2, Zap, LayoutGrid, Info, Activity,
    CalendarDays, Settings, Cloud, CheckSquare, X, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { css, keyframes } from 'styled-components';
import DeploymentDetailsModal from './DeploymentDetailsModal';
import useEscapeKey from '../../hooks/useEscapeKey';

// --- Theme & Style Constants ---

const theme = {
    colors: {
        background: '#F8FAFC', // slate-50
        white: '#FFFFFF',
        text: {
            primary: '#0F172A', // slate-900
            secondary: '#64748B', // slate-500
            muted: '#94A3B8', // slate-400
        },
        primary: {
            main: '#2563EB', // blue-600
            light: '#EFF6FF', // blue-50
            dark: '#1E40AF', // blue-800
        },
        organic: {
            main: '#22C55E', // green-500
            light: '#F0FDF4', // green-50
            text: '#15803D', // green-700
        },
        recycle: {
            main: '#3B82F6', // blue-500
            light: '#EFF6FF', // blue-50
            text: '#1D4ED8', // blue-700
        },
        efficiency: {
            // violet-600 to indigo-600
            gradient: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
            shadow: '0 20px 25px -5px rgba(79, 70, 229, 0.4)',
        }
    },
    shadows: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
        active: '0 0 0 2px #fff, 0 0 0 4px #3B82F6',
    },
    radius: {
        lg: '24px',
        md: '16px',
        sm: '12px'
    }
};

// --- Animations ---

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background};
  color: ${theme.colors.text.primary};
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  padding-bottom: 80px;
`;

const HeaderWrapper = styled.header`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #E2E8F0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #E2E8F0;
`;

const MaxWidthWrapper = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 32px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageTitle = styled.h1`
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.white};
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
`;

const TimeDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const TimeLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${theme.colors.text.secondary};
`;

const TimeValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// --- Grids & Layouts ---

const MainContent = styled(MaxWidthWrapper)`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 32px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

// --- Card Components ---

const CardBase = styled(motion.div)`
  border-radius: ${theme.radius.lg};
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
`;

const StatCardStyled = styled(CardBase)`
  background: ${props => props.$isEfficiency ? theme.colors.efficiency.gradient : theme.colors.white};
  box-shadow: ${props => props.$isEfficiency ? theme.colors.efficiency.shadow : theme.shadows.card};
  border: ${props => props.$isEfficiency ? 'none' : '1px solid #F1F5F9'};
  color: ${props => props.$isEfficiency ? theme.colors.white : theme.colors.text.primary};

  &:hover {
    box-shadow: ${theme.shadows.cardHover};
    transform: translateY(-4px);
  }
`;

const IconBox = styled.div`
  height: 48px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.radius.md};
  
  background: ${props => props.$isEfficiency
        ? 'rgba(255, 255, 255, 0.2)'
        : 'linear-gradient(135deg, #EFF6FF 0%, #E0E7FF 100%)'};
    
  color: ${props => props.$isEfficiency
        ? theme.colors.white
        : theme.colors.primary.main};
    
  backdrop-filter: ${props => props.$isEfficiency ? 'blur(8px)' : 'none'};
`;

const StyledSection = styled.div`
  background: ${theme.colors.white};
  border-radius: 32px; // Use pixel value for specificity
  padding: 32px;
  border: 1px solid #F1F5F9;
  box-shadow: ${theme.shadows.card};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.$mb || '24px'};
`;

const Grid2Col = styled.div`
  display: grid;
  grid-template-columns: 1fr; // Default List View (< 1280px)
  gap: 24px;
  
  @media (min-width: 1280px) { // Only switch to grid on large desktops
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DivisionCardStyled = styled(CardBase)`
  background: ${theme.colors.white};
  border: 1px solid #F1F5F9;
  cursor: pointer;

  &:hover {
    box-shadow: ${theme.shadows.cardHover};
    border-color: #E2E8F0;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); // Default mobile
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(7, 1fr);
  }
`;

const DayCardStyle = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: ${theme.radius.md};
  min-height: 140px; // Maintain vertical aspect
  transition: all 0.3s ease;
  border: 1px solid transparent;
  background: ${theme.colors.white};

  ${props => props.$isSpecial && props.$color === 'green' && css`
    background-color: ${theme.colors.organic.light};
    border-color: #BBF7D0; // green-200
  `}

  ${props => props.$isSpecial && props.$color === 'blue' && css`
    background-color: ${theme.colors.recycle.light};
    border-color: #BFDBFE; // blue-200
  `}

  &:hover {
    border-color: #E2E8F0;
    background-color: ${props => props.$isSpecial ? '' : '#F8FAFC'};
  }
`;

const InfoBanner = styled.div`
  margin-top: 32px;
  background-color: ${theme.colors.primary.light};
  border: 1px solid #DBEAFE; // blue-100
  border-radius: ${theme.radius.lg};
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

// --- Modal Components ---

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalContent = styled(motion.div)`
  background: ${theme.colors.white};
  width: 100%;
  max-width: 600px;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.cardHover};
  overflow: hidden;
  position: relative;
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

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalFooter = styled.div`
  padding: 24px;
  background: #F8FAFC;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ScheduleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: ${theme.radius.md};
  background: ${props => props.$isSelected ? '#F8FAFC' : 'transparent'};
  border: 1px solid ${props => props.$isSelected ? '#E2E8F0' : 'transparent'};
  margin-bottom: 8px;
`;

const TypeSelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  background: white;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

// --- React Components ---

const StatsCard = ({ label, value, subtext, icon: Icon, type = 'normal' }) => {
    const isEfficiency = type === 'efficiency';

    return (
        <StatCardStyled
            whileHover={{ y: -4 }}
            $isEfficiency={isEfficiency}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <IconBox $isEfficiency={isEfficiency}>
                    <Icon size={24} />
                </IconBox>
                {type === 'normal' && <ChevronRight size={20} color="#CBD5E1" />}
                {isEfficiency && (
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        This Week
                    </span>
                )}
            </div>

            <div>
                <h3 style={{ fontSize: '30px', fontWeight: 'bold', margin: '0 0 4px 0', lineHeight: 1 }}>{value}</h3>
                <p style={{
                    fontWeight: 500,
                    color: isEfficiency ? '#E0E7FF' : theme.colors.text.secondary,
                    margin: 0
                }}>
                    {label}
                </p>
                {subtext && (
                    <p style={{
                        fontSize: '12px',
                        marginTop: '8px',
                        fontWeight: 500,
                        color: isEfficiency ? '#C7D2FE' : theme.colors.primary.main
                    }}>
                        {subtext}
                    </p>
                )}
            </div>
        </StatCardStyled>
    );
};

const DivisionCard = ({ division, requestCount, organicCount, recycleCount, onAssign, index }) => {
    const isHighVolume = requestCount >= 10;
    const schedule = isHighVolume
        ? { text: 'Manual Assignment Required', color: '#D97706' } // amber-600
        : { text: 'Auto-Scheduled', color: theme.colors.primary.main };

    return (
        <DivisionCardStyled
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onAssign(division.name)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                        height: '56px', width: '56px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '16px', background: '#F8FAFC', color: '#64748B'
                    }}>
                        <MapPin size={28} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                            {division.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '14px', fontWeight: 500, color: theme.colors.text.secondary }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Leaf size={14} color={theme.colors.organic.main} /> {organicCount}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Recycle size={14} color={theme.colors.recycle.main} /> {recycleCount}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', lineHeight: 1 }}>{requestCount}</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.colors.text.muted, marginTop: '4px' }}>PENDING</div>
                </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: schedule.color }}>
                    {schedule.text}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: theme.colors.text.muted }}>
                    This Saturday
                </span>
            </div>
        </DivisionCardStyled>
    );
};

// --- Edit Schedule Modal (Premium Calendar) ---

const CalendarGridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 16px;
`;

const CalendarDayHeader = styled.div`
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${theme.colors.text.muted};
  letter-spacing: 0.05em;
  padding-bottom: 8px;
`;

const CalendarDayCell = styled.div`
  aspect-ratio: 1;
  border-radius: ${theme.radius.sm};
  border: 1px solid ${props => props.$isSelected ? theme.colors.primary.main : '#F1F5F9'};
  background: ${props => props.$isSelected ? theme.colors.primary.light : 'white'};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    box-shadow: ${theme.shadows.cardHover};
    transform: translateY(-2px);
    border-color: ${theme.colors.primary.main};
    z-index: 2;
  }
  
  ${props => props.$type === 'Organic' && css`
    background: ${theme.colors.organic.light};
    border-color: ${theme.colors.organic.main};
    color: ${theme.colors.organic.text};
  `}
  
  ${props => props.$type === 'Recycle' && css`
    background: ${theme.colors.recycle.light};
    border-color: ${theme.colors.recycle.main};
    color: ${theme.colors.recycle.text};
  `}
`;

const GoogleCalendarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: ${theme.radius.md};
  border: 1px solid #E2E8F0;
  background: white;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
  }
`;

const StyledEditButton = styled(motion.button)`
  background: ${theme.colors.primary.main};
  color: white;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${theme.colors.primary.dark};
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
  }
`;

// --- Google Import Modal ---

const GoogleImportModal = ({ isOpen, onClose, onImport }) => {
    const [step, setStep] = useState(1);
    const [selectedCalendars, setSelectedCalendars] = useState(['holidays']);
    const [isConnecting, setIsConnecting] = useState(false);

    // Reset state on open
    useEscapeKey(onClose, isOpen);

    React.useEffect(() => {
        if (isOpen) {
            setStep(1);
            setIsConnecting(true);
            // Simulate connection delay
            const timer = setTimeout(() => {
                setIsConnecting(false);
                setStep(2);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleImport = () => {
        setStep(3);
        // Simulate import processing
        setTimeout(() => {
            const simulatedEvents = [];
            if (selectedCalendars.includes('holidays')) {
                // Next Monday as Holiday
                simulatedEvents.push({ dayIndex: 0, type: 'Off', reason: 'Public Holiday: Labor Day' });
            }
            if (selectedCalendars.includes('community')) {
                // Next Wednesday as Community Drive
                simulatedEvents.push({ dayIndex: 2, type: 'Recycle', reason: 'Community Recycling Drive' });
            }
            onImport(simulatedEvents);
            onClose();
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: '500px' }}>
                <ModalHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '8px' }}>
                            <CalendarDays size={24} color={theme.colors.primary.main} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Import Schedule</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: theme.colors.text.secondary }}>
                                {step === 1 ? 'Connecting to Google...' : step === 2 ? 'Select Calendars' : 'Importing...'}
                            </p>
                        </div>
                    </div>
                    <CloseButton onClick={onClose}>
                        <X size={20} strokeWidth={2.5} />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {step === 1 && (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                style={{ display: 'inline-block', marginBottom: '16px' }}
                            >
                                <RefreshCw size={32} color={theme.colors.primary.main} />
                            </motion.div>
                            <p style={{ fontWeight: 600 }}>Connecting to Google Calendar...</p>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCalendars.includes('holidays')}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedCalendars([...selectedCalendars, 'holidays']);
                                        else setSelectedCalendars(selectedCalendars.filter(c => c !== 'holidays'));
                                    }}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Public Holidays</div>
                                    <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>Imports national holidays as "Day Off"</div>
                                </div>
                            </div>

                            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCalendars.includes('community')}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedCalendars([...selectedCalendars, 'community']);
                                        else setSelectedCalendars(selectedCalendars.filter(c => c !== 'community'));
                                    }}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Community Events</div>
                                    <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>Syncs recycling drives & special pickups</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <CheckCircle2 size={48} color={theme.colors.success.main} style={{ marginBottom: '16px' }} />
                            <p style={{ fontWeight: 600 }}>Syncing Events...</p>
                        </div>
                    )}
                </ModalBody>

                {step === 2 && (
                    <ModalFooter>
                        <button onClick={onClose} style={{
                            padding: '10px 20px', borderRadius: '12px', fontWeight: 600,
                            background: 'white', border: '1px solid #E2E8F0', cursor: 'pointer'
                        }}>Cancel</button>
                        <button onClick={handleImport} style={{
                            padding: '10px 24px', borderRadius: '12px', fontWeight: 600,
                            background: theme.colors.primary.main, color: 'white', border: 'none', cursor: 'pointer'
                        }}>
                            Import Selected
                        </button>
                    </ModalFooter>
                )}
            </ModalContent>
        </ModalOverlay>
    );
};


const TypeButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${props => props.$isActive ? props.$color : '#E2E8F0'};
  background: ${props => props.$isActive ? props.$bg : 'white'};
  color: ${props => props.$isActive ? props.$textColor : '#64748B'};
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => props.$isActive ? props.$bg : '#F8FAFC'};
  }
`;

const EditScheduleModal = ({ isOpen, onClose, schedule, onSave }) => {
    const [localSchedule, setLocalSchedule] = useState(schedule);
    const [selectedDayIndex, setSelectedDayIndex] = useState(null);

    useEscapeKey(onClose, isOpen);

    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

    const handleTypeChange = (newType) => {
        if (selectedDayIndex === null) return;

        const updated = [...localSchedule];
        let color = 'gray';
        let isSpecial = false;
        let icon = <Trash2 size={20} />;
        let isActive = false;

        if (newType === 'Organic') {
            color = 'green'; isSpecial = true; isActive = true; icon = <Leaf size={20} />;
        } else if (newType === 'Recycle') {
            color = 'blue'; isSpecial = true; isActive = true; icon = <Recycle size={20} />;
        } else if (newType === 'Off') {
            color = 'gray'; icon = <Clock size={20} />;
        } else if (newType === 'Normal') {
            // Reset to standard trash
            color = 'gray'; icon = <Trash2 size={20} />;
        }

        updated[selectedDayIndex] = {
            ...updated[selectedDayIndex],
            type: newType,
            color,
            isSpecial,
            icon,
            isActive
        };

        setLocalSchedule(updated);
        setSelectedDayIndex(null);
    };

    const handleImportCompleted = (events) => {
        const updated = [...localSchedule];
        events.forEach(event => {
            let color = 'gray'; let icon = <Clock size={20} />; let isSpecial = true; let isActive = false;

            if (event.type === 'Recycle') {
                color = 'blue'; icon = <Recycle size={20} />; isActive = true;
            } else if (event.type === 'Off') {
                color = 'gray'; icon = <Clock size={20} />;
            }

            updated[event.dayIndex] = {
                ...updated[event.dayIndex],
                type: event.type,
                color,
                icon,
                isSpecial,
                isActive
            };
        });
        setLocalSchedule(updated);
        toast.success(`Imported ${events.length} schedule updates from Google Calendar`);
    };

    const handleResetSchedule = () => {
        // Reset to a basic default
        const defaults = localSchedule.map(day => ({
            ...day, type: 'Normal', color: 'gray', isSpecial: false, isActive: false, icon: <Trash2 size={20} />
        }));
        setLocalSchedule(defaults);
        toast('Schedule reset to default (All Normal)', { icon: '↺' });
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <ModalContent
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                style={{ maxWidth: '800px' }}
            >
                <ModalHeader>
                    <div>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Plan Weekly Schedule</h3>
                        <p style={{ margin: 0, color: theme.colors.text.secondary }}>Manage fleet deployment and collection types</p>
                    </div>
                    <CloseButton onClick={onClose}>
                        <X size={20} strokeWidth={2.5} />
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <GoogleImportModal
                        isOpen={isGoogleModalOpen}
                        onClose={() => setIsGoogleModalOpen(false)}
                        onImport={handleImportCompleted}
                    />

                    {/* Google Calendar Integration */}
                    <GoogleCalendarButton onClick={() => setIsGoogleModalOpen(true)}>
                        <div style={{ padding: '8px', background: '#FEF7E0', borderRadius: '8px' }}>
                            <CalendarDays size={24} color="#F59E0B" />
                        </div>
                        <div style={{ textAlign: 'left', flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Import from Google Calendar</div>
                            <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>Sync holidays and special events automatically</div>
                        </div>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </GoogleCalendarButton>

                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: theme.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Weekly Grid
                    </h4>

                    <CalendarGridWrapper>
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d =>
                            <CalendarDayHeader key={d}>{d}</CalendarDayHeader>
                        )}
                        {localSchedule.map((day, idx) => (
                            <CalendarDayCell
                                key={idx}
                                $type={day.type}
                                $isSelected={selectedDayIndex === idx}
                                onClick={() => setSelectedDayIndex(idx)}
                            >
                                <span style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{day.name}</span>
                                <div style={{ transform: 'scale(0.8)' }}>{day.icon}</div>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '4px', opacity: 0.8 }}>{day.type}</span>

                                {day.isActive && <div style={{
                                    position: 'absolute', top: '4px', right: '4px',
                                    width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor'
                                }} />}
                            </CalendarDayCell>
                        ))}
                    </CalendarGridWrapper>

                    {/* Quick Action Bar for Selected Day */}
                    <AnimatePresence>
                        {selectedDayIndex !== null && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Set Collection Type for {localSchedule[selectedDayIndex].name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[
                                        { id: 'Organic', icon: Leaf, label: 'Organic', color: theme.colors.organic.main, bg: theme.colors.organic.light, text: theme.colors.organic.text },
                                        { id: 'Recycle', icon: Recycle, label: 'Recycle', color: theme.colors.recycle.main, bg: theme.colors.recycle.light, text: theme.colors.recycle.text },
                                        { id: 'Normal', icon: Trash2, label: 'Normal', color: theme.colors.primary.main, bg: theme.colors.primary.light, text: theme.colors.primary.dark },
                                        { id: 'Off', icon: Clock, label: 'Day Off', color: '#94A3B8', bg: '#F1F5F9', text: '#475569' }
                                    ].map((opt) => (
                                        <TypeButton
                                            key={opt.id}
                                            $isActive={localSchedule[selectedDayIndex].type === opt.id}
                                            $color={opt.color}
                                            $bg={opt.bg}
                                            $textColor={opt.text}
                                            onClick={() => handleTypeChange(opt.id)}
                                        >
                                            <opt.icon size={20} />
                                            {opt.label}
                                        </TypeButton>
                                    ))}
                                    <TypeButton
                                        $color="#CBD5E1"
                                        $bg="white"
                                        $textColor={theme.colors.text.secondary}
                                        onClick={() => handleTypeChange('Normal')}
                                        style={{ borderStyle: 'dashed' }}
                                    >
                                        <RefreshCw size={20} />
                                        Clear
                                    </TypeButton>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </ModalBody>

                <ModalFooter>
                    <button onClick={handleResetSchedule} style={{
                        padding: '10px', borderRadius: '12px', fontWeight: 600, color: '#94A3B8',
                        background: 'transparent', border: 'none', cursor: 'pointer', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <RefreshCw size={16} /> Reset
                    </button>
                    <button onClick={onClose} style={{
                        padding: '10px 20px', borderRadius: '12px', fontWeight: 600,
                        background: 'white', border: '1px solid #E2E8F0', cursor: 'pointer'
                    }}>
                        Cancel
                    </button>
                    <button onClick={() => onSave(localSchedule)} style={{
                        padding: '10px 24px', borderRadius: '12px', fontWeight: 600,
                        background: theme.colors.primary.main, color: 'white', border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
                    }}>
                        Save Schedule
                    </button>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

const SmartScheduleDashboardStyled = ({
    requests = [],
    pickups = [],
    drivers = [],
    divisions = [],
    onAssignDriver
}) => {
    const [activeTab, setActiveTab] = useState('waiting');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDeploymentDriver, setSelectedDeploymentDriver] = useState(null);
    const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);

    // Stats Calculations - Now with real data
    const [stats, setStats] = useState({
        totalZones: divisions.length,
        pendingTasks: 0,
        completedToday: 0,
        efficiencyRate: 0
    });

    // Schedule State
    const [days, setDays] = useState([
        { name: 'MON', type: 'Normal', color: 'gray', icon: <Trash2 size={20} /> },
        { name: 'TUE', type: 'Normal', color: 'gray', icon: <Trash2 size={20} /> },
        { name: 'WED', type: 'Organic', color: 'green', isSpecial: true, isActive: true, icon: <Leaf size={20} /> },
        { name: 'THU', type: 'Normal', color: 'gray', icon: <Trash2 size={20} /> },
        { name: 'FRI', type: 'Normal', color: 'gray', icon: <Trash2 size={20} /> },
        { name: 'SAT', type: 'Recycle', color: 'blue', isSpecial: true, icon: <Recycle size={20} /> },
        { name: 'SUN', type: 'Off', color: 'gray', icon: <Clock size={20} /> },
    ]);

    const handleSaveSchedule = (newSchedule) => {
        setDays(newSchedule);
        setIsEditModalOpen(false);
        toast.success('Collection schedule updated successfully!');
    };

    // Logic Reuse
    const divisionData = useMemo(() => {
        const hiddenMap = {};

        // 1. Initialize all predefined divisions from the database to guarantee they show up
        divisions.forEach(d => {
            const key = d.name.trim().toLowerCase();
            hiddenMap[key] = { ...d, count: 0, organic: 0, recycle: 0, requests: [], originalName: d.name };
        });

        // 2. Map existing requests dynamically to correct categories (or "Other"/New matching ones)
        requests.forEach(r => {
            const reqDiv = (r.division || 'Unknown').trim();
            const key = reqDiv.toLowerCase();

            // If a division name isn't recognized from DB initially, dynamically add it
            if (!hiddenMap[key]) {
                hiddenMap[key] = {
                    id: `dynamic-${key}`,
                    name: reqDiv,
                    originalName: reqDiv,
                    count: 0,
                    organic: 0,
                    recycle: 0,
                    requests: []
                };
            }

            hiddenMap[key].count++;
            hiddenMap[key].requests.push(r);

            const types = r.waste_type || [];
            const isOrganic = types.some(t => t.toLowerCase().includes('organic') || t.toLowerCase().includes('compost'));

            if (isOrganic) hiddenMap[key].organic++;
            else hiddenMap[key].recycle++;
        });

        // Map back to original names for rendering (prevent showing lowercase versions unexpectedly)
        const standardizedMapping = Object.values(hiddenMap).map(div => ({
            ...div,
            name: div.originalName
        }));

        return standardizedMapping.sort((a, b) => b.count - a.count);

    }, [requests, divisions]);


    const efficiencyRate = useMemo(() => {
        const completed = requests.filter(r => r.status === 'completed').length;
        const pending = requests.filter(r => r.status === 'pending' || r.status === 'assigned').length;
        const missed = requests.filter(r => r.status === 'missed').length;

        const total = completed + pending + missed;
        if (total === 0) return 0;

        return Math.round((completed / total) * 100);
    }, [requests]);


    const waitingList = requests.filter(r => r.status === 'pending');
    const ongoingList = requests.filter(r => r.status === 'assigned');
    const completedList = requests.filter(r => r.status === 'completed');

    return (
        <DashboardContainer>
            <Toaster position="top-right" />
            <HeaderWrapper>
                <MaxWidthWrapper>
                    <HeaderContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <PageTitle>Mission Control</PageTitle>
                            <Badge>
                                <Zap size={14} fill="currentColor" />
                                Smart Optimization Active
                            </Badge>
                        </div>

                    </HeaderContent>
                </MaxWidthWrapper>
            </HeaderWrapper>

            <MainContent>
                {/* Stats Row */}
                <StatsGrid>
                    <StatsCard
                        label="Total Zones"
                        value={divisions.length}
                        icon={MapPin}
                    />
                    <StatsCard
                        label="Pending Tasks"
                        value={waitingList.length}
                        icon={AlertCircle}
                        type="warning"
                    />
                    <StatsCard
                        label="Completed Today"
                        value={completedList.length} // Mock
                        icon={CheckCircle2}
                        type="success"
                    />
                    <StatsCard
                        label="Efficiency Rate"
                        value={`${efficiencyRate}%`}
                        subtext="Top performing week"
                        icon={Activity}
                        type="efficiency"
                    />
                </StatsGrid>

                {/* Division Priority */}
                <StyledSection>
                    <SectionHeader>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                <div style={{ padding: '8px', background: theme.colors.primary.light, borderRadius: '8px', color: theme.colors.primary.main }}>
                                    <LayoutGrid size={24} />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Division Priority</h2>
                            </div>
                            <p style={{ color: theme.colors.text.secondary, marginLeft: '56px', margin: 0 }}>Auto-scheduled deployment zones</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: theme.colors.text.secondary }}>{divisions.length} Zones</span>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', borderRadius: '12px', border: '1px solid #E2E8F0',
                                background: 'transparent', fontWeight: 'bold', color: theme.colors.text.primary,
                                cursor: 'pointer'
                            }}>
                                <Settings size={16} /> Configure
                            </button>
                        </div>
                    </SectionHeader>

                    <Grid2Col>
                        <AnimatePresence>
                            {divisionData.map((div, idx) => (
                                <DivisionCard
                                    key={div.id || div.name}
                                    division={div}
                                    index={idx}
                                    requestCount={div.count}
                                    organicCount={div.organic}
                                    recycleCount={div.recycle}
                                    onAssign={(divName) => onAssignDriver(divName)}
                                />
                            ))}
                        </AnimatePresence>
                    </Grid2Col>
                </StyledSection>

                {/* Active Deployments */}
                <StyledSection>
                    <SectionHeader>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                <div style={{ padding: '8px', background: theme.colors.organic.light, borderRadius: '8px', color: theme.colors.organic.main }}>
                                    <Truck size={24} />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Active Deployments</h2>
                            </div>
                            <p style={{ color: theme.colors.text.secondary, marginLeft: '56px', margin: 0 }}>Live tracking of assigned fleets</p>
                        </div>
                    </SectionHeader>

                    <Grid2Col>
                        {drivers.filter(d => pickups.some(p => p.driver_id === d.id && p.status === 'pending')).length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: theme.colors.text.muted, background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
                                <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                                <h3 style={{ margin: '0 0 8px 0', color: theme.colors.text.secondary }}>No Active Deployments</h3>
                                <p style={{ margin: 0, fontSize: '14px' }}>Assign fleets to pending zones to see them here.</p>
                            </div>
                        ) : drivers.filter(d => pickups.some(p => p.driver_id === d.id && p.status === 'pending')).map(driver => {
                            const driverPickups = pickups.filter(p => p.driver_id === driver.id && p.status === 'pending');
                            // Extract unique zone names
                            const activeZones = [...new Set(driverPickups.map(p => p.citizens?.division).filter(Boolean))];

                            return (
                                <CardBase
                                    key={driver.id}
                                    style={{ border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}
                                    onClick={() => {
                                        setSelectedDeploymentDriver(driver);
                                        setIsDeploymentModalOpen(true);
                                    }}
                                    whileHover={{ y: -4, boxShadow: theme.shadows.cardHover }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.colors.primary.light, color: theme.colors.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {driver.photo_url ? <img src={driver.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} /> : driver.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>{driver.full_name}</h4>
                                                <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>{driver.vehicle_number || 'Unassigned Vehicle'}</span>
                                            </div>
                                        </div>
                                        <Badge style={{ background: theme.colors.organic.light, color: theme.colors.organic.text, boxShadow: 'none' }}>
                                            <Activity size={12} /> In Progress
                                        </Badge>
                                    </div>
                                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                                            <span style={{ color: theme.colors.text.secondary }}>Assigned Pickups</span>
                                            <span>{driverPickups.length} pending in {activeZones.length} zones</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {activeZones.slice(0, 3).map((zone, idx) => (
                                                <span key={idx} style={{ fontSize: '11px', background: 'white', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '100px' }}>
                                                    {zone}
                                                </span>
                                            ))}
                                            {activeZones.length > 3 && (
                                                <span style={{ fontSize: '11px', background: 'white', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '100px', color: theme.colors.text.secondary }}>
                                                    +{activeZones.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardBase>
                            );
                        })}
                    </Grid2Col>
                </StyledSection>

                {/* Weekly Routing */}
                <StyledSection>
                    <SectionHeader $mb="32px">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '8px', background: '#F3E8FF', borderRadius: '8px', color: '#9333EA' }}>
                                <CalendarDays size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>Weekly Routing Schedule</h2>
                                <p style={{ fontSize: '14px', color: theme.colors.text.secondary, margin: 0 }}>Optimized collection plan for maximum efficiency</p>
                            </div>
                        </div>
                        <StyledEditButton
                            onClick={() => setIsEditModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Settings size={18} /> Edit Schedule
                        </StyledEditButton>
                    </SectionHeader>

                    <CalendarGrid>
                        {days.map((day, idx) => (
                            <DayCardStyle
                                key={idx}
                                $isSpecial={day.isSpecial}
                                $color={day.color}
                                onClick={() => setIsEditModalOpen(true)}
                                style={{ cursor: 'pointer' }}
                            >
                                {day.isActive && (
                                    <div style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        height: '20px', width: '20px', borderRadius: '50%',
                                        background: day.color === 'green' ? theme.colors.organic.main : theme.colors.recycle.main,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>
                                        <CheckCircle2 size={12} />
                                    </div>
                                )}

                                <div style={{
                                    padding: '12px', borderRadius: '16px',
                                    background: day.isSpecial ? (day.color === 'green' ? '#DCFCE7' : '#DBEAFE') : '#F1F5F9',
                                    color: day.isSpecial ? (day.color === 'green' ? '#166534' : '#1E40AF') : '#94A3B8'
                                }}>
                                    {day.icon}
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px', color: day.isSpecial ? (day.color === 'green' ? '#15803D' : '#1D4ED8') : '#94A3B8' }}>
                                        {day.name}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: day.isSpecial ? '#0F172A' : '#64748B' }}>
                                        {day.type}
                                    </div>
                                </div>
                            </DayCardStyle>
                        ))}
                    </CalendarGrid>

                    <InfoBanner>
                        <div style={{ padding: '8px', background: theme.colors.primary.main, borderRadius: '8px', color: 'white', boxShadow: theme.shadows.card }}>
                            <Info size={24} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: theme.colors.primary.dark, margin: '0 0 4px 0' }}>Smart Optimization Active</h4>
                            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: theme.colors.primary.text }}>
                                Routes with <strong>10+ requests</strong> are automatically routed to Wednesday (Organic) and Saturday (Recycle) collection. The system optimizes for fuel efficiency and minimal environmental impact.
                            </p>
                        </div>
                    </InfoBanner>
                </StyledSection>

            </MainContent>

            <AnimatePresence>
                {isEditModalOpen && (
                    <EditScheduleModal
                        schedule={days}
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSave={handleSaveSchedule}
                    />
                )}
                {isDeploymentModalOpen && selectedDeploymentDriver && (
                    <DeploymentDetailsModal
                        isOpen={isDeploymentModalOpen}
                        onClose={() => {
                            setIsDeploymentModalOpen(false);
                            setSelectedDeploymentDriver(null);
                        }}
                        driver={selectedDeploymentDriver}
                        initialPickups={pickups.filter(p => p.driver_id === selectedDeploymentDriver.id)}
                    />
                )}
            </AnimatePresence>
        </DashboardContainer>
    );
};

export default SmartScheduleDashboardStyled;
