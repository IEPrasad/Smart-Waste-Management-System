import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';

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
  width: 100%; max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
  display: flex; justify-content: space-between; align-items: center;
`;

const Title = styled.h3`
  font-size: 18px; font-weight: 700; color: #0F172A; margin: 0;
`;

const CloseButton = styled.button`
  background: #F1F5F9; border: none; borderRadius: 50%;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #64748B; transition: all 0.2s;
  &:hover { background: #EF4444; color: white; transform: rotate(90deg); }
`;

const Body = styled.div`
  padding: 24px;
`;

const IssueSummary = styled.div`
  background: #F8FAFC;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  margin-bottom: 20px;
`;

const Label = styled.div`
  font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 4px; text-transform: uppercase;
`;

const Text = styled.p`
  font-size: 14px; color: #334155; margin: 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  color: #0F172A;
  background: #FFFFFF;

  &::placeholder {
    color: #94A3B8;
  }
  
  &:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Footer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #E2E8F0;
  display: flex; justify-content: flex-end; gap: 12px;
  background: #F8FAFC;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: ${props => props.$primary ? 'none' : '1px solid #E2E8F0'};
  background: ${props => props.$primary ? '#2563EB' : 'white'};
  color: ${props => props.$primary ? 'white' : '#64748B'};
  display: flex; align-items: center; gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$primary ? '#1E40AF' : '#F1F5F9'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.7; cursor: not-allowed; transform: none;
  }
`;

const ReplyIssueModal = ({ isOpen, onClose, issue, onReply, isSubmitting }) => {
  const [replyText, setReplyText] = useState('');

  // Use Escape key to close
  useEscapeKey(onClose, isOpen);

  if (!isOpen || !issue) return null;

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onReply(issue.id, replyText);
    setReplyText(''); // Clear on success
  };

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
            <Title>Reply to Citizen</Title>
            <CloseButton onClick={onClose}><X size={16} /></CloseButton>
          </Header>

          <Body>
            <IssueSummary>
              <Label>Original Issue</Label>
              <Text>{issue.description}</Text>
            </IssueSummary>

            <Label>Your Response</Label>
            <TextArea
              placeholder="Write a helpful response to the citizen..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
            />
          </Body>

          <Footer>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              $primary
              onClick={handleSubmit}
              disabled={!replyText.trim() || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : <>Send Reply <Send size={16} /></>}
            </Button>
          </Footer>
        </Content>
      </Overlay>
    </AnimatePresence>
  );
};

export default ReplyIssueModal;
