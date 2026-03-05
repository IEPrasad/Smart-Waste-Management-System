import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Radio, AlertCircle, CheckCircle2, Truck } from 'lucide-react';
// needed supabase to show real activity instead of fake data
import { supabase } from '../../lib/supabaseClient';

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  height: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 16px; font-weight: 700; color: #0F172A; margin: 0;
  display: flex; align-items: center; gap: 8px;
`;

const LiveBadge = styled.span`
  background: #FEF2F2; color: #EF4444;
  font-size: 11px; font-weight: 700; padding: 2px 8px;
  border-radius: 99px; display: flex; align-items: center; gap: 4px;
  border: 1px solid #FECACA;
`;

const Pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const Dot = styled.div`
  width: 6px; height: 6px; border-radius: 50%; background: #EF4444;
  animation: ${Pulse} 2s infinite ease-in-out;
`;

const FeedList = styled.div`
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 12px;
  padding-right: 4px;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
`;

const FeedItem = styled.div`
  display: flex; gap: 12px;
  padding: 12px; background: #F8FAFC;
  border-radius: 12px; border: 1px solid #F1F5F9;
  font-size: 13px; color: #334155;
`;

const IconWrapper = styled.div`
  width: 32px; height: 32px; border-radius: 8px;
  background: ${props => props.$bg}; color: ${props => props.$color};
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;

const TimeText = styled.span`
  font-size: 11px; color: #94A3B8; display: block; margin-top: 4px;
`;

const LiveActivityFeed = () => {

  const [activityList, setActivityList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestActivity();
  }, []);

  async function getLatestActivity() {
    setLoading(true);

    // fetch latest issues and pickups at same time
    const [issuesRes, pickupsRes] = await Promise.all([
      supabase
        .from('waste_issues')
        .select('id, description, priority, status, created_at, citizens(full_name)')
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('pickups')
        .select('id, status, completed_at, created_at, driver(full_name), citizens(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // combine both into one list
    const issueEvents = (issuesRes.data || []).map(item => ({
      id: 'issue-' + item.id,
      type: item.status === 'resolved' ? 'resolved' : item.priority === 'high' ? 'high_issue' : 'issue',
      message: buildIssueMessage(item),
      time: item.created_at,
    }));

    const pickupEvents = (pickupsRes.data || []).map(item => ({
      id: 'pickup-' + item.id,
      type: item.status === 'completed' ? 'completed' : 'pickup',
      message: buildPickupMessage(item),
      time: item.created_at,
    }));

    // sort all events by time newest first
    const combined = [...issueEvents, ...pickupEvents]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    setActivityList(combined);
    setLoading(false);
  }

  function buildIssueMessage(issue) {
    const name = issue.citizens?.full_name || 'A citizen';
    if (issue.status === 'resolved') return `Issue resolved — ${issue.description?.slice(0, 40)}`;
    if (issue.priority === 'high') return `${name} reported a High Priority Issue`;
    if (issue.priority === 'medium') return `${name} reported a Medium Priority Issue`;
    return `${name} reported a new issue`;
  }

  function buildPickupMessage(pickup) {
    const driver = pickup.driver?.full_name || 'A driver';
    const citizen = pickup.citizens?.full_name || 'a citizen';
    if (pickup.status === 'completed') return `${driver} completed pickup for ${citizen}`;
    return `Pickup scheduled for ${citizen}`;
  }

  // pick icon and color based on event type
  function getIconConfig(type) {
    if (type === 'resolved') return { icon: CheckCircle2, color: '#22C55E', bg: '#F0FDF4' };
    if (type === 'high_issue') return { icon: AlertCircle, color: '#EF4444', bg: '#FEF2F2' };
    if (type === 'completed') return { icon: Truck, color: '#3B82F6', bg: '#EFF6FF' };
    if (type === 'pickup') return { icon: Truck, color: '#3B82F6', bg: '#EFF6FF' };
    return { icon: AlertCircle, color: '#F59E0B', bg: '#FFFBEB' };
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

  return (
    <Card>
      <Header>
        <Title><Radio size={18} /> Live Activity</Title>
        <LiveBadge><Dot /> LIVE</LiveBadge>
      </Header>

      <FeedList>
        {loading && (
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>Loading...</p>
        )}

        {!loading && activityList.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No recent activity</p>
        )}

        {!loading && activityList.map(event => {
          const { icon: Icon, color, bg } = getIconConfig(event.type);
          return (
            <FeedItem key={event.id}>
              <IconWrapper $bg={bg} $color={color}>
                <Icon size={16} />
              </IconWrapper>
              <div>
                <div style={{ fontWeight: 500 }}>{event.message}</div>
                <TimeText>{getTimeAgo(event.time)}</TimeText>
              </div>
            </FeedItem>
          );
        })}
      </FeedList>
    </Card>
  );
};

export default LiveActivityFeed;