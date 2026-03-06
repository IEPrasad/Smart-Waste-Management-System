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
  max-width: 550px;
  max-height: 90vh;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 28px 32px;
  background: ${props => props.$bg};
  border-bottom: 2px solid ${props => props.$border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.$color};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.5px;
`;

const CloseButton = styled.button`
  background: white;
  border: 1.5px solid ${props => props.$border};
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$color};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: rotate(90deg) scale(1.1);
    background: ${props => props.$hoverBg};
    color: white;
    box-shadow: 0 4px 12px ${props => props.$border}CC;
  }
`;

const Body = styled.div`
  padding: 32px;
  overflow-y: auto;
  flex: 1;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #CBD5E1;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  
  span {
    font-size: 11px;
    font-weight: 900;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E2E8F0;
  }
`;

const SummaryPanel = styled.div`
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const StatsCard = styled.div`
  .label { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px; }
  .value { font-size: 16px; font-weight: 800; color: #0F172A; }
`;

const BankGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 24px;
`;

const BankItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .label { font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; }
  .value { font-size: 13px; font-weight: 700; color: #1E293B; }
`;

const PaymentArea = styled.div`
  background: #F1F5F9;
  border-radius: 16px;
  padding: 20px;
  margin-top: 24px;
`;

const MethodSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const MethodCard = styled.div`
  flex: 1;
  padding: 16px 12px;
  border-radius: 16px;
  background: white;
  border: 2px solid ${props => {
    if (!props.$active) return '#E2E8F0';
    if (props.$method === 'paypal') return '#0070BA';
    if (props.$method === 'card') return '#1A1F71';
    if (props.$method === 'helakuru') return '#0047AB';
    return '#3B82F6';
  }};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$active ? `0 8px 16px -4px ${props.$method === 'paypal' ? 'rgba(0, 112, 186, 0.25)' : props.$method === 'card' ? 'rgba(26, 31, 113, 0.25)' : 'rgba(0, 71, 171, 0.25)'}` : '0 1px 2px rgba(0,0,0,0.02)'};
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.$active ? 'inherit' : '#CBD5E1'};
    box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1);
  }
`;

const MethodIconContainer = styled.div`
  width: 48px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const MethodLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: ${props => {
    if (!props.$active) return '#94A3B8';
    if (props.$method === 'paypal') return '#0070BA';
    if (props.$method === 'card') return '#1A1F71';
    if (props.$method === 'helakuru') return '#0047AB';
    return '#1D4ED8';
  }};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Message = styled.p`
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
  margin: 0 0 20px 0;
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 14px;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => props.$primary ? `
    background: ${props.$bg};
    color: white;
    box-shadow: 0 10px 15px -3px ${props.$bg}4D;
    &:hover { transform: translateY(-2px); box-shadow: 0 15px 20px -4px ${props.$bg}66; }
    &:active { transform: translateY(0); }
  ` : `
    background: #F1F5F9;
    color: #64748B;
    &:hover { background: #E2E8F0; color: #0F172A; }
  `}
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
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <Header $bg={config.bg} $border={config.border}>
            <Title $color={config.color}>
              <Icon size={24} /> {config.title}
            </Title>
            <CloseButton $border={config.border} $color={config.color} $hoverBg={config.buttonBg} onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </Header>

          <Body>
            <SectionHeader><span>Request Details</span></SectionHeader>
            <SummaryPanel>
              <StatsCard>
                <div className="label">Citizen</div>
                <div className="value">{request.citizen}</div>
              </StatsCard>
              <StatsCard>
                <div className="label">Reward Points</div>
                <div className="value">{request.points.toLocaleString()} pts</div>
              </StatsCard>
              <StatsCard>
                <div className="label">Payout Amount</div>
                <div className="value" style={{ color: '#10B981' }}>LKR {request.cash.toLocaleString()}</div>
              </StatsCard>
            </SummaryPanel>

            {isApprove && request.bankName && (
              <>
                <SectionHeader><span>Citizen Bank Account</span></SectionHeader>
                <BankGrid>
                  <BankItem><div className="label">Institution</div><div className="value">{request.bankName}</div></BankItem>
                  <BankItem><div className="label">Account Number</div><div className="value">{request.accountNumber}</div></BankItem>
                  <BankItem><div className="label">Holder Name</div><div className="value">{request.accountHolder}</div></BankItem>
                  <BankItem><div className="label">Branch Name</div><div className="value">{request.branch}</div></BankItem>
                </BankGrid>
              </>
            )}

            {!isApprove && (
              <TextArea
                style={{ marginTop: 8 }}
                placeholder="Reason for rejection (this will be visible to the citizen)..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
              />
            )}

            {isApprove && (
              <>
                <SectionHeader><span>Authorize Payout</span></SectionHeader>
                <Message>{config.message}</Message>

                <MethodSelector>
                  <MethodCard $active={paymentMethod === 'paypal'} $method="paypal" onClick={() => setPaymentMethod('paypal')}>
                    <MethodIconContainer><img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" /></MethodIconContainer>
                    <MethodLabel $active={paymentMethod === 'paypal'} $method="paypal">PayPal</MethodLabel>
                  </MethodCard>

                  <MethodCard $active={paymentMethod === 'card'} $method="card" onClick={() => setPaymentMethod('card')}>
                    <MethodIconContainer><img src={visaLogo} alt="Visa" /></MethodIconContainer>
                    <MethodLabel $active={paymentMethod === 'card'} $method="card">Visa/Card</MethodLabel>
                  </MethodCard>

                  <MethodCard $active={paymentMethod === 'helakuru'} $method="helakuru" onClick={() => setPaymentMethod('helakuru')}>
                    <MethodIconContainer><img src={helakuruLogo} alt="හෙළPay" /></MethodIconContainer>
                    <MethodLabel $active={paymentMethod === 'helakuru'} $method="helakuru">හෙළPay</MethodLabel>
                  </MethodCard>
                </MethodSelector>

                <PaymentArea>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={paymentMethod}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {paymentMethod === 'helakuru' ? (
                        <Button
                          $primary
                          $bg="#0047AB"
                          style={{ width: '100%' }}
                          disabled={isHelakuruProcessing}
                          onClick={async () => {
                            setIsHelakuruProcessing(true);
                            setTimeout(() => {
                              onConfirm(`හෙළPay Transaction: HP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
                              setIsHelakuruProcessing(false);
                            }, 2000);
                          }}
                        >
                          {isHelakuruProcessing ? 'Authenticating හෙළPay...' : 'Confirm හෙළPay Transaction'}
                        </Button>
                      ) : (
                        <PayPalButtons
                          key={`${paymentMethod}-${request.id}`}
                          forceReRender={[paymentMethod, request.cash]}
                          style={{
                            layout: 'vertical',
                            height: 48,
                            color: 'blue',
                            label: paymentMethod === 'card' ? 'buynow' : 'pay',
                            tagline: false
                          }}
                          fundingSource={paymentMethod === 'card' ? 'card' : undefined}
                          createOrder={(data, actions) => {
                            const usdAmount = (request.cash / 300).toFixed(2);
                            return actions.order.create({
                              purchase_units: [{
                                amount: { value: usdAmount, currency_code: 'USD' },
                                description: `Reward Withdrawal for ${request.citizen} via ${paymentMethod}`
                              }],
                            });
                          }}
                          onApprove={async (data, actions) => {
                            const details = await actions.order.capture();
                            onConfirm(`${paymentMethod.toUpperCase()} ID: ${details.id}`);
                          }}
                          onError={(err) => {
                            console.error('Payment Error:', err);
                            toast.error('Payment interface failed to load.');
                          }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </PaymentArea>
              </>
            )}

            <Actions>
              <Button onClick={onClose}>Discard</Button>
              {!isApprove && (
                <Button $primary $bg={config.buttonBg} onClick={() => onConfirm(rejectionNote)}>
                  Notify & Reject
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
