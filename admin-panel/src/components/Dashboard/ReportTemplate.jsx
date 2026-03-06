import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PrintReset = createGlobalStyle`
  @media print {
    /* Hide everything on the page */
    body * {
      visibility: hidden !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Reveal only the report container and its children */
    #operational-report, #operational-report * {
      visibility: visible !important;
    }
    
    /* Position the report at the very top left of the print surface */
    #operational-report {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      display: block !important;
    }

    /* Aggressively hide common UI elements that might still take space */
    nav, aside, header, footer, button, .no-print {
      display: none !important;
    }

    /* Remove page margins added by browser for a cleaner look */
    @page {
      margin: 0;
    }
  }
`;

const PrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
    background: white;
    padding: 0;
    margin: 0;
  }
  
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0F172A;
`;

const Page = styled.div`
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  margin: 0 auto;
  background: white;
`;

const Header = styled.div`
  border-bottom: 2px solid #0F172A;
  padding-bottom: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 900;
  color: #10B981;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ReportTitle = styled.div`
  text-align: right;
  h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; }
  p { margin: 5px 0 0 0; font-size: 12px; color: #64748B; }
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 800;
  color: #1E40AF;
  text-transform: uppercase;
  border-left: 4px solid #3B82F6;
  padding-left: 12px;
  margin-bottom: 15px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const SummaryCard = styled.div`
  padding: 15px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  
  .label { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 5px; }
  .value { font-size: 18px; font-weight: 800; color: #0F172A; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  th { text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #64748B; border-bottom: 1px solid #E2E8F0; }
  td { padding: 10px; font-size: 12px; border-bottom: 1px dotted #F1F5F9; }
`;

const Badge = styled.span`
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  background: ${props => props.$online ? '#DCFCE7' : '#FEE2E2'};
  color: ${props => props.$online ? '#15803D' : '#991B1B'};
`;

const Footer = styled.div`
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid #E2E8F0;
  text-align: center;
  font-size: 10px;
  color: #94A3B8;
`;

const ReportTemplate = ({ data, id = "operational-report" }) => {
  if (!data) return null;

  return (
    <>
      <PrintReset />
      <PrintContainer id={id}>
        <Page>
          <Header>
            <Logo>
              ♻️ WasteWise Admin
            </Logo>
            <ReportTitle>
              <h1>Operational Report</h1>
              <p>Generated: {data.generatedAt}</p>
            </ReportTitle>
          </Header>

          <Section>
            <SectionTitle>Summary Overview</SectionTitle>
            <SummaryGrid>
              <SummaryCard>
                <div className="label">Total Waste Collected</div>
                <div className="value">{data.summary.totalWaste} kg</div>
              </SummaryCard>
              <SummaryCard>
                <div className="label">Active Fleet Status</div>
                <div className="value">{data.summary.activeDrivers} / {data.summary.totalDrivers} Online</div>
              </SummaryCard>
              <SummaryCard>
                <div className="label">Ongoing Pickups</div>
                <div className="value">{data.summary.ongoingPickups} Tasks</div>
              </SummaryCard>
            </SummaryGrid>
            <SummaryGrid>
              <SummaryCard>
                <div className="label">Pending Requests</div>
                <div className="value">{data.summary.pendingRequests}</div>
              </SummaryCard>
              <SummaryCard>
                <div className="label">Unresolved Issues</div>
                <div className="value">{data.summary.unresolvedIssues}</div>
              </SummaryCard>
            </SummaryGrid>
          </Section>

          <Section>
            <SectionTitle>Monthly Waste Trends</SectionTitle>
            <div style={{ height: '300px', width: '100%', background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                  <Bar dataKey="compost" name="Compost (kg)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recycle" name="Recycle (kg)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section>
            <SectionTitle>Waste Division Metrics</SectionTitle>
            <Table>
              <thead>
                <tr>
                  <th>GN Division</th>
                  <th>Compost (kg)</th>
                  <th>Recycle (kg)</th>
                  <th>Total Tasks</th>
                </tr>
              </thead>
              <tbody>
                {data.divisions.map((div, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{div.name}</td>
                    <td>{div.compost.toFixed(1)}</td>
                    <td>{div.recycle.toFixed(1)}</td>
                    <td>{div.total}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>

          <Section>
            <SectionTitle>Driver Fleet Deployment</SectionTitle>
            <Table>
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Status</th>
                  <th>Vehicle Assignment</th>
                </tr>
              </thead>
              <tbody>
                {data.drivers.slice(0, 15).map((driver, i) => (
                  <tr key={i}>
                    <td>{driver.name}</td>
                    <td><Badge $online={driver.status === 'Online'}>{driver.status}</Badge></td>
                    <td>{driver.vehicle}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {data.drivers.length > 15 && (
              <p style={{ fontSize: 10, color: '#94A3B8', fontStyle: 'italic' }}>* showing first 15 drivers (see full list in admin panel)</p>
            )}
          </Section>

          <Footer>
            © 2026 Smart Waste Management System - Confidential Admin Report
          </Footer>
        </Page>
      </PrintContainer>
    </>
  );
};

export default ReportTemplate;
