import { useEffect, useState } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { SectionCard } from '../components/SectionCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { Clock, CheckCircle2 } from 'lucide-react';

function eligibilityVariant(s) {
  if (s === 'ELIGIBLE') return 'success';
  if (s === 'NOT_ELIGIBLE') return 'danger';
  return 'warning';
}

function statusVariant(s) {
  if (s === 'APPLIED') return 'info';
  if (s === 'UNDER_REVIEW') return 'warning';
  if (s === 'APPROVED') return 'success';
  if (s === 'REJECTED') return 'danger';
  return 'neutral';
}

export default function ApplicationVerification() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [schemes, setSchemes] = useState({});
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [actioning, setActioning] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        api.get('/welfare-service/api/welfare/beneficiaries/pending'),
        api.get('/welfare-service/api/welfare/schemes'),
      ]);
      const map = {};
      (sRes.data || []).forEach(s => { map[s.schemeId] = s; });
      setSchemes(map);
      setBeneficiaries((bRes.data || []).filter(b => b.status === 'APPLIED'));
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReview = async (id) => {
    setActioning(id);
    try {
      await api.put(`/welfare-service/api/welfare/beneficiaries/${id}/review`, {
        remarks: remarks[id] || 'Documents verified'
      });
      load();
    } catch (e) { alert(e.response?.data?.error || 'Action failed'); }
    setActioning(null);
  };

  return (
    <AppShell title="Application Verification (Officer View)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={18} color="#2563eb" />
          <span style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: 500 }}>
            These applications are awaiting initial verification before review by an Approver.
          </span>
        </div>

        {loading ? <PageLoader message="Loading applications..." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {beneficiaries.length === 0 && (
              <SectionCard title="">
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '24px' }}>
                  No applications awaiting verification
                </p>
              </SectionCard>
            )}
            {beneficiaries.map(b => {
              const scheme = schemes[b.schemeId];
              return (
                <SectionCard key={b.beneficiaryId} title="">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#6366f1', fontSize: '16px' }}>
                          {b.beneficiaryCode}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                          {b.applicantName}
                        </div>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                          Scheme: {scheme?.schemeName || b.schemeId?.substring(0, 8)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        <Badge variant={statusVariant(b.status)}>{b.status?.replace('_', ' ')}</Badge>
                        <Badge variant={eligibilityVariant(b.eligibilityStatus)}>
                          Eligibility: {b.eligibilityStatus?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px',
                      padding: '16px', borderRadius: '10px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <div><div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Annual Income</div>
                        <div style={{ fontWeight: 600 }}>{b.annualIncome ? `₹${Number(b.annualIncome).toLocaleString('en-IN')}` : '—'}</div></div>
                      <div><div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Age</div>
                        <div style={{ fontWeight: 600 }}>{b.age ?? '—'}</div></div>
                      <div><div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Family Status</div>
                        <div style={{ fontWeight: 600 }}>{b.familyStatus || '—'}</div></div>
                      <div><div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Applied</div>
                        <div style={{ fontWeight: 600 }}>{b.appliedDate ? new Date(b.appliedDate).toLocaleDateString('en-IN') : '—'}</div></div>
                    </div>

                    {b.documentsSubmitted && (
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>DOCUMENTS SUBMITTED</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {b.documentsSubmitted.split(',').map(doc => (
                            <span key={doc} style={{ padding: '4px 10px', borderRadius: '99px', backgroundColor: '#dcfce7',
                              color: '#16a34a', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> {doc.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                        Verification Remarks
                      </label>
                      <textarea rows={2} value={remarks[b.beneficiaryId] || ''}
                        onChange={e => setRemarks(r => ({ ...r, [b.beneficiaryId]: e.target.value }))}
                        placeholder="Add your verification remarks..."
                        style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '8px',
                          fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleReview(b.beneficiaryId)} disabled={actioning === b.beneficiaryId}
                        style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#6366f1',
                          color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                        {actioning === b.beneficiaryId ? 'Moving to Review…' : 'Move to Under Review →'}
                      </button>
                    </div>
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
