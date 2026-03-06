import React, { useState, useMemo } from 'react';
import { X, Search, User, Truck, Radio, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { css } from 'styled-components';

// --- Styled Components ---

const theme = {
    colors: {
        primary: { main: '#2563EB', light: '#EFF6FF', dark: '#1E40AF' },
        success: { main: '#22C55E', light: '#F0FDF4', text: '#15803D' },
        text: { primary: '#0F172A', secondary: '#64748B', muted: '#94A3B8' },
        background: '#F8FAFC',
        white: '#FFFFFF',
    },
    radius: { lg: '24px', md: '16px', sm: '12px' },
    shadows: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        highlight: '0 0 0 2px #2563EB',
    }
};

const Overlay = styled(motion.div)`
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
`;

const Content = styled(motion.div)`
    background: ${theme.colors.white};
    width: 100%; max-width: 600px;
    height: 85vh; // Fixed height for consistency
    border-radius: ${theme.radius.lg};
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex; flex-direction: column;
`;

const Header = styled.div`
    padding: 24px;
    border-bottom: 1px solid #E2E8F0;
    display: flex; justify-content: space-between; align-items: center;
    background: white;
    color: ${theme.colors.text.primary};
`;

const SearchSection = styled.div`
    padding: 16px 24px;
    border-bottom: 1px solid #E2E8F0;
    display: flex; align-items: center; gap: 12px;
    background: #F8FAFC;
`;

const SearchInputWrapper = styled.div`
    position: relative; flex: 1;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 42px;
    padding: 0 16px 0 40px;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    outline: none;
    font-size: 14px;
    color: ${theme.colors.text.primary};
    background: white;
    transition: all 0.2s;
    
    &::placeholder {
        color: ${theme.colors.text.muted};
    }
    
    &:focus {
        border-color: ${theme.colors.primary.main};
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
`;

const FilterButton = styled.button`
    height: 42px;
    display: flex; align-items: center; gap: 8px;
    padding: 0 16px;
    border-radius: 12px;
    border: 1px solid ${props => props.$active ? theme.colors.success.main : '#E2E8F0'};
    background: ${props => props.$active ? theme.colors.success.light : 'white'};
    color: ${props => props.$active ? theme.colors.success.text : theme.colors.text.secondary};
    font-size: 13px; font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
`;

const SearchActionButton = styled.button`
    height: 42px;
    padding: 0 20px;
    border-radius: 12px;
    background: ${theme.colors.primary.main};
    color: white;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    
    &:hover {
        background: ${theme.colors.primary.dark};
        transform: translateY(-1px);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const DriverList = styled.div`
    flex: 1; 
    overflow-y: auto;
    padding: 24px;
    display: flex; 
    flex-direction: column; 
    gap: 12px;
`;

const DriverCardStyled = styled(motion.div)`
    padding: 16px;
    border-radius: ${theme.radius.md};
    border: 1px solid ${props => props.$isSelected ? theme.colors.primary.main : '#F1F5F9'};
    background: ${props => props.$isSelected ? '#EFF6FF' : 'white'};
    cursor: pointer;
    transition: all 0.2s;
    display: flex; 
    align-items: center; 
    justify-content: space-between;
    width: 100%;
    
    &:hover {
        border-color: ${props => props.$isSelected ? theme.colors.primary.main : '#CBD5E1'};
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.card};
    }
`;

const Footer = styled.div`
    padding: 20px 24px;
    border-top: 1px solid #E2E8F0;
    background: white;
    display: flex; gap: 12px; justify-content: flex-end;
`;

const PrimaryButton = styled.button`
padding: 12px 24px;
border - radius: 12px;
background: ${theme.colors.primary.main};
color: white; font - weight: 600;
border: none; cursor: pointer;
opacity: ${props => props.disabled ? 0.5 : 1};
pointer - events: ${props => props.disabled ? 'none' : 'auto'};
box - shadow: 0 4px 6px - 1px rgba(37, 99, 235, 0.3);
    &:hover { background: ${theme.colors.primary.dark}; }
`;

const SecondaryButton = styled.button`
padding: 12px 24px;
border - radius: 12px;
background: white;
color: ${theme.colors.text.secondary};
font - weight: 600;
border: 1px solid #E2E8F0; cursor: pointer;
    &:hover { background: #F8FAFC; }
`;

// Removed CloseButton styled component in favor of inline logic for absolute control
const CloseButtonWrapper = styled.button`
background: #F1F5F9;
border - radius: 50 %;
width: 36px;
height: 36px;
display: flex;
align - items: center;
justify - content: center;
cursor: pointer;
border: none;
transition: all 0.2s ease;
color: #64748B;
    
    &:hover {
    background: #EF4444;
    color: white;
    transform: rotate(90deg);
}
`;

// Removed DriverLoadBar as requested

// --- Main Component ---

const AssignmentModal = ({ isOpen, onClose, drivers = [], requestIds = [], onAssign, isAssigning }) => {
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOnline, setFilterOnline] = useState(false);
    const [isCloseHovered, setIsCloseHovered] = useState(false);


    // Initial logic from AssignmentDrawer
    const filteredDrivers = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase().trim();
        if (!lowerQuery && !filterOnline) return drivers;

        return drivers.filter(driver => {
            // Safely handle potential null/undefined values using logical OR to empty string
            const nameMatch = (driver.full_name || '').toLowerCase().includes(lowerQuery);
            const vehicleMatch = (driver.vehicle_number || '').toLowerCase().includes(lowerQuery);
            const idMatch = (driver.id || '').toString().toLowerCase().includes(lowerQuery);
            const empNoMatch = (driver.empno || '').toString().toLowerCase().includes(lowerQuery);

            const matchesSearch = nameMatch || vehicleMatch || idMatch || empNoMatch;
            const matchesOnline = !filterOnline || driver.is_online;
            return matchesSearch && matchesOnline;
        });
    }, [drivers, searchQuery, filterOnline]);

    const handleAssign = () => {
        if (selectedDriverId && requestIds.length > 0) {
            onAssign(selectedDriverId, requestIds);
        }
    };

    // Close on Escape key
    React.useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Content
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                >
                    <Header>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: theme.colors.text.primary }}>Assign Fleet Node</h2>
                            <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: '14px', marginTop: '4px' }}>
                                Deploying 1 driver for {requestIds.length} pending zones
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            onMouseEnter={() => setIsCloseHovered(true)}
                            onMouseLeave={() => setIsCloseHovered(false)}
                            style={{
                                background: isCloseHovered ? '#EF4444' : '#F1F5F9',
                                border: 'none',
                                borderRadius: '12px',
                                width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: isCloseHovered ? 'rotate(90deg)' : 'rotate(0deg)'
                            }}
                        >
                            <X
                                size={20}
                                strokeWidth={2.5}
                                color={isCloseHovered ? 'white' : '#64748B'}
                            />
                        </button>
                    </Header>

                    <SearchSection>
                        <SearchInputWrapper>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <SearchInput
                                placeholder="Search driver name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </SearchInputWrapper>
                        <SearchActionButton>Search</SearchActionButton>
                        <FilterButton
                            $active={filterOnline}
                            onClick={() => setFilterOnline(!filterOnline)}
                        >
                            <Radio size={14} />
                            <span>Online Only</span>
                        </FilterButton>
                    </SearchSection>

                    <DriverList>
                        {filteredDrivers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                                <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <p>No drivers found matching your criteria</p>
                            </div>
                        ) : filteredDrivers.map(driver => (
                            <DriverCardStyled
                                key={driver.id}
                                $isSelected={selectedDriverId === driver.id}
                                onClick={() => setSelectedDriverId(driver.id)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center' }}>
                                    <div style={{ position: 'relative' }}>
                                        {driver.photo_url ? (
                                            <img src={driver.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                                                {driver.full_name?.charAt(0)}
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: driver.is_online ? '#22C55E' : '#EF4444', border: '3px solid white' }} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '16px', color: theme.colors.text.primary }}>{driver.full_name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: theme.colors.text.secondary, fontWeight: 500 }}>
                                            <span style={{
                                                color: driver.is_online ? '#15803D' : '#B91C1C',
                                                background: driver.is_online ? '#DCFCE7' : '#FEE2E2',
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                                            }}>
                                                {driver.is_online ? 'Available' : 'Not Available'}
                                            </span>
                                            <span>•</span>
                                            <Truck size={14} />
                                            <span>{driver.vehicle_number || 'Unassigned Vehicle'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        {selectedDriverId === driver.id && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                <CheckCircle2 size={24} color={theme.colors.primary.main} />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </DriverCardStyled>
                        ))}
                    </DriverList>

                    <Footer>
                        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                        <PrimaryButton
                            disabled={!selectedDriverId || isAssigning}
                            onClick={handleAssign}
                        >
                            {isAssigning ? 'Deploying...' : 'Confirm Assignment'}
                        </PrimaryButton>
                    </Footer>
                </Content>
            </Overlay>
        </AnimatePresence >
    );
};

export default AssignmentModal;
