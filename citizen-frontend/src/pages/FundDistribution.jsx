import { useEffect, useState } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import { toast } from 'sonner';
import { DollarSign, Clock, Send, CheckCircle, X } from 'lucide-react';

function getPaymentBadgeVariant(s) {
  if (s === 'COMPLETED') return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
  if (s === 'FAILED') return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
  return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }; // PENDING
}

function fmt(n) {
  if (!n) return '₹0';
  return '₹' + Number(n).toLocaleString('en-IN');
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 22px',
      border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 160px',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function FundDistribution() {
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isFinance = roles.includes('FINANCE_OFFICER') || roles.includes('finance_officer');
  const isAdmin = roles.includes('ADMIN') || roles.includes('admin');
  const canDisburse = isFinance || isAdmin;

  const [disbursements, setDisbursements] = useState([]);
  const [approvedBeneficiaries, setApprovedBeneficiaries] = useState([]);
  const [schemes, setSchemes] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [showDisburseForm, setShowDisburseForm] = useState(false);
  const [disburseForm, setDisburseForm] = useState({ beneficiaryId: '', amount: '', paymentMode: 'BANK_TRANSFER' });
  const [disbursing, setDisbursing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [dRes, sRes] = await Promise.all([
        api.get('/welfare-service/api/welfare/disbursements'),
        api.get('/welfare-service/api/welfare/schemes'),
      ]);
      setDisbursements(dRes.data || []);
      const schemeMap = {};
      (sRes.data || []).forEach(s => { schemeMap[s.schemeId] = s.schemeName; });
      setSchemes(schemeMap);

      if (canDisburse) {
        const bRes = await api.get('/welfare-service/api/welfare/beneficiaries/pending');
        setApprovedBeneficiaries((bRes.data || []).filter(b => b.status === 'APPROVED'));
      }
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalDisbursed = disbursements.filter(d => d.paymentStatus === 'COMPLETED')
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const pendingCount = disbursements.filter(d => d.paymentStatus === 'PENDING').length;

  const handleDisburse = async () => {
    setDisbursing(true);
    try {
      await api.post('/welfare-service/api/welfare/disbursements', {
        beneficiaryId: disburseForm.beneficiaryId,
        amount: Number(disburseForm.amount),
        paymentMode: disburseForm.paymentMode,
      });
      toast.success('Funds disbursed successfully!');
      setShowDisburseForm(false);
      setDisburseForm({ beneficiaryId: '', amount: '', paymentMode: 'BANK_TRANSFER' });
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Disbursement failed');
    } finally { setDisbursing(false); }
  };

  const thStyle = {
    padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
    background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left'
  };

  return (
    <AppShell title="Fund Distribution">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 40 }}>

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
            }}>
              <DollarSign size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Fund Distribution
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, marginTop: 2 }}>
                Manage and track welfare disbursements.
              </p>
            </div>
          </div>
          {canDisburse && (
            <button onClick={() => setShowDisburseForm(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
              borderRadius: 9, background: 'linear-gradient(135deg,#10b981,#059669)',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
              boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
            }}>
              <Send size={15} /> Disburse Funds
            </button>
          )}
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <StatCard label="Total Disbursed" value={fmt(totalDisbursed)} icon={DollarSign} color="#10b981" />
          <StatCard label="Completed Payments" value={disbursements.filter(d => d.paymentStatus === 'COMPLETED').length} icon={CheckCircle} color="#3b82f6" />
          <StatCard label="Pending Payments" value={pendingCount} icon={Clock} color="#f59e0b" />
          <StatCard label="Approved Awaiting Payment" value={approvedBeneficiaries.length} icon={Send} color="#ec4899" />
        </div>

        {/* ── Main Card ────────────────────────────────────────────────────── */}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(15,23,42,0.07)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 18px', borderBottom: '2px solid #f1f5f9', background: '#fafbfc',
          }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
              All Disbursements ({disbursements.length})
            </h3>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', margin: '0 auto 12px',
                border: '3px solid #e2e8f0', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ color: '#64748b', fontSize: 14 }}>Loading disbursements…</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : disbursements.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>💸</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 6 }}>No disbursements yet</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Transaction ID</th>
                    <th style={thStyle}>Beneficiary ID</th>
                    <th style={thStyle}>Scheme</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Payment Mode</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {disbursements.map(d => {
                    const badge = getPaymentBadgeVariant(d.paymentStatus);
                    return (
                      <tr key={d.disbursementId} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6', fontSize: 12 }}>{d.transactionId}</td>
                        <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{d.beneficiaryId?.substring(0, 8)}...</td>
                        <td style={{ padding: '13px 14px', color: '#1e293b', fontSize: 13, fontWeight: 600 }}>{schemes[d.schemeId] || d.schemeId?.substring(0, 8)}</td>
                        <td style={{ padding: '13px 14px', fontWeight: 800, color: '#10b981', fontSize: 14 }}>{fmt(d.amount)}</td>
                        <td style={{ padding: '13px 14px', fontWeight: 600, color: '#475569', fontSize: 12 }}>{d.paymentMode?.replace('_', ' ')}</td>
                        <td style={{ padding: '13px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20,
                            background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, fontSize: 11, fontWeight: 700,
                          }}>
                            {d.paymentStatus}
                          </span>
                        </td>
                        <td style={{ padding: '13px 14px', color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                          {d.disbursedDate ? new Date(d.disbursedDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td style={{ padding: '13px 14px', color: '#475569', fontSize: 13, fontWeight: 600 }}>{d.approvedBy || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Disburse Modal */}
        {showDisburseForm && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}>
            <div style={{
              background: '#fff', borderRadius: 16, width: '100%', maxWidth: 450,
              display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Disburse Funds</h3>
                <button onClick={() => setShowDisburseForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Approved Beneficiary *</label>
                  <select value={disburseForm.beneficiaryId} onChange={e => setDisburseForm(f => ({ ...f, beneficiaryId: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, color: '#1e293b', boxSizing: 'border-box', outline: 'none', background: '#fff' }}>
                    <option value="" disabled>Select beneficiary...</option>
                    {approvedBeneficiaries.map(b => (
                      <option key={b.beneficiaryId} value={b.beneficiaryId}>{b.beneficiaryCode} — {b.applicantName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Amount (₹) *</label>
                  <input type="number" value={disburseForm.amount} onChange={e => setDisburseForm(f => ({ ...f, amount: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, color: '#1e293b', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Payment Mode *</label>
                  <select value={disburseForm.paymentMode} onChange={e => setDisburseForm(f => ({ ...f, paymentMode: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, color: '#1e293b', boxSizing: 'border-box', outline: 'none', background: '#fff' }}>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
                <button onClick={() => setShowDisburseForm(false)} style={{
                  padding: '8px 16px', borderRadius: 8, border: '1.5px solid #cbd5e1', background: '#fff', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer'
                }}>Cancel</button>
                <button onClick={handleDisburse} disabled={disbursing || !disburseForm.beneficiaryId || !disburseForm.amount} style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', background: '#10b981', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', opacity: (disbursing || !disburseForm.beneficiaryId || !disburseForm.amount) ? 0.7 : 1
                }}>
                  {disbursing ? 'Processing...' : 'Disburse'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
