import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
// connecting supabase to get real data
import { supabase } from '../../lib/supabaseClient';

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

const Title = styled.h3`
  font-size: 20px; font-weight: 800; color: #991B1B; margin: 0 0 4px 0;
  display: flex; align-items: center; gap: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px; color: #B91C1C; margin: 0; opacity: 0.9;
`;

const CloseButton = styled.button`
  background: #EF4444; border: none; border-radius: 50%;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { background: #DC2626; transform: rotate(90deg) scale(1.1); }
`;

const Body = styled.div`
  padding: 0; overflow-y: auto; background: #FAFAFA;
`;

const IssueItem = styled.div`
  padding: 20px 24px; border-bottom: 1px solid #E5E7EB;
  background: white; transition: all 0.2s;
  &:hover { background: #FEF2F2; }
`;

const IssueHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
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
  font-size: 13px; color: #4B5563; margin-bottom: 16px;
`;

const Actions = styled.div`display: flex; gap: 12px;`;

const ActionButton = styled.button`
  flex: 1; padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s; border: none;
  ${props => props.$primary ? `
    background: #DC2626; color: white;
    &:hover { background: #B91C1C; }
  ` : `
    background: white; color: #4B5563; border: 1px solid #E5E7EB;
    &:hover { background: #F3F4F6; color: #111827; }
  `}
`;

const DetailBody = styled.div`
  padding: 24px; overflow-y: auto;
`;

const BackButton = styled.button`
  background: none; border: none; cursor: pointer;
  color: #6B7280; font-size: 14px; font-weight: 600;
  display: flex; align-items: center; gap: 6px; padding: 0;
  margin-bottom: 20px;
  &:hover { color: #111827; }
`;

const DetailRow = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 14px 0; border-bottom: 1px solid #F3F4F6;
`;

const DetailLabel = styled.span`
  font-size: 13px; color: #6B7280; font-weight: 500; flex-shrink: 0;
`;

const DetailValue = styled.span`
  font-size: 13px; color: #111827; font-weight: 600;
  text-align: right; max-width: 60%;
`;

const DetailFooter = styled.div`
  display: flex; gap: 10px; margin-top: 24px;
`;

const CriticalIssuesModal = ({ isOpen, onClose }) => {

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadIssues();
      setSelectedIssue(null);
    }
  }, [isOpen]);

  async function loadIssues() {
    setLoading(true);

    const { data, error } = await supabase
      .from('waste_issues')
      .select('*, citizens(full_name, gn_division, division)')
      .eq('priority', 'high')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('error:', error);
    } else {
      setIssues(data);
    }
    setLoading(false);
  }

  function getTimeAgo(timestamp) {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMins = Math.floor((now - created) / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  }

  async function resolveIssue(id) {
    const { error } = await supabase
      .from('waste_issues')
      .update({ status: 'resolved' })
      .eq('id', id);

    if (error) {
      console.error('resolve error:', error);
    } else {
      setIssues(prev => prev.filter(item => item.id !== id));
      setSelectedIssue(null);
    }
  }

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

          {/* detail view */}
          {selectedIssue ? (
            <>
              <Header>
                <div>
                  <Title><AlertTriangle size={24} /> Issue Details</Title>
                  <Subtitle>Full information about this issue</Subtitle>
                </div>
                <CloseButton onClick={onClose}><X size={20} strokeWidth={2.5} /></CloseButton>
              </Header>

              <DetailBody>
                <BackButton onClick={() => setSelectedIssue(null)}>
                  <ArrowLeft size={16} /> Back to all issues
                </BackButton>
                <DetailRow>
                  <DetailLabel>Issue ID</DetailLabel>
                  <DetailValue>#{selectedIssue.id.slice(0, 8)}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Issue Type</DetailLabel>
                  <DetailValue>{selectedIssue.issue_type}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Description</DetailLabel>
                  <DetailValue>{selectedIssue.description}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Reported By</DetailLabel>
                  <DetailValue>{selectedIssue.citizens?.full_name || 'Unknown'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>GN Division</DetailLabel>
                  <DetailValue>{selectedIssue.citizens?.gn_division || 'N/A'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Division</DetailLabel>
                  <DetailValue>{selectedIssue.citizens?.division || 'N/A'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Priority</DetailLabel>
                  <DetailValue style={{ color: '#DC2626' }}>HIGH</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Status</DetailLabel>
                  <DetailValue>{selectedIssue.status}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Reported At</DetailLabel>
                  <DetailValue>{new Date(selectedIssue.created_at).toLocaleString()}</DetailValue>
                </DetailRow>

                <DetailFooter>
                  <ActionButton onClick={() => setSelectedIssue(null)}>Back</ActionButton>
                  <ActionButton $primary onClick={() => resolveIssue(selectedIssue.id)}>
                    Resolve Now <ArrowRight size={14} />
                  </ActionButton>
                </DetailFooter>
              </DetailBody>
            </>
          ) : (
            <>
              {/* main list */}
              <Header>
                <div>
                  <Title><AlertTriangle size={24} /> Critical Issues</Title>
                  <Subtitle>{issues.length} High-Priority incidents require immediate attention</Subtitle>
                </div>
                <CloseButton onClick={onClose}><X size={20} strokeWidth={2.5} /></CloseButton>
              </Header>

              <Body>
                {loading && (
                  <p style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>Loading...</p>
                )}

                {!loading && issues.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '30px', color: '#22C55E', fontWeight: 600 }}>
                    ✓ No critical issues right now!
                  </p>
                )}

                {!loading && issues.map(issue => (
                  <IssueItem key={issue.id}>
                    <IssueHeader>
                      <SeverityBadge>Critical</SeverityBadge>
                      <Time><Clock size={14} /> {getTimeAgo(issue.created_at)}</Time>
                    </IssueHeader>
                    <Description>{issue.description}</Description>
                    <Location>
                      <MapPin size={14} />
                      {issue.citizens?.gn_division || 'N/A'} · {issue.citizens?.division || 'N/A'}
                    </Location>
                    <Actions>
                      <ActionButton onClick={() => setSelectedIssue(issue)}>
                        View Details
                      </ActionButton>
                      <ActionButton $primary onClick={() => resolveIssue(issue.id)}>
                        Resolve Now <ArrowRight size={14} />
                      </ActionButton>
                    </Actions>
                  </IssueItem>
                ))}
              </Body>
            </>
          )}

        </Content>
      </Overlay>
    </AnimatePresence>
  );
};

export default CriticalIssuesModal;