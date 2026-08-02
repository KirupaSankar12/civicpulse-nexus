import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ShieldCheck, Clock, Lock, Search, Building2, Filter, Award } from 'lucide-react';

const CERTIFICATE_CONFIG = {
  BIRTH_CERTIFICATE: {
    label: 'Birth Certificate',
    icon: '👶',
    iconBg: 'bg-blue-100',
    badge: 'POPULAR',
    description: 'Official record of birth for school admission, passport, and legal purposes.',
    department: 'Health Department',
    approvalTime: '2 Working Days',
    fee: '₹0',
    fields: [
      { name: 'childName', label: 'Child Name', type: 'text', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      { name: 'fatherName', label: 'Father Name', type: 'text', required: true },
      { name: 'motherName', label: 'Mother Name', type: 'text', required: true },
      { name: 'hospitalName', label: 'Hospital Name', type: 'text', required: true },
      { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text', required: true }
    ],
    documents: [
      { id: 'Hospital Birth Record', label: 'Hospital Birth Record', required: true },
      { id: 'Parent Aadhaar Card', label: 'Parent Aadhaar Card', required: true },
      { id: 'Address Proof', label: 'Address Proof', required: true },
      { id: 'Child Photograph', label: 'Child Photograph', required: false }
    ]
  },
  DEATH_CERTIFICATE: {
    label: 'Death Certificate',
    icon: '📋',
    iconBg: 'bg-purple-100',
    description: 'Legal document certifying death for insurance, property, and legal proceedings.',
    department: 'Health Department',
    approvalTime: '2 Working Days',
    fee: '₹0',
    fields: [
      { name: 'deceasedName', label: 'Deceased Name', type: 'text', required: true },
      { name: 'relationship', label: 'Relationship with Deceased', type: 'text', required: true },
      { name: 'dateOfDeath', label: 'Date of Death', type: 'date', required: true },
      { name: 'placeOfDeath', label: 'Place of Death', type: 'text', required: true },
      { name: 'causeOfDeath', label: 'Cause of Death', type: 'text', required: true },
      { name: 'hospitalName', label: 'Hospital Name', type: 'text', required: false },
      { name: 'address', label: 'Address', type: 'text', required: true }
    ],
    documents: [
      { id: 'Hospital Death Certificate', label: 'Hospital Death Certificate', required: true },
      { id: 'Applicant Aadhaar', label: 'Applicant Aadhaar', required: true },
      { id: 'Address Proof', label: 'Address Proof', required: true }
    ]
  },
  INCOME_CERTIFICATE: {
    label: 'Income Certificate',
    icon: '💰',
    iconBg: 'bg-green-100',
    description: 'Proof of income for scholarships, subsidies, and government schemes.',
    department: 'Revenue Department',
    approvalTime: '5 Working Days',
    fee: '₹50',
    fields: [
      { name: 'occupation', label: 'Occupation', type: 'text', required: true },
      { name: 'employerName', label: 'Employer Name', type: 'text', required: false },
      { name: 'monthlyIncome', label: 'Monthly Income (₹)', type: 'number', required: true },
      { name: 'annualIncome', label: 'Annual Income (₹)', type: 'number', required: true },
      { name: 'familyMembers', label: 'Family Members Count', type: 'number', required: true },
      { name: 'purpose', label: 'Purpose', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text', required: true }
    ],
    documents: [
      { id: 'Aadhaar Card', label: 'Aadhaar Card', required: true },
      { id: 'Salary Slip OR Income Proof', label: 'Salary Slip OR Income Proof', required: true },
      { id: 'Bank Statement', label: 'Bank Statement', required: true },
      { id: 'Ration Card', label: 'Ration Card', required: true }
    ]
  },
  RESIDENCE_CERTIFICATE: {
    label: 'Residence Certificate',
    icon: '🏠',
    iconBg: 'bg-rose-100',
    description: 'Proof of residence for ration card, voter ID, and local services.',
    department: 'Revenue Department',
    approvalTime: '3 Working Days',
    fee: '₹20',
    fields: [
      { name: 'currentAddress', label: 'Current Address', type: 'text', required: true },
      { name: 'ward', label: 'Ward', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'pincode', label: 'Pincode', type: 'text', required: true },
      { name: 'yearsOfResidence', label: 'Years of Residence', type: 'number', required: true }
    ],
    documents: [
      { id: 'Aadhaar Card', label: 'Aadhaar Card', required: true },
      { id: 'Electricity Bill', label: 'Electricity Bill', required: true },
      { id: 'Rental Agreement OR Property Tax Receipt', label: 'Rental Agreement OR Property Tax Receipt', required: true }
    ]
  },
  TRADE_LICENSE: {
    label: 'Trade License',
    icon: '💼',
    iconBg: 'bg-amber-100',
    description: 'License to operate a commercial business within municipal limits.',
    department: 'Municipal Corporation',
    approvalTime: '7 Working Days',
    fee: '₹500',
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text', required: true },
      { name: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { name: 'businessType', label: 'Business Type', type: 'text', required: true },
      { name: 'gstNumber', label: 'GST Number', type: 'text', required: false },
      { name: 'businessAddress', label: 'Business Address', type: 'text', required: true },
      { name: 'ward', label: 'Ward', type: 'text', required: true },
      { name: 'phoneNumber', label: 'Business Phone Number', type: 'text', required: true },
      { name: 'email', label: 'Business Email', type: 'email', required: true }
    ],
    documents: [
      { id: 'GST Certificate', label: 'GST Certificate', required: true },
      { id: 'Shop Photograph', label: 'Shop Photograph', required: true },
      { id: 'Owner Aadhaar', label: 'Owner Aadhaar', required: true },
      { id: 'Address Proof', label: 'Address Proof', required: true }
    ]
  },
  PERMIT_APPROVAL: {
    label: 'Permit Approval',
    icon: '🏗️',
    iconBg: 'bg-slate-100',
    description: 'Official permit for construction, event organization, or temporary commercial activities.',
    department: 'Urban Planning Department',
    approvalTime: '10 Working Days',
    fee: '₹1000',
    fields: [
      { name: 'permitType', label: 'Permit Type', type: 'select', options: ['Construction', 'Event', 'Commercial', 'Other'], required: true },
      { name: 'location', label: 'Location/Address', type: 'text', required: true },
      { name: 'duration', label: 'Duration (in days)', type: 'number', required: true },
      { name: 'purpose', label: 'Purpose', type: 'text', required: true }
    ],
    documents: [
      { id: 'Aadhaar Card', label: 'Aadhaar Card', required: true },
      { id: 'Property/Location Proof', label: 'Property/Location Proof', required: true },
      { id: 'Site Plan or Layout', label: 'Site Plan or Layout', required: false }
    ]
  }
};

const FORM_STEPS = ['Fill Details', 'Upload Documents', 'Review', 'Submit'];

function UploadCard({ doc, isUploaded, isUploading, uploadErr, fileInfo, onUpload, dragOver, onDragOver, onDragLeave, onDrop }) {
  return (
    <Card className={`transition-all ${isUploaded ? 'border-green-500 bg-green-50/20 dark:bg-green-950/10' : ''} ${dragOver ? 'border-primary ring-2 ring-primary/20' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold text-sm">
                {doc.label} {doc.required && <span className="text-red-500">*</span>}
              </h5>
              {isUploaded && <Badge variant="default" className="bg-green-600 hover:bg-green-700">Uploaded</Badge>}
              {isUploading && <Badge variant="secondary">Uploading...</Badge>}
            </div>

            {isUploaded ? (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>📄 {fileInfo.name} · {fileInfo.size}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG — max 5MB</p>
            )}

            {uploadErr && <div className="text-xs text-red-500">{uploadErr}</div>}
          </div>

          <div>
            {!isUploading && (
              <label className="cursor-pointer">
                <Button type="button" variant={isUploaded ? "outline" : "default"} size="sm" asChild>
                  <span>{isUploaded ? 'Replace File' : 'Browse Files'}</span>
                </Button>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => onUpload(e.target.files[0])} />
              </label>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceApplicationForm() {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [dragOverDoc, setDragOverDoc] = useState(null);

  const [formData, setFormData] = useState({
    applicantName: '',
    aadhaarNumber: '',
    phoneNumber: '',
    email: '',
    relationship: '',
    applicantDateOfBirth: ''
  });

  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [sortOption, setSortOption] = useState('POPULAR');

  const config = CERTIFICATE_CONFIG[serviceType];

  const filteredServices = Object.entries(CERTIFICATE_CONFIG).filter(([key, svc]) => {
    if (selectedDept !== 'ALL' && svc.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = svc.label?.toLowerCase().includes(q);
      const matchDesc = svc.description?.toLowerCase().includes(q);
      const matchDept = svc.department?.toLowerCase().includes(q);
      if (!matchLabel && !matchDesc && !matchDept) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOption === 'AZ') {
      return a[1].label.localeCompare(b[1].label);
    }
    const badgeA = a[1].badge ? 1 : 0;
    const badgeB = b[1].badge ? 1 : 0;
    return badgeB - badgeA;
  });

  const requiredDocs = config ? config.documents.filter(d => d.required) : [];
  const uploadedRequiredCount = requiredDocs.filter(d => uploadedDocs[d.id]).length;
  const progressPercent = requiredDocs.length > 0 ? Math.round((uploadedRequiredCount / requiredDocs.length) * 100) : 100;

  const isDetailsValid = () => {
    if (!formData.applicantName || formData.aadhaarNumber.length < 14) return false;
    if (!formData.phoneNumber || !formData.email) return false;
    for (const field of config?.fields || []) {
      if (field.required && !formData[field.name]) return false;
    }
    return true;
  };

  const isFormValid = () => isDetailsValid() && uploadedRequiredCount >= requiredDocs.length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'aadhaarNumber') {
      let val = value.replace(/\D/g, '');
      if (val.length > 12) val = val.slice(0, 12);
      const formatted = val.match(/.{1,4}/g)?.join('-') || '';
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const setFieldValue = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const processFileUpload = (docId, file) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadErrors(prev => ({ ...prev, [docId]: 'Only PDF, JPG, and PNG formats are allowed' }));
      toast.error('Only PDF, JPG, and PNG formats are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(prev => ({ ...prev, [docId]: 'File size must be under 5MB' }));
      toast.error('File size must be under 5MB');
      return;
    }

    setUploadErrors(prev => ({ ...prev, [docId]: null }));
    setUploadingDocs(prev => ({ ...prev, [docId]: true }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadingDocs(prev => ({ ...prev, [docId]: false }));
      setUploadedDocs(prev => ({
        ...prev,
        [docId]: { 
          id: docId, 
          name: file.name, 
          type: file.type, 
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          data: reader.result 
        }
      }));
      toast.success(`${docId} uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);

    const citizenId = keycloak.tokenParsed?.sub;
    const { applicantName, aadhaarNumber, ...dynamicData } = formData;

    const payload = {
      citizenId,
      serviceType,
      applicantName,
      aadhaarNumber,
      dynamicData,
      documentsSubmitted: JSON.stringify(Object.values(uploadedDocs))
    };

    try {
      const res = await api.post('/service-management-service/api/services/apply', payload);
      toast.success(`Application Submitted Successfully! App No: ${res.data.applicationNumber}`);
      setIsLoading(false);
      setTimeout(() => {
        navigate('/services/tracker');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409 && err.response?.data?.existingApplication) {
        setDuplicateData(err.response.data.existingApplication);
        toast.error('Duplicate application detected.');
      } else {
        toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to submit application.');
      }
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setServiceType('');
    setIsStarted(false);
    setFormStep(1);
    setFormData({ applicantName: '', aadhaarNumber: '', phoneNumber: '', email: '' });
    setUploadedDocs({});
    setUploadErrors({});
  };

  const selectService = (key) => {
    setServiceType(key);
    setIsStarted(false);
    setFormStep(1);
    setDuplicateData(null);
  };

  if (duplicateData) {
    return (
      <AppShell title="Apply for Certificates">
        <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
          <div style={{ background: '#fef2f2', padding: '24px', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: '#ef4444', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, color: '#fff' }}>⚠️</span>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#991b1b' }}>Duplicate Application Detected</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#b91c1c' }}>You already have an active application for this service.</p>
            </div>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Application Number</span>
              <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{duplicateData.applicationNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Status</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{duplicateData.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Applicant Aadhaar</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{duplicateData.aadhaarNumber}</span>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button 
                onClick={() => setDuplicateData(null)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Go Back
              </button>
              <button 
                onClick={() => navigate('/services/tracker')}
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
    <AppShell title="Apply for Certificates">
      <div style={{ paddingBottom: 40 }}>

        {serviceType && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={resetSelection}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10, background: '#ffffff',
                border: '1.5px solid #cbd5e1', color: '#1e293b', fontSize: 13,
                fontWeight: 700, cursor: 'pointer'
              }}
            >
              ← Change Service
            </button>
          </div>
        )}

        {/* Step 1: Service Selection Cards */}
        {!serviceType && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* ── Page Header (Executive Navy/Emerald Theme matching Civic Services) ── */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #065f46 100%)',
              borderRadius: 20, padding: '28px 32px', color: '#ffffff',
              display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 12px 36px rgba(15,23,42,0.25)', border: '1px solid #334155',
              marginBottom: 16, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  background: 'rgba(255,255,255,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)',
                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block', marginBottom: 8
                }}>
                  CIVIC SERVICES
                </span>
                <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Apply for Government Certificates
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', maxWidth: 540, fontSize: 14, lineHeight: 1.5 }}>
                  Choose from digitally verifiable municipal certificate services to start your official application.
                </p>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Link to="/services/tracker" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 22px',
                    borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <Search size={16} /> Track My Applications
                  </button>
                </Link>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div style={{
              background: '#ffffff', borderRadius: 14, padding: '16px 20px',
              border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
              display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center'
            }}>
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <input
                  type="text"
                  placeholder="Search certificates by title or department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px 10px 42px', borderRadius: 10,
                    border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                style={{
                  padding: '9px 14px', borderRadius: 10, border: '1px solid #cbd5e1',
                  fontSize: 13, fontWeight: 600, color: '#334155', background: '#ffffff', cursor: 'pointer'
                }}
              >
                <option value="ALL">All Departments</option>
                <option value="Health Department">Health Department</option>
                <option value="Revenue Department">Revenue Department</option>
                <option value="Municipal Corporation">Municipal Corporation</option>
                <option value="Urban Planning Department">Urban Planning Department</option>
              </select>

              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                style={{
                  padding: '9px 14px', borderRadius: 10, border: '1px solid #cbd5e1',
                  fontSize: 13, fontWeight: 600, color: '#334155', background: '#ffffff', cursor: 'pointer'
                }}
              >
                <option value="POPULAR">Sort By: Popular</option>
                <option value="AZ">Sort By: Name (A-Z)</option>
              </select>

              <span style={{ marginLeft: 'auto', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                {filteredServices.length} certificates available
              </span>
            </div>

            {/* Section Header */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
                Popular Certificates
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                Select a certificate service to start your official application
              </p>
            </div>

            {/* Certificates Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 20 }}>
              {filteredServices.map(([key, svc]) => (
                <div
                  key={key}
                  onClick={() => selectService(key)}
                  style={{
                    background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0',
                    padding: 20, cursor: 'pointer', transition: 'all 0.15s ease-in-out',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.04)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(37,99,235,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 12,
                        background: '#eff6ff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 22, flexShrink: 0
                      }}>
                        {svc.icon}
                      </div>
                      {svc.badge && (
                        <span style={{
                          background: '#dcfce7', color: '#15803d', fontSize: 10,
                          fontWeight: 800, padding: '3px 8px', borderRadius: 20,
                          letterSpacing: '0.05em'
                        }}>
                          {svc.badge}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.3 }}>
                      {svc.label}
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
                      {svc.description}
                    </p>
                  </div>

                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: 12, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#475569', fontWeight: 600
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Building2 size={13} color="#94a3b8" />
                        {svc.department}
                      </span>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>
                        {svc.approvalTime}
                      </span>
                    </div>

                    <button style={{
                      width: '100%', marginTop: 14, padding: '10px 14px', borderRadius: 10,
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
                      border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
                    }}>
                      Apply Now <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Requirements Card */}
        {config && !isStarted && (
          <Card className="mb-6">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-primary">
                <span className="text-2xl">{config.icon}</span>
                {config.label} — Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Department:</strong> {config.department}</div>
                <div><strong>Processing Time:</strong> {config.approvalTime}</div>
                <div><strong>Application Fee:</strong> {config.fee}</div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Required Documents Checklist</h4>
                <ul className="space-y-1 text-sm">
                  {config.documents.map(doc => (
                    <li key={doc.id} className="flex items-center gap-2">
                      <span className={doc.required ? "text-green-600 font-bold" : "text-muted-foreground"}>
                        {doc.required ? "✓" : "○"}
                      </span>
                      <span>
                        {doc.label}
                        {doc.required ? <span className="text-red-500"> *</span> : <span className="text-xs text-muted-foreground"> (Optional)</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button className="w-full" size="lg" onClick={() => setIsStarted(true)}>
                Start Application →
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Multi-step Form */}
        {config && isStarted && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <StepIndicator steps={FORM_STEPS} currentStep={formStep} />

            <Card>
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-base">
                  {config.icon} {config.label} — <span className="text-primary">{FORM_STEPS[formStep - 1]}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Step 1: Fill Details */}
                {formStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-primary border-b pb-1">👤 Applicant Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Applicant Name *</label>
                          <Input name="applicantName" value={formData.applicantName} onChange={handleInputChange} required placeholder="As per Aadhaar" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Aadhaar Number *</label>
                          <Input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} required placeholder="XXXX-XXXX-XXXX" maxLength={14} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone Number *</label>
                          <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="10-digit number" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email Address *</label>
                          <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Email for updates" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Applying For (Relationship)</label>
                          <Input name="relationship" value={formData.relationship} onChange={handleInputChange} placeholder="e.g. Self, Son, Daughter" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Applicant Date of Birth</label>
                          <Input type="date" name="applicantDateOfBirth" value={formData.applicantDateOfBirth} onChange={handleInputChange} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-primary border-b pb-1">📋 Service Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {config.fields.map(field => (
                          <div key={field.name}>
                            <label className="block text-sm font-medium mb-1">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {field.type === 'select' ? (
                              <Select value={formData[field.name] || ''} onValueChange={val => setFieldValue(field.name, val)}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                  {field.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input type={field.type} name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload Documents */}
                {formStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/40 rounded-lg border space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Documents Uploaded: {uploadedRequiredCount} / {requiredDocs.length}</span>
                        <span className={progressPercent === 100 ? "text-green-600" : "text-primary"}>{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} />
                      {progressPercent === 100 && (
                        <p className="text-xs text-green-600 font-semibold">✓ All required documents uploaded</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {config.documents.map(doc => (
                        <UploadCard
                          key={doc.id}
                          doc={doc}
                          isUploaded={!!uploadedDocs[doc.id]}
                          isUploading={uploadingDocs[doc.id]}
                          uploadErr={uploadErrors[doc.id]}
                          fileInfo={uploadedDocs[doc.id]}
                          dragOver={dragOverDoc === doc.id}
                          onDragOver={(e) => { e.preventDefault(); setDragOverDoc(doc.id); }}
                          onDragLeave={() => setDragOverDoc(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverDoc(null);
                            processFileUpload(doc.id, e.dataTransfer.files[0]);
                          }}
                          onUpload={(file) => processFileUpload(doc.id, file)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {formStep === 3 && (
                  <div className="space-y-3 text-sm">
                    <h4 className="font-semibold text-sm mb-2 text-primary">Review Your Application</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-4 bg-muted/20 rounded-lg border">
                      <div><span className="text-muted-foreground">Service Type:</span> <strong>{config.label}</strong></div>
                      <div><span className="text-muted-foreground">Applicant Name:</span> <strong>{formData.applicantName}</strong></div>
                      <div><span className="text-muted-foreground">Aadhaar:</span> <strong>{formData.aadhaarNumber}</strong></div>
                      <div><span className="text-muted-foreground">Phone / Email:</span> <strong>{formData.phoneNumber} · {formData.email}</strong></div>
                      <div><span className="text-muted-foreground">Department:</span> <strong>{config.department}</strong></div>
                      <div><span className="text-muted-foreground">Fee:</span> <strong>{config.fee}</strong></div>
                      <div className="md:col-span-2"><span className="text-muted-foreground">Documents:</span> <strong>{Object.keys(uploadedDocs).length} file(s) uploaded</strong></div>
                    </div>
                  </div>
                )}

                {/* Step 4: Submit confirmation */}
                {formStep === 4 && (
                  <div className="text-center py-6 space-y-3 max-w-md mx-auto">
                    <div className="text-5xl">📨</div>
                    <h3 className="text-lg font-bold text-primary">Ready to Submit</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      By submitting, you confirm that all information provided is accurate and all uploaded documents are genuine.
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between bg-muted/20 border-t p-4">
                {formStep > 1 && (
                  <Button type="button" variant="outline" onClick={() => setFormStep(formStep - 1)}>
                    ← Previous
                  </Button>
                )}
                <div className="ml-auto flex gap-2">
                  {formStep < 4 && (
                    <Button
                      type="button"
                      onClick={() => {
                        if (formStep === 1 && !isDetailsValid()) {
                          toast.error('Please fill all required fields before continuing.');
                          return;
                        }
                        if (formStep === 2 && uploadedRequiredCount < requiredDocs.length) {
                          toast.error('Please upload all required documents before continuing.');
                          return;
                        }
                        setFormStep(formStep + 1);
                      }}
                    >
                      Continue →
                    </Button>
                  )}
                  {formStep === 4 && (
                    <Button type="submit" disabled={isLoading || !isFormValid()}>
                      {isLoading ? 'Submitting Application...' : '✓ Submit Application'}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </AppShell>
  );
}

export default ServiceApplicationForm;
