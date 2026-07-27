import { useEffect, useState } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { SectionCard } from '../components/SectionCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { Link } from 'react-router-dom';
import { FilePlus, Landmark, CheckCircle2, DollarSign } from 'lucide-react';

function statusVariant(s) {
  if (s === 'APPLIED') return 'info';
  if (s === 'UNDER_REVIEW') return 'warning';
  if (s === 'APPROVED') return 'success';
  if (s === 'REJECTED') return 'danger';
  if (s === 'FUNDS_DISBURSED') return 'neutral';
  return 'neutral';
}

function eligibilityVariant(s) {
  if (s === 'ELIGIBLE') return 'success';
  if (s === 'NOT_ELIGIBLE') return 'danger';
  return 'warning';
}

export default function MyWelfareApplications() {
  const citizenId = keycloak.tokenParsed?.sub;
  const [applications, setApplications] = useState([]);
  const [schemes, setSchemes] = useState({});
  const [disbursements, setDisbursements] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!citizenId) return;
    Promise.all([
      api.get(`/welfare-service/api/welfare/beneficiaries/citizen/${citizenId}`),
      api.get('/welfare-service/api/welfare/schemes'),
    ]).then(async ([bRes, sRes]) => {
      const schemeMap = {};
      (sRes.data || []).forEach(s => { schemeMap[s.schemeId] = s; });
      setSchemes(schemeMap);
      const apps = bRes.data || [];
      setApplications(apps);

      // Fetch disbursements for FUNDS_DISBURSED apps
      const disbMap = {};
      await Promise.all(
        apps.filter(a => a.status === 'FUNDS_DISBURSED').map(async a => {
          try {
            const dRes = await api.get(`/welfare-service/api/welfare/disbursements/beneficiary/${a.beneficiaryId}`);
            disbMap[a.beneficiaryId] = dRes.data?.[0];
          } catch { }
        })
      );
      setDisbursements(disbMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [citizenId]);

  return (
    <AppShell title="My Welfare Applications">
      <div style={{ paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── Page Header (Overview-style) ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #334155)',
          borderRadius: 16, padding: '24px 32px', color: '#fff',
          display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 10px 25px rgba(15,23,42,0.3)',
          marginBottom: 20, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: '#fff', opacity: 0.03, borderRadius: '50%', filter: 'blur(30px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              background: 'rgba(255,255,255,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)',
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block', marginBottom: 10
            }}>
              WELFARE MODULE
            </span>
            <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              My Welfare Applications
            </h2>
            <p style={{ margin: 0, color: '#cbd5e1', maxWidth: 540, fontSize: 14, lineHeight: 1.5 }}>
              Track enrollment status across government welfare schemes, monitor eligibility checks, and view direct benefit transfer (DBT) disbursements.
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/welfare/apply" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 22px',
                borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                + Apply for Scheme
              </button>
            </Link>
          </div>
        </div>

        {loading ? <PageLoader message="Loading your applications..." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {applications.length === 0 && (
              <SectionCard title="">
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>No Applications Yet</h3>
                  <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 20px 0' }}>
                    You haven't applied for any welfare scheme yet.
                  </p>
                  <Link to="/welfare/apply" style={{
                    padding: '12px 24px', borderRadius: '8px', backgroundColor: '#6366f1',
                    color: 'white', textDecoration: 'none', fontWeight: 600
                  }}>Apply Now</Link>
                </div>
              </SectionCard>
            )}
            {applications.map(app => {
              const scheme = schemes[app.schemeId];
              const disbursement = disbursements[app.beneficiaryId];
              return (
                <SectionCard key={app.beneficiaryId} title="">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#6366f1', fontSize: '15px' }}>
                          {app.beneficiaryCode}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                          {scheme?.schemeName || 'Unknown Scheme'}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          {scheme?.department} · Applied {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-IN') : '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Badge variant={statusVariant(app.status)}>{app.status?.replace('_', ' ')}</Badge>
                        <Badge variant={eligibilityVariant(app.eligibilityStatus)}>
                          {app.eligibilityStatus?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {app.status === 'REJECTED' && app.rejectionReason && (
                      <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca', fontSize: '13px', color: '#dc2626' }}>
                        <strong>Rejection Reason:</strong> {app.rejectionReason}
                      </div>
                    )}

                    {app.status === 'FUNDS_DISBURSED' && disbursement && (
                      <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0' }}>
                        <div style={{ fontWeight: 700, color: '#15803d', marginBottom: '8px' }}>✓ Payment Received</div>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13px' }}>
                          <div><span style={{ color: 'var(--color-text-secondary)' }}>Amount: </span>
                            <strong>₹{Number(disbursement.amount || 0).toLocaleString('en-IN')}</strong></div>
                          <div><span style={{ color: 'var(--color-text-secondary)' }}>Mode: </span>
                            <strong>{disbursement.paymentMode?.replace('_', ' ')}</strong></div>
                          <div><span style={{ color: 'var(--color-text-secondary)' }}>TXN: </span>
                            <strong style={{ fontFamily: 'monospace' }}>{disbursement.transactionId}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
