import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import SchemeSelectDropdown from '../components/SchemeSelectDropdown.jsx';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle, RefreshCw, AlertTriangle, FileText, User, Users, Landmark, IndianRupee, HandHeart } from 'lucide-react';

const STEPS = ['Application', 'Verification', 'Authority Approval', 'Disbursement', 'Success'];
const DOCS = ['Aadhaar Card', 'Income Certificate', 'Bank Passbook', 'Photograph', 'Residence Proof'];

function StepIndicator({ current }) {
  return (
    <div style={{
      background: '#ffffff', borderRadius: 16, padding: '20px 24px',
      border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
      marginBottom: 0
    }}>
      <div className="flex items-center justify-between relative w-full">
        {/* Connector line */}
        <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0 rounded-full" />
        
        {STEPS.map((step, i) => {
          const isCompleted = i < current;
          const isCurrent = i === current;
          return (
            <div key={step} className="flex flex-col items-center gap-2 bg-white px-2 relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                isCompleted ? 'bg-emerald-600 text-white shadow-sm' :
                isCurrent ? 'bg-white border-2 border-emerald-600 text-emerald-600 font-bold shadow-md' :
                'bg-slate-50 border border-slate-200 text-slate-400'
              }`}>
                {isCompleted ? '✓' : i + 1}
              </div>
              <span className={`text-[11px] font-bold tracking-tight text-center ${
                isCurrent ? 'text-emerald-700 font-extrabold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SchemeApplicationForm() {
  const navigate = useNavigate();
  const citizenId = keycloak.tokenParsed?.sub;
  const name = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || '';

  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [schemeError, setSchemeError] = useState(false);

  const [form, setForm] = useState({
    schemeId: '', applicantName: name, applicantAadhaar: '', citizenId: citizenId || '',
    annualIncome: '', age: '', familyStatus: 'General',
  });
  const [checkedDocs, setCheckedDocs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [duplicateData, setDuplicateData] = useState(null);

  const fetchSchemes = () => {
    setLoadingSchemes(true);
    setSchemeError(false);
    api.get('/welfare-service/api/welfare/schemes?status=ACTIVE')
      .then(r => {
        const activeOnly = (r.data || []).filter(s => s.status === 'ACTIVE');
        setSchemes(activeOnly);
        setLoadingSchemes(false);
      })
      .catch(() => {
        api.get('/api/welfare/schemes?status=ACTIVE')
          .then(r => {
            const activeOnly = (r.data || []).filter(s => s.status === 'ACTIVE');
            setSchemes(activeOnly);
            setLoadingSchemes(false);
          })
          .catch(() => {
            setSchemeError(true);
            setLoadingSchemes(false);
          });
      });
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const toggleDoc = (doc) => {
    setCheckedDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]);
  };

  const isSchemeValid = Boolean(form.schemeId);
  const isAadhaarValid = form.applicantAadhaar.length === 14;
  const isIncomeValid = form.annualIncome !== '' && !isNaN(Number(form.annualIncome)) && Number(form.annualIncome) >= 0;
  const isAgeValid = form.age !== '' && !isNaN(Number(form.age)) && Number(form.age) > 0;
  const isDocsValid = checkedDocs.length > 0;
  const isFormValid = isSchemeValid && isAadhaarValid && isIncomeValid && isAgeValid && isDocsValid;

  const handleAadhaarChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 12) val = val.slice(0, 12);
    const formatted = val.match(/.{1,4}/g)?.join('-') || '';
    setForm(f => ({ ...f, applicantAadhaar: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const payload = {
        citizenId: form.citizenId,
        schemeId: form.schemeId,
        applicantName: form.applicantName,
        applicantAadhaar: form.applicantAadhaar,
        annualIncome: Number(form.annualIncome),
        age: Number(form.age),
        familyStatus: form.familyStatus,
        documentsSubmitted: checkedDocs
      };

      const res = await api.post('/welfare-service/api/welfare/applications', payload);
      setSubmitted(res.data);
      toast.success('Welfare application submitted successfully!');
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicateData(err.response.data);
        toast.warning('Active application already exists for this scheme.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit application.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AppShell title="Application Submitted">
        <div style={{ paddingBottom: 40, maxWidth: 720, margin: '0 auto' }}>
          <Card className="border-slate-200 rounded-2xl shadow-sm bg-white p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Application Submitted!</h2>
              <p className="text-sm text-slate-500 mt-2">Your welfare scheme application has been registered for verification.</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Beneficiary Code</span>
                <span className="font-bold text-slate-900 font-mono">{submitted.beneficiaryCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Scheme</span>
                <span className="font-bold text-slate-900">{submitted.schemeName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Applied Date</span>
                <span className="font-bold text-slate-900">{new Date(submitted.appliedDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs">
                  {submitted.status}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/services')} className="flex-1 rounded-xl h-11">
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate('/welfare/my-applications')} className="flex-1 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                Track Application
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (duplicateData) {
    return (
      <AppShell title="Apply for Welfare Scheme">
        <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
          <div style={{ background: '#fef2f2', padding: '24px', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: '#ef4444', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, color: '#fff' }}>⚠️</span>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#991b1b' }}>Duplicate Application Detected</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#b91c1c' }}>You already have an active application for this welfare scheme.</p>
            </div>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Beneficiary Code</span>
              <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{duplicateData.beneficiaryCode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Status</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{duplicateData.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Applicant Aadhaar</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{duplicateData.applicantAadhaar}</span>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button 
                onClick={() => setDuplicateData(null)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Go Back
              </button>
              <button 
                onClick={() => navigate('/welfare/my-applications')}
                style={{ flex: 1, padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Track Existing Application
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Apply for Welfare Scheme">
      <div style={{ paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        <StepIndicator current={0} />

        {/* ── Page Header (Overview-style) ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #334155)',
          borderRadius: 16, padding: '24px 32px', color: '#fff',
          display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 10px 25px rgba(15,23,42,0.3)',
          marginBottom: 0, position: 'relative', overflow: 'hidden'
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
              Apply for Welfare Scheme
            </h2>
            <p style={{ margin: 0, color: '#cbd5e1', maxWidth: 540, fontSize: 14, lineHeight: 1.5 }}>
              Complete the verification form below. Your application will be cross-referenced with municipal databases for instant eligibility validation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Card 1: Select Welfare Program */}
          <div style={{
            background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15,23,42,0.04)', padding: '24px 28px',
            display: 'flex', flexDirection: 'column', gap: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: '#ecfdf5',
                border: '1px solid #a7f3d0', color: '#059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <HandHeart size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>1. Select Welfare Program</h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>Choose the active government scheme you are applying for</p>
              </div>
            </div>

            <div>
              {loadingSchemes ? (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, color: '#64748b', fontSize: 14 }}>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading available schemes...
                </div>
              ) : schemeError ? (
                <div style={{ padding: 16, borderRadius: 12, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                    <AlertTriangle size={18} /> Could not load schemes.
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={fetchSchemes} className="bg-white">
                    Retry
                  </Button>
                </div>
              ) : (
                <SchemeSelectDropdown
                  schemes={schemes}
                  value={form.schemeId}
                  onChange={(id) => setForm(f => ({ ...f, schemeId: id }))}
                  placeholder="Browse and select a scheme..."
                />
              )}

              {form.schemeId && (() => {
                const s = schemes.find(s => s.schemeId === form.schemeId);
                return s ? (
                  <div style={{
                    marginTop: 20, padding: 20, borderRadius: 14, background: '#f8fafc',
                    border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center'
                  }}>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{s.schemeName}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{s.eligibilityCriteria || 'General citizen welfare scheme.'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 20, borderLeft: '1px solid #cbd5e1', paddingLeft: 20 }}>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Income Limit</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                          {s.minIncome ? `₹${Number(s.minIncome).toLocaleString()} - ₹${Number(s.maxIncome || 0).toLocaleString()}` : 'None'}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Age Limit</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                          {s.minAge ? `${s.minAge} - ${s.maxAge || 'Max'} yrs` : 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          {/* Card 2: Applicant Profile */}
          <div style={{
            background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15,23,42,0.04)', padding: '24px 28px',
            display: 'flex', flexDirection: 'column', gap: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: '#ecfdf5',
                border: '1px solid #a7f3d0', color: '#059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>2. Applicant Profile</h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>Personal information and legal identity verification</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></Label>
                <Input
                  type="text"
                  value={form.applicantName}
                  onChange={e => setForm(f => ({ ...f, applicantName: e.target.value }))}
                  style={{ height: 44, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Applicant Aadhaar <span style={{ color: '#ef4444' }}>*</span></Label>
                <Input
                  type="text"
                  value={form.applicantAadhaar}
                  onChange={handleAadhaarChange}
                  style={{ height: 44, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'monospace', color: '#0f172a' }}
                  placeholder="XXXX-XXXX-XXXX"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Age (Years) <span style={{ color: '#ef4444' }}>*</span></Label>
                <Input
                  type="number"
                  value={form.age}
                  placeholder="e.g., 45"
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  style={{ height: 44, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Family/Social Category <span style={{ color: '#ef4444' }}>*</span></Label>
                <Select value={form.familyStatus} onValueChange={val => setForm(f => ({ ...f, familyStatus: val }))}>
                  <SelectTrigger style={{ height: 44, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', background: '#ffffff' }}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General Category</SelectItem>
                    <SelectItem value="BPL">Below Poverty Line (BPL)</SelectItem>
                    <SelectItem value="OBC">Other Backward Class (OBC)</SelectItem>
                    <SelectItem value="SC/ST">SC / ST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Card 3: Income & Financial Details */}
          <div style={{
            background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15,23,42,0.04)', padding: '24px 28px',
            display: 'flex', flexDirection: 'column', gap: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: '#ecfdf5',
                border: '1px solid #a7f3d0', color: '#059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <IndianRupee size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>3. Income & Financial Details</h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>Declared annual income for automated eligibility determination</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Annual Family Income (₹) <span style={{ color: '#ef4444' }}>*</span></Label>
                <Input
                  type="number"
                  value={form.annualIncome}
                  placeholder="e.g., 250000"
                  onChange={e => setForm(f => ({ ...f, annualIncome: e.target.value }))}
                  style={{ height: 44, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'monospace', color: '#0f172a' }}
                  required
                />
              </div>
              <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: 12, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>i</div>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#14532d' }}>Validation Rule</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                    Income details are cross-referenced with Revenue Department certificates to compute automated eligibility scores.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Required Documentation Checklist */}
          <div style={{
            background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15,23,42,0.04)', padding: '24px 28px',
            display: 'flex', flexDirection: 'column', gap: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: '#ecfdf5',
                border: '1px solid #a7f3d0', color: '#059669',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>4. Required Documentation Checklist</h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>Select all verified documents you are attaching with this application</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {DOCS.map(doc => {
                const isChecked = checkedDocs.includes(doc);
                return (
                  <label 
                    key={doc} 
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                      borderRadius: 12, border: isChecked ? '1.5px solid #10b981' : '1.5px solid #e2e8f0',
                      background: isChecked ? '#f0fdf4' : '#ffffff', cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    <Checkbox 
                      checked={isChecked} 
                      onCheckedChange={() => toggleDoc(doc)}
                      className={isChecked ? 'border-emerald-600 text-emerald-600 data-[state=checked]:bg-emerald-600' : ''} 
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: isChecked ? '#065f46' : '#334155' }}>{doc}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Sticky Bottom Action Bar ── */}
          <div style={{
            position: 'sticky', bottom: 16, zIndex: 30,
            background: '#ffffff', borderRadius: 16,
            border: '1.5px solid #cbd5e1', padding: '16px 24px',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
            marginTop: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                {!isFormValid ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fffbeb', color: '#92400e', padding: '8px 14px', borderRadius: 10, border: '1px solid #fde68a', fontSize: 12, fontWeight: 700 }}>
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Complete all required fields (* scheme, Aadhaar, age, income, docs) to proceed.
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', color: '#166534', padding: '8px 14px', borderRadius: 10, border: '1px solid #bbf7d0', fontSize: 12, fontWeight: 700 }}>
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Ready for submission
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  style={{ height: 42, borderRadius: 10, padding: '0 20px', fontWeight: 700, fontSize: 13 }}
                  onClick={() => navigate('/welfare/my-applications')}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  style={{ height: 42, borderRadius: 10, padding: '0 20px', fontWeight: 700, fontSize: 13 }}
                  onClick={() => toast.info('Draft saved locally')}
                >
                  Save Draft
                </Button>
                <Button 
                  type="submit" 
                  style={{
                    height: 42, borderRadius: 10, padding: '0 24px', fontWeight: 800, fontSize: 13,
                    background: isFormValid ? '#10b981' : '#cbd5e1', color: '#ffffff', border: 'none',
                    cursor: isFormValid && !submitting ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!isFormValid || submitting}
                >
                  {submitting ? 'Processing...' : 'Submit Application'}
                </Button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </AppShell>
  );
}
