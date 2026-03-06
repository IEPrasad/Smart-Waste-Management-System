import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Phone, Mail, User } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
`;

const Content = styled(motion.div)`
  background: white;
  width: 100%; max-width: 450px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-height: 80vh;
  display: flex; flex-direction: column;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
  display: flex; justify-content: space-between; align-items: center;
  background: #FFFFFF;
`;

const Title = styled.h3`
  font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;
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

const SearchContainer = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #F1F5F9;
  background: #F8FAFC;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex; align-items: center;
`;

const SearchIcon = styled(Search)`
  position: absolute; left: 12px; color: #94A3B8;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  color: #0F172A;
  background: white;

  &:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const List = styled.div`
  flex: 1; overflow-y: auto;
  padding: 12px 0;
`;

const DriverItem = styled.div`
  padding: 12px 24px;
  display: flex; align-items: center; gap: 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #F8FAFC;

  &:hover {
    background: #F8FAFC;
  }
`;

const Avatar = styled.div`
  width: 40px; height: 40px; border-radius: 10px;
  background: #EFF6FF; color: #2563EB;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 16px;
`;

const DriverInfo = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-size: 14px; font-weight: 600; color: #0F172A; margin-bottom: 2px;
`;

const Detail = styled.div`
  font-size: 12px; color: #64748B; display: flex; align-items: center; gap: 4px;
`;

const ContactButton = styled.a`
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #64748B; border: 1px solid #E2E8F0;
  transition: all 0.2s;
  
  &:hover {
    background: #EFF6FF; color: #2563EB; border-color: #BFDBFE;
  }
`;

const DriverContactModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Drivers from DB
  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('driver')
        .select('id, full_name, mobile_number, email');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredDrivers = drivers.filter(d =>
    (d.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.mobile_number || '').includes(search)
  );

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
            <Title>Driver Contacts</Title>
            <CloseButton onClick={onClose}><X size={20} strokeWidth={2.5} /></CloseButton>
          </Header>

          <SearchContainer>
            <SearchInputWrapper>
              <SearchIcon size={18} />
              <SearchInput
                placeholder="Search drivers by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </SearchInputWrapper>
          </SearchContainer>

          <List>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Loading contacts...</div>
            ) : filteredDrivers.length > 0 ? filteredDrivers.map(driver => (
              <DriverItem key={driver.id}>
                <Avatar>{(driver.full_name || 'U').charAt(0)}</Avatar>
                <DriverInfo>
                  <Name>{driver.full_name}</Name>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Detail><Phone size={10} /> {driver.mobile_number}</Detail>
                  </div>
                </DriverInfo>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <ContactButton href={`tel:${driver.mobile_number}`} title="Call">
                    <Phone size={14} />
                  </ContactButton>
                  <ContactButton href={`mailto:${driver.email}`} title="Email">
                    <Mail size={14} />
                  </ContactButton>
                </div>
              </DriverItem>
            )) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                No drivers found
              </div>
            )}
          </List>
        </Content>
      </Overlay>
    </AnimatePresence>
  );
};

export default DriverContactModal;
