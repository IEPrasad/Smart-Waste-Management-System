import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, XCircle, Wallet, CreditCard, Smartphone } from 'lucide-react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import useEscapeKey from '../../hooks/useEscapeKey';
import visaLogo from '../../assets/visa_logo.png';
import helakuruLogo from '../../assets/helakuru_logo.png';

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

const MethodSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
`;

const MethodCard = styled.div`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${props => {
    if (!props.$active) return '#E2E8F0';
    if (props.$method === 'paypal') return '#0070BA';
    if (props.$method === 'card') return '#1A1F71';
    if (props.$method === 'helakuru') return '#0047AB';
    return '#3B82F6';
  }};
  background: ${props => props.$active ? 'white' : 'white'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$active ? `0 10px 15px -3px ${props.$method === 'paypal' ? 'rgba(0, 112, 186, 0.2)' : props.$method === 'card' ? 'rgba(20, 52, 203, 0.2)' : 'rgba(255, 78, 0, 0.2)'}` : 'none'};
  
  &:hover {
    border-color: ${props => props.$method === 'paypal' ? '#0070BA' : props.$method === 'card' ? '#1434CB' : '#FF4E00'};
    transform: translateY(-2px);
  }
`;

const MethodIconContainer = styled.div`
  width: 44px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const MethodLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  color: ${props => {
    if (!props.$active) return '#64748B';
    if (props.$method === 'paypal') return '#0070BA';
    if (props.$method === 'card') return '#1A1F71';
    if (props.$method === 'helakuru') return '#0047AB';
    return '#1D4ED8';
  }};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BankSection = styled.div`
  margin: 16px 0;
  padding: 16px;
  background: #F1F5F9;
  border-radius: 12px;
  border-left: 4px solid #94A3B8;
`;

const BankTitle = styled.h4`
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BankRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  &:last-child { margin-bottom: 0; }
`;

const BankLabel = styled.span`
  font-size: 11px;
  color: #64748B;
  font-weight: 600;
`;

const BankValue = styled.span`
  font-size: 11px;
  color: #0F172A;
  font-weight: 700;
`;

const RejectionSection = styled.div`
  margin-top: 16px;
`;

const NoteLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #991B1B;
  margin-bottom: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #FECACA;
  background: #FFF;
  color: #0F172A;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: #EF4444;
  }
  
  &::placeholder {
    color: #94A3B8;
  }
`;

const ApprovalModal = ({ isOpen, onClose, onConfirm, request, actionType }) => {
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [isHelakuruProcessing, setIsHelakuruProcessing] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');

  // Use Escape key to close
  useEscapeKey(onClose, isOpen);

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

            {isApprove && request.bankName && (
              <BankSection>
                <BankTitle>🏦 Citizen Bank Details</BankTitle>
                <BankRow>
                  <BankLabel>Bank</BankLabel>
                  <BankValue>{request.bankName}</BankValue>
                </BankRow>
                <BankRow>
                  <BankLabel>Account Holder</BankLabel>
                  <BankValue>{request.accountHolder}</BankValue>
                </BankRow>
                <BankRow>
                  <BankLabel>Account Number</BankLabel>
                  <BankValue>{request.accountNumber}</BankValue>
                </BankRow>
                <BankRow>
                  <BankLabel>Branch</BankLabel>
                  <BankValue>{request.branch}</BankValue>
                </BankRow>
              </BankSection>
            )}

            <Message>{config.message}</Message>

            {!isApprove && (
              <RejectionSection>
                <NoteLabel>Reason for Rejection (Optional)</NoteLabel>
                <TextArea
                  placeholder="Explain why this request is being rejected..."
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                />
              </RejectionSection>
            )}

            {isApprove && (
              <MethodSelector>
                <MethodCard $active={paymentMethod === 'paypal'} $method="paypal" onClick={() => setPaymentMethod('paypal')}>
                  <MethodIconContainer>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
                  </MethodIconContainer>
                  <MethodLabel $active={paymentMethod === 'paypal'} $method="paypal">PayPal</MethodLabel>
                </MethodCard>
                <MethodCard $active={paymentMethod === 'card'} $method="card" onClick={() => setPaymentMethod('card')}>
                  <MethodIconContainer>
                    <img src={visaLogo} alt="Visa" />
                  </MethodIconContainer>
                  <MethodLabel $active={paymentMethod === 'card'} $method="card">Visa/Card</MethodLabel>
                </MethodCard>
                <MethodCard $active={paymentMethod === 'helakuru'} $method="helakuru" onClick={() => setPaymentMethod('helakuru')}>
                  <MethodIconContainer>
                    <img src={helakuruLogo} alt="හෙළPay" />
                  </MethodIconContainer>
                  <MethodLabel $active={paymentMethod === 'helakuru'} $method="helakuru">හෙළPay</MethodLabel>
                </MethodCard>
              </MethodSelector>
            )}

            <Actions>
              <Button onClick={onClose}>Cancel</Button>
              {isApprove ? (
                <div style={{ flex: 1.5, minHeight: '44px' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={paymentMethod}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {paymentMethod === 'helakuru' ? (
                        <Button
                          $primary
                          $bg="#0047AB"
                          style={{ width: '100%', height: 44, borderRadius: 10 }}
                          disabled={isHelakuruProcessing}
                          onClick={async () => {
                            setIsHelakuruProcessing(true);
                            // Simulating හෙළPay Payout Flow
                            setTimeout(() => {
                              onConfirm(`හෙළPay Transaction: HP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
                              setIsHelakuruProcessing(false);
                            }, 2000);
                          }}
                        >
                          {isHelakuruProcessing ? 'Processing හෙළPay...' : 'Pay with හෙළPay'}
                        </Button>
                      ) : (
                        <PayPalButtons
                          key={`${paymentMethod}-${request.id}`}
                          forceReRender={[paymentMethod, request.cash]}
                          style={{
                            layout: 'vertical',
                            height: 44,
                            color: 'blue',
                            label: paymentMethod === 'card' ? 'buynow' : 'pay',
                            tagline: false
                          }}
                          fundingSource={paymentMethod === 'card' ? 'card' : undefined}
                          createOrder={(data, actions) => {
                            const usdAmount = (request.cash / 300).toFixed(2);
                            return actions.order.create({
                              purchase_units: [{
                                amount: {
                                  value: usdAmount,
                                  currency_code: 'USD'
                                },
                                description: `Reward Withdrawal for ${request.citizen} via ${paymentMethod}`
                              }],
                            });
                          }}
                          onApprove={async (data, actions) => {
                            const details = await actions.order.capture();
                            onConfirm(`${paymentMethod.toUpperCase()} Transaction ID: ${details.id}`);
                          }}
                          onError={(err) => {
                            console.error('Payment Error:', err);
                            toast.error('Payment gateway failed to load. Try another method.');
                          }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <Button $primary $bg={config.buttonBg} onClick={() => onConfirm(rejectionNote)}>
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
