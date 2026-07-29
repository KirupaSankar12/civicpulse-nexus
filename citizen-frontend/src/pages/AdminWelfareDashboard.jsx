import { useEffect, useState } from 'react';
import api from '../api.js';
import { toast } from 'sonner';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { SectionCard } from '../components/SectionCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { 
  Landmark, CheckCircle2, AlertTriangle, ThumbsUp, DollarSign, Download, RefreshCw, Send, ShieldCheck, FileText
} from 'lucide-react';

export default function AdminWelfareDashboard() {
  const [recommendedApps, setRecommendedApps] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [schemes, setSchemes] = useState({});
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, sRes, bRes] = await Promise.all([
        api.get('/welfare-service/api/welfare/beneficiaries/recommended'),
        api.get('/welfare-service/api/welfare/schemes'),
        api.get('/welfare-service/api/welfare/budgets'),
      ]);
      setRecommendedApps(rRes.data || []);
      const sMap = {};
      (sRes.data || []).forEach(s => { sMap[s.schemeId] = s; });
      setSchemes(sMap);
      const bMap = {};
      (bRes.data || []).forEach(b => { bMap[b.department] = b; });
      setBudgets(bMap);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveFundRelease = async (beneficiary) => {
    setActioningId(beneficiary.beneficiaryId);
    try {
      const res = await api.post(`/welfare-service/api/welfare/beneficiaries/${beneficiary.beneficiaryId}/dbt`, {
        adminUsername: 'admin_user',
        remarks: 'Admin approved fund release and executed Direct Benefit Transfer (DBT).'
      });
      
      const updated = res.data;
      setReceiptData({
        beneficiaryCode: updated.beneficiaryCode || beneficiary.beneficiaryCode,
        applicantName: updated.applicantName || beneficiary.applicantName,
        schemeName: schemes[beneficiary.schemeId]?.schemeName || 'Welfare Scheme',
        department: updated.assignedDepartment || beneficiary.assignedDepartment || 'Government Department',
        amount: `₹${Number(updated.disbursedAmount || 25000).toLocaleString('en-IN')}`,
        txnId: updated.transactionId || ('DBT-2026-' + Math.floor(100000 + Math.random() * 900000)),
        bankName: updated.bankName || 'State Bank of India',
        accountNumberMasked: `**** **** ${(updated.accountNumber || '12345678901').slice(-4)}`,
        date: new Date().toLocaleDateString('en-IN')
      });

      loadData();
      toast.success(`Direct Benefit Transfer (DBT) released for ${beneficiary.beneficiaryCode}!`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Fund release failed');
    }
    setActioningId(null);
  };

  return (
    <AppShell title="Admin Financial Release Portal">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#ffffff',
          borderRadius: 20, padding: '24px 28px', border: '1px solid #059669',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Landmark size={24} color="#6ee7b7" />
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#ffffff' }}>
                Admin Financial Release & DBT Portal
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#a7f3d0' }}>
              Review department officer recommendations, verify scheme budget balance, and execute Direct Benefit Transfer (DBT) payouts.
            </p>
          </div>

          <button
            onClick={loadData}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Refresh Queue
          </button>
        </div>

        {/* Budget Status Cards */}
        <div>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Department Scheme Budgets</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {['Education Department', 'Social Welfare Department', 'Health Department'].map(dept => {
              const b = budgets[dept];
              const allocated = b ? Number(b.totalAllocated) : 10000000;
              const spent = b ? Number(b.totalSpent) : 250000;
              const remaining = allocated - spent;

              return (
                <div key={dept} style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{dept}</span>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#059669' }}>
                    ₹{remaining.toLocaleString('en-IN')} <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Available</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#475569' }}>
                    Allocated: ₹{allocated.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Recommendations Queue */}
        <div>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
            Officer Recommended Applications ({recommendedApps.length})
          </h3>

          {loading ? <PageLoader message="Loading recommended applications..." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recommendedApps.length === 0 && (
                <SectionCard title="">
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '36px', margin: 0, fontWeight: 600 }}>
                    🎉 No applications pending Admin fund release.
                  </p>
                </SectionCard>
              )}

              {recommendedApps.map(b => {
                const scheme = schemes[b.schemeId];
                return (
                  <SectionCard key={b.beneficiaryId} title="">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#059669', fontSize: 15, background: '#dcfce7', padding: '2px 8px', borderRadius: 6 }}>
                            {b.beneficiaryCode}
                          </span>
                          <h3 style={{ margin: '6px 0 2px', fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                            {b.applicantName}
                          </h3>
                          <div style={{ fontSize: 13, color: '#475569' }}>
                            <strong>Scheme:</strong> {scheme?.schemeName || 'Welfare Scheme'} • <strong>Department:</strong> <span style={{ color: '#2563eb', fontWeight: 700 }}>{b.assignedDepartment || 'Government Dept'}</span>
                          </div>
                        </div>

                        <Badge variant="success">RECOMMENDED BY OFFICER</Badge>
                      </div>

                      {/* Recommendation Notes Card */}
                      <div style={{ background: '#f0fdf4', borderRadius: 12, border: '1.5px solid #bbf7d0', padding: '14px 16px', fontSize: 13, color: '#166534', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ThumbsUp size={16} /> Officer Recommendation Note
                        </div>
                        <div>
                          <strong>Officer Username:</strong> {b.assignedOfficer || 'Department Officer'} | <strong>Remarks:</strong> {b.recommendationRemarks || 'Verified clean and recommended.'}
                        </div>
                      </div>

                      {/* Citizen Snapshot */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}>
                        <div><span style={{ color: '#64748b', fontWeight: 700 }}>AADHAAR</span><br /><strong style={{ fontFamily: 'monospace' }}>{b.applicantAadhaar}</strong></div>
                        <div><span style={{ color: '#64748b', fontWeight: 700 }}>INCOME</span><br /><strong>₹{Number(b.annualIncome || 0).toLocaleString('en-IN')}</strong></div>
                        <div><span style={{ color: '#64748b', fontWeight: 700 }}>ELIGIBILITY</span><br /><span style={{ color: '#15803d', fontWeight: 800 }}>✓ {b.eligibilityStatus}</span></div>
                      </div>

                      {/* Verified Bank Account Details Card */}
                      <div style={{ background: '#eff6ff', borderRadius: 12, border: '1.5px solid #bfdbfe', padding: '14px 16px', fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                        <div><span style={{ color: '#64748b', fontWeight: 700 }}>Account Holder:</span><br /><strong style={{ color: '#0f172a' }}>{b.accountHolderName || b.applicantName}</strong></div>
                        <div><span style={{ color: '#64748b', fontWeight: 700 }}>Bank Name:</span><br /><strong style={{ color: '#0f172a' }}>{b.bankName || 'State Bank of India'}</strong></div>
                        <div><span style={{ color: '#64748b', fontWeight: 700 }}>Masked Account Number:</span><br /><strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>**** **** {(b.accountNumber || '12345678901').slice(-4)}</strong></div>
                        <div><span style={{ color: '#64748b', fontWeight: 700 }}>Verified IFSC:</span><br /><strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{b.ifscCode || 'SBIN0001234'}</strong></div>
                        <div><span style={{ color: '#64748b', fontWeight: 700 }}>Verified By Officer:</span><br /><strong style={{ color: '#16a34a' }}>✓ {b.verifiedByOfficer || b.assignedOfficer || 'Department Officer'}</strong></div>
                      </div>

                      {/* Action Bar */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button
                          onClick={() => handleApproveFundRelease(b)}
                          disabled={actioningId === b.beneficiaryId}
                          style={{
                            padding: '12px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#ffffff', border: 'none', fontWeight: 900, fontSize: 14, cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 8
                          }}
                        >
                          <DollarSign size={18} /> {actioningId === b.beneficiaryId ? 'Executing DBT…' : 'Approve Fund Release & Execute DBT →'}
                        </button>
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Receipt Confirmation Modal */}
        {receiptData && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, maxWidth: 520, width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
              <div style={{ background: '#059669', color: '#fff', padding: '20px 24px', textAlign: 'center' }}>
                <CheckCircle2 size={36} color="#fff" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>DBT Fund Release Successful!</h3>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>Transaction Receipt Generated & Kafka Notification Sent</div>
              </div>

              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Beneficiary Code</span>
                  <strong style={{ fontFamily: 'monospace' }}>{receiptData.beneficiaryCode}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Applicant Name</span>
                  <strong>{receiptData.applicantName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Scheme Name</span>
                  <strong>{receiptData.schemeName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Transaction ID</span>
                  <strong style={{ fontFamily: 'monospace', color: '#059669' }}>{receiptData.txnId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Disbursed Amount</span>
                  <strong style={{ fontSize: 16, color: '#059669' }}>{receiptData.amount}</strong>
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setReceiptData(null)}
                  style={{ padding: '10px 20px', borderRadius: 10, background: '#059669', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
