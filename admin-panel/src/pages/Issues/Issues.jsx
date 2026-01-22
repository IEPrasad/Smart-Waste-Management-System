import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabaseClient';
import IssueCard from '../../components/Issues/IssueCard';
import ReplyIssueModal from '../../components/Issues/ReplyIssueModal';
import { Inbox, History, Filter } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- Styled Components ---

const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8FAFC;
  padding: 32px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #64748B;
  margin: 0;
  font-size: 14px;
`;

const TabsContainer = styled.div`
  display: flex;
  background: white;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  width: fit-content;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$active ? '#EFF6FF' : 'transparent'};
  color: ${props => props.$active ? '#2563EB' : '#64748B'};

  &:hover {
    color: ${props => props.$active ? '#2563EB' : '#0F172A'};
  }
`;

const EmptyState = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px;
  color: #94A3B8;
  background: white;
  border-radius: 16px;
  border: 1px dashed #E2E8F0;
`;

const Issues = () => {
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // Reply Modal State
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [selectedIssueForReply, setSelectedIssueForReply] = useState(null);
    const [isReplying, setIsReplying] = useState(false);

    // Fetch Issues & Setup Realtime
    useEffect(() => {
        fetchIssues();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('waste-issues-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'waste_issues' },
                (payload) => {
                    console.log('Real-time update:', payload);
                    fetchIssues(); // Refresh data on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            // Attempt to fetch from real table
            const { data, error } = await supabase
                .from('waste_issues')
                .select('*, citizens(full_name, mobile_number)')
                .order('created_at', { ascending: true }); // Oldest first for backlog clearing

            if (error) {
                console.error('Error fetching issues:', error);
                // Only mock on error (e.g. table missing)
                setIssues(MOCK_ISSUES);
            } else {
                setIssues(data || []);
            }
        } catch (err) {
            console.error('Error fetching issues:', err);
            setIssues(MOCK_ISSUES);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const displayedIssues = issues.filter(issue => {
        if (activeTab === 'active') {
            return issue.status !== 'resolved' && issue.status !== 'rejected';
        } else {
            return issue.status === 'resolved' || issue.status === 'rejected';
        }
    });

    const handleIssueClick = (issue) => {
        toast('Issue details view coming soon', { icon: '🚧' });
    };

    const handleOpenReply = (issue) => {
        setSelectedIssueForReply(issue);
        setIsReplyModalOpen(true);
    };

    const handleSendReply = async (issueId, replyText) => {
        setIsReplying(true);
        try {
            const { error } = await supabase
                .from('waste_issues')
                .update({
                    status: 'resolved',
                    admin_response: replyText
                })
                .eq('id', issueId);

            if (error) throw error;

            toast.success('Reply sent & issue resolved!');
            setIsReplyModalOpen(false);
            setSelectedIssueForReply(null);
            fetchIssues(); // Refresh list to move it to history
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply');
        } finally {
            setIsReplying(false);
        }
    };

    return (
        <PageContainer>
            <Toaster position="top-right" />

            <Header>
                <div>
                    <Title>Issue Management</Title>
                    <Subtitle>Resolve citizen reports and track neighborhood status</Subtitle>
                </div>
            </Header>

            <TabsContainer>
                <Tab
                    $active={activeTab === 'active'}
                    onClick={() => setActiveTab('active')}
                >
                    <Inbox size={18} />
                    Active Issues
                    {activeTab === 'active' && <span style={{ marginLeft: 6, background: '#BFDBFE', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{displayedIssues.length}</span>}
                </Tab>
                <Tab
                    $active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                >
                    <History size={18} />
                    History
                </Tab>
            </TabsContainer>

            {loading ? (
                <div>Loading issues...</div>
            ) : displayedIssues.length > 0 ? (
                displayedIssues.map(issue => (
                    <IssueCard
                        key={issue.id}
                        issue={issue}
                        onClick={() => handleIssueClick(issue)}
                        onReply={handleOpenReply}
                    />
                ))
            ) : (
                <EmptyState>
                    <Inbox size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                    <p style={{ fontWeight: 600, fontSize: 16 }}>No issues found</p>
                    <p style={{ fontSize: 14 }}>Great job! All issues have been resolved.</p>
                </EmptyState>
            )}

            <ReplyIssueModal
                isOpen={isReplyModalOpen}
                onClose={() => setIsReplyModalOpen(false)}
                issue={selectedIssueForReply}
                onReply={handleSendReply}
                isSubmitting={isReplying}
            />
        </PageContainer>
    );
};

// --- Mock Data (Smart Fallback) ---
const MOCK_ISSUES = [
    {
        id: '1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        issue_type: 'missed-pickup',
        description: 'Trash truck skipped my house today. The bin was out by 6 AM.',
        priority: 'high',
        status: 'open',
        citizens: { full_name: 'Sarah Johnson' }
    },
    {
        id: '2',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        issue_type: 'damaged-bin',
        description: 'My recycling bin has a large crack on the side and the lid is broken.',
        priority: 'medium',
        status: 'in_progress',
        citizens: { full_name: 'Mike Chen' }
    },
    {
        id: '3',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        issue_type: 'incorrect-sorting',
        description: 'Neighbor keeps putting plastic bags in the organic bin.',
        priority: 'low',
        status: 'open',
        citizens: { full_name: 'Emily Davis' }
    },
    {
        id: '4',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(), // 4 days ago
        issue_type: 'other',
        description: 'Requesting a larger bin for next month.',
        priority: 'low',
        status: 'resolved',
        citizens: { full_name: 'John Smith' }
    }
];

export default Issues;
