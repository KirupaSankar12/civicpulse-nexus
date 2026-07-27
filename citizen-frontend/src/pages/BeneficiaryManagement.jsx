import { useEffect, useState, useMemo } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import { toast } from 'sonner';
import {
  Users, Search, X, ShieldCheck, CheckCircle2, Clock, XCircle, FileText
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function EligibilityBadge({ s }) {
  const isEl = s === 'ELIGIBLE';
  const isNot = s === 'NOT_ELIGIBLE';
  const bg = isEl ? '#f0fdf4' : isNot ? '#fef2f2' : '#f8fafc';
  const text = isEl ? '#16a34a' : isNot ? '#dc2626' : '#64748b';
  const border = isEl ? '#bbf7d0' : isNot ? '#fecaca' : '#e2e8f0';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20,
      background: bg, color: text, border: `1px solid ${border}`, fontSize: 11, fontWeight: 700,
    }}>
      {s?.replace('_', ' ') || 'PENDING'}
    </span>
  );
}

const STATUS_MAP = {
  APPLIED:        { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  UNDER_REVIEW:   { bg: '#fff7ed', text: '#d97706', border: '#fed7aa' },
  APPROVED:       { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  FUNDS_DISBURSED:{ bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  REJECTED:       { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

function StatusBadge({ s }) {
  const m = STATUS_MAP[s] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20,
      background: m.bg, color: m.text, border: `1px solid ${m.border}`, fontSize: 11, fontWeight: 700,
    }}>
      {s?.replace('_', ' ') || s}
    </span>
  );
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

export default function BeneficiaryManagement() {
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer') || roles.includes('DEPARTMENT_OFFICER');
  const isApprover = roles.includes('APPROVER') || roles.includes('approver') || roles.includes('AUTHORITY');
  const isAdmin = roles.includes('ADMIN') || roles.includes('admin');
  const canReview = isOfficer || isApprover || isAdmin;
  const canApprove = isApprover || isAdmin;

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [schemes, setSchemes] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actioning, setActioning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        api.get('/welfare-service/api/welfare/beneficiaries/pending'),
        api.get('/welfare-service/api/welfare/schemes'),
      ]);
      const schemeMap = {};
      (sRes.data || []).forEach(s => { schemeMap[s.schemeId] = s.schemeName; });
      setSchemes(schemeMap);
      setBeneficiaries(bRes.data || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return beneficiaries.filter(b => {
      const matchSearch = !search || b.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
        b.beneficiaryCode?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [beneficiaries, search, statusFilter]);

  const handleReview = async (id) => {
    setActioning(true);
    try { 
      await api.put(`/welfare-service/api/welfare/beneficiaries/${id}/review`, {}); 
      toast.success('Application put Under Review');
      load(); 
    } catch (e) { toast.error(e.response?.data?.error || 'Action failed'); }
    setActioning(false);
  };

  const handleApprove = async (id) => {
    setActioning(true);
    try { 
      await api.put(`/welfare-service/api/welfare/beneficiaries/${id}/approve`, {}); 
      toast.success('Application Approved!');
      load(); 
    } catch (e) { toast.error(e.response?.data?.error || 'Action failed'); }
    setActioning(false);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActioning(true);
    try {
      await api.put(`/welfare-service/api/welfare/beneficiaries/${rejectModal}/reject`, { reason: rejectReason });
      toast.error('Application Rejected');
      setRejectModal(null); setRejectReason(''); load();
    } catch (e) { toast.error(e.response?.data?.error || 'Reject failed'); }
    setActioning(false);
  };

  const pendingCount = beneficiaries.length;
  const underReviewCount = beneficiaries.filter(b => b.status === 'UNDER_REVIEW').length;
  const approvedCount = beneficiaries.filter(b => b.status === 'APPROVED').length;
  
  const thStyle = {
    padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
    background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left'
  };

  return (
    <AppShell title="Beneficiary Management">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 40 }}>

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
            }}>
              <Users size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Beneficiary Management
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, marginTop: 2 }}>
                Review and approve welfare scheme applications.
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <StatCard label="Pending Applications" value={pendingCount} icon={FileText} color="#3b82f6" />
          <StatCard label="Under Review" value={underReviewCount} icon={Clock} color="#f59e0b" />
          <StatCard label="Approved Awaiting Payment" value={approvedCount} icon={CheckCircle2} color="#10b981" />
        </div>

        {/* ── Main Card ────────────────────────────────────────────────────── */}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(15,23,42,0.07)', overflow: 'hidden',
        }}>
          {/* Toolbar */}
          <div style={{
            padding: '14px 18px', borderBottom: '2px solid #f1f5f9',
            display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: '#fafbfc',
          }}>
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px 8px 32px', border: '1.5px solid #e2e8f0', borderRadius: 9,
                  fontSize: 13, color: '#1e293b', background: '#fff', outline: 'none', boxSizing: 'border-box',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                }}>
                  <X size={13} />
                </button>
              )}
            </div>
            
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9,
                fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', fontWeight: 500,
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
            </select>

            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginLeft: 'auto' }}>
              {filtered.length} shown
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', margin: '0 auto 12px',
                border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ color: '#64748b', fontSize: 14 }}>Loading applications…</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 6 }}>No applications found</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Code</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Scheme</th>
                    <th style={thStyle}>Income</th>
                    <th style={thStyle}>Age</th>
                    <th style={thStyle}>Eligibility</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.beneficiaryId} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6', fontSize: 12 }}>
                        {b.beneficiaryCode}
                      </td>
                      <td style={{ padding: '13px 14px', fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                        {b.applicantName}
                      </td>
                      <td style={{ padding: '13px 14px', color: '#475569', fontSize: 13, fontWeight: 500 }}>
                        {schemes[b.schemeId] || b.schemeId?.substring(0, 8)}
                      </td>
                      <td style={{ padding: '13px 14px', fontWeight: 600, color: '#475569' }}>
                        {b.annualIncome ? `₹${Number(b.annualIncome).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '13px 14px', fontWeight: 600, color: '#475569' }}>
                        {b.age ?? '—'}
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <EligibilityBadge s={b.eligibilityStatus} />
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <StatusBadge s={b.status} />
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {canReview && b.status === 'APPLIED' && (
                            <button onClick={() => handleReview(b.beneficiaryId)} disabled={actioning} style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
                              background: '#f1f5f9', color: '#1e293b', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              border: '1px solid #e2e8f0',
                            }}>
                              <Search size={13} /> Review
                            </button>
                          )}
                          {canApprove && b.status === 'UNDER_REVIEW' && (
                            <>
                              <button onClick={() => handleApprove(b.beneficiaryId)} disabled={actioning} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
                                background: '#10b981', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                                boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
                              }}>
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button onClick={() => setRejectModal(b.beneficiaryId)} disabled={actioning} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
                                background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                                boxShadow: '0 2px 4px rgba(239,68,68,0.2)'
                              }}>
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {rejectModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}>
            <div style={{
              background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400,
              display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Reject Application</h3>
                <button onClick={() => setRejectModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Rejection Reason *</label>
                  <textarea
                    value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4}
                    placeholder="Enter reason for rejection..."
                    style={{
                      width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8,
                      fontSize: 14, color: '#1e293b', boxSizing: 'border-box', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
                <button onClick={() => setRejectModal(null)} style={{
                  padding: '8px 16px', borderRadius: 8, border: '1.5px solid #cbd5e1', background: '#fff',
                  fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer'
                }}>Cancel</button>
                <button onClick={handleReject} disabled={!rejectReason.trim() || actioning} style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', background: '#ef4444',
                  fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', opacity: (!rejectReason.trim() || actioning) ? 0.7 : 1
                }}>
                  {actioning ? 'Rejecting...' : 'Reject Application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
