import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, Trash2, HelpCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  display: flex;
  gap: 16px;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.$priorityColor || '#E2E8F0'};
  }
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bg || '#F1F5F9'};
  color: ${props => props.$color || '#64748B'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
  margin-bottom: 4px;
`;

const PriorityBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 99px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  text-transform: capitalize;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  background: #EFF6FF;
  color: #2563EB;
  border: 1px solid #BFDBFE;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 6px;

  &:hover {
    background: #2563EB;
    color: white;
  }
`;

const Description = styled.p`
  font-size: 14px;
  color: #64748B;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #94A3B8;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

// Helper to determine styles based on issue type and priority
const getIssueConfig = (type, priority) => {
  const types = {
    'missed-pickup': { icon: Trash2, color: '#DC2626', bg: '#FEF2F2', label: 'Missed Pickup' },
    'damaged-bin': { icon: AlertTriangle, color: '#D97706', bg: '#FFFBEB', label: 'Damaged Bin' },
    'incorrect-sorting': { icon: HelpCircle, color: '#7C3AED', bg: '#F3E8FF', label: 'Incorrect Sorting' },
    'other': { icon: HelpCircle, color: '#2563EB', bg: '#EFF6FF', label: 'Other Issue' }
  };

  const priorities = {
    high: { color: '#EF4444', bg: '#FEF2F2' },
    medium: { color: '#F59E0B', bg: '#FFFBEB' },
    low: { color: '#3B82F6', bg: '#EFF6FF' }
  };

  return {
    typeConfig: types[type] || types['other'],
    priorityStart: priorities[priority] || priorities['low']
  };
};

const IssueCard = ({ issue, onClick, onReply }) => {
  const { typeConfig, priorityStart } = getIssueConfig(issue.issue_type, issue.priority);
  const Icon = typeConfig.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <Card $priorityColor={priorityStart.color} onClick={onClick}>
      <IconBox $bg={typeConfig.bg} $color={typeConfig.color}>
        <Icon size={24} />
      </IconBox>

      <Content>
        <Header>
          <div>
            <Title>{typeConfig.label}</Title>
            <div style={{ fontSize: '13px', color: '#64748B' }}>
              Reported by <span style={{ fontWeight: 600, color: '#334155' }}>{issue.citizens?.full_name || 'Anonymous'}</span>
            </div>
          </div>
          <PriorityBadge $bg={priorityStart.bg} $color={priorityStart.color}>
            {issue.priority} Priority
          </PriorityBadge>
        </Header>

        <Description>{issue.description}</Description>

        <Footer>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
            <MetaItem>
              <Clock size={14} />
              <span>{formatDate(issue.created_at)}</span>
            </MetaItem>
            {issue.status === 'resolved' && (
              <MetaItem style={{ color: '#22C55E' }}>
                <CheckCircle2 size={14} />
                <span>Resolved</span>
              </MetaItem>
            )}
          </div>

          {issue.status !== 'resolved' && issue.status !== 'rejected' && (
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onReply(issue);
              }}
            >
              Reply & Resolve
            </ActionButton>
          )}
        </Footer>
      </Content>
    </Card>
  );
};

export default IssueCard;
