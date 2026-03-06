import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { PayPalButtons } from "@paypal/react-paypal-js";

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Content = styled(motion.div)`
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  background: ${props => props.$bg};
  border-bottom: 1px solid ${props => props.$border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.$color};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: white;
  border: 1px solid ${props => props.$border};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$color};
  transition: all 0.2s;
  
  &:hover {
    transform: rotate(90deg);
    background: ${props => props.$hoverBg};
    color: white;
  }
`;

const Body = styled.div`
  padding: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const Label = styled.span`
  font-size: 14px;
  color: #64748B;
  font-weight: 600;
`;

const Value = styled.span`
  font-size: 14px;
  color: #0F172A;
  font-weight: 700;
`;

const Message = styled.p`
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin: 16px 0 24px 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$primary ? `
    background: ${props.$bg};
    color: white;
    &:hover { opacity: 0.9; }
  ` : `
    background: white;
    color: #64748B;
    border: 1px solid #E2E8F0;
    &:hover { background: #F8FAFC; color: #0F172A; }
  `}
`;

const ApprovalModal = ({ isOpen, onClose, onConfirm, request, actionType }) => {
  if (!isOpen || !request) return null;

  const isApprove = actionType === 'approve';
  const config = isApprove ? {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    color: '#166534',
    icon: CheckCircle,
    title: 'Approve Reward Request',
    message: 'This will transfer the cash amount to the citizen\'s bank account.',
    buttonBg: '#10B981',
    hoverBg: '#059669'
  } : {
    bg: '#FEF2F2',
    border: '#FECACA',
    color: '#991B1B',
    icon: XCircle,
    title: 'Reject Reward Request',
    message: 'The points will remain in the citizen\'s account for future claims.',
    buttonBg: '#EF4444',
    hoverBg: '#DC2626'
  };

  const Icon = config.icon;

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
          <Header $bg={config.bg} $border={config.border}>
            <Title $color={config.color}>
              <Icon size={20} /> {config.title}
            </Title>
            <CloseButton $border={config.border} $color={config.color} $hoverBg={config.buttonBg} onClick={onClose}>
              <X size={16} />
            </CloseButton>
          </Header>

          <Body>
            <InfoRow>
              <Label>Citizen</Label>
              <Value>{request.citizen}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Points</Label>
              <Value>{request.points.toLocaleString()}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Cash Amount</Label>
              <Value>LKR {request.cash.toLocaleString()}</Value>
            </InfoRow>

            <Message>{config.message}</Message>

            <Actions>
              <Button onClick={onClose}>Cancel</Button>
              {isApprove ? (
                <div style={{ flex: 1.5 }}>
                  <PayPalButtons
                    style={{ layout: 'horizontal', height: 44, color: 'blue', label: 'pay' }}
                    createOrder={(data, actions) => {
                      // Convert LKR to USD (1 USD = 300 LKR approximately)
                      const usdAmount = (request.cash / 300).toFixed(2);
                      return actions.order.create({
                        purchase_units: [{
                          amount: {
                            value: usdAmount,
                            currency_code: 'USD'
                          },
                          description: `Reward Withdrawal for ${request.citizen}`
                        }],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const details = await actions.order.capture();
                      console.log('Payment Successful:', details);
                      onConfirm(`PayPal Transaction ID: ${details.id}`);
                    }}
                    onError={(err) => {
                      console.error('PayPal Error:', err);
                    }}
                  />
                </div>
              ) : (
                <Button $primary $bg={config.buttonBg} onClick={onConfirm}>
                  Confirm Rejection
                </Button>
              )}
            </Actions>
          </Body>
        </Content>
      </Overlay>
    </AnimatePresence>
  );
};

export default ApprovalModal;
