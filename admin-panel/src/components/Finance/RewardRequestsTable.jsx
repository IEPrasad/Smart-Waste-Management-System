import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Gift, CheckCircle, XCircle, Calendar, Coins } from 'lucide-react';
import ApprovalModal from './ApprovalModal';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TitleBlock = styled.div``;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748B;
  margin: 0;
`;

const Badge = styled.span`
  background: ${props => props.$bg || '#EFF6FF'};
  color: ${props => props.$color || '#2563EB'};
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 99px;
  text-transform: uppercase;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  border-bottom: 2px solid #E2E8F0;
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #F1F5F9;
  font-size: 14px;
`;

const Tr = styled.tr`
  transition: background 0.2s;
  
  &:hover {
    background: #F8FAFC;
  }
`;

const CitizenName = styled.div`
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 4px;
`;

const CitizenEmail = styled.div`
  font-size: 12px;
  color: #64748B;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  
  ${props => props.$variant === 'approve' ? `
    background: #10B981;
    color: white;
    &:hover { background: #059669; }
  ` : `
    background: #EF4444;
    color: white;
    &:hover { background: #DC2626; }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #94A3B8;
`;

const RewardRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: requestsData, error: reqError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (reqError) throw reqError;

      if (!requestsData || requestsData.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(requestsData.map(r => r.user_id))];
      const { data: citizensData, error: citError } = await supabase
        .from('citizens')
        .select('id, full_name, email')
        .in('id', userIds);

      if (citError) throw citError;

      const citizensMap = {};
      if (citizensData) {
        citizensData.forEach(c => {
          citizensMap[c.id] = c;
        });
      }

      const formatted = requestsData.map(req => {
        const requestDate = new Date(req.requested_at);
        const daysActive = Math.max(0, Math.floor((new Date() - requestDate) / (1000 * 60 * 60 * 24)));
        const citizenInfo = citizensMap[req.user_id] || {};

        return {
          id: req.id,
          citizen: citizenInfo.full_name || 'Unknown Citizen',
          email: citizenInfo.email || 'No Email',
          points: Number(req.amount),
          cash: Number(req.amount),
          requestDate: requestDate.toISOString().split('T')[0],
          daysActive: daysActive,
          bankName: req.bank_name,
          accountNumber: req.account_number,
          accountHolder: req.account_holder_name,
          branch: req.branch
        };
      });

      setRequests(formatted);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast.error('Failed to load reward requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setModalOpen(true);
  };

  const confirmAction = async (notes = '') => {
    try {
      const newStatus = actionType === 'approve' ? 'approved' : 'rejected';

      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: newStatus,
          processed_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      if (actionType === 'approve') {
        toast.success(`Approved ${selectedRequest.citizen}'s reward of LKR ${selectedRequest.cash.toLocaleString()}`);
      } else {
        toast.error(`Rejected ${selectedRequest.citizen}'s reward request`);
      }

      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
    } catch (error) {
      console.error(`Error updating request:`, error);
      toast.error(`Failed to process request`);
    } finally {
      setModalOpen(false);
      setSelectedRequest(null);
    }
  };

  return (
    <Card>
      <Header>
        <TitleBlock>
          <Title><Gift size={20} /> Reward Cash-Out Requests</Title>
          <Subtitle>{requests.length} pending approval</Subtitle>
        </TitleBlock>
      </Header>

      {requests.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Citizen</Th>
              <Th>Points</Th>
              <Th>Cash Amount</Th>
              <Th>Request Date</Th>
              <Th>Eligibility</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <Tr key={request.id}>
                <Td>
                  <CitizenName>{request.citizen}</CitizenName>
                  <CitizenEmail>{request.email}</CitizenEmail>
                </Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Coins size={16} color="#F59E0B" />
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{request.points.toLocaleString()}</span>
                  </div>
                </Td>
                <Td style={{ fontWeight: 700, color: '#0F172A' }}>LKR {request.cash.toLocaleString()}</Td>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B' }}>
                    <Calendar size={14} />
                    {request.requestDate}
                  </div>
                </Td>
                <Td>
                  {request.daysActive >= 30 ? (
                    <Badge $bg="#F0FDF4" $color="#16A34A">✓ {request.daysActive} Days</Badge>
                  ) : (
                    <Badge $bg="#FEF2F2" $color="#DC2626">✗ {request.daysActive} Days</Badge>
                  )}
                </Td>
                <Td>
                  <Actions>
                    <ActionButton $variant="approve" onClick={() => handleAction(request, 'approve')}>
                      <CheckCircle size={14} /> Approve
                    </ActionButton>
                    <ActionButton $variant="reject" onClick={() => handleAction(request, 'reject')}>
                      <XCircle size={14} /> Reject
                    </ActionButton>
                  </Actions>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState>
          <Gift size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>No pending requests</div>
          <div style={{ fontSize: 14 }}>All reward requests have been processed</div>
        </EmptyState>
      )}

      <ApprovalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmAction}
        request={selectedRequest}
        actionType={actionType}
      />
    </Card>
  );
};

export default RewardRequestsTable;
