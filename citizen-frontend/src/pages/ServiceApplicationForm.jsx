import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import StepIndicator from '../components/StepIndicator.jsx';

const CERTIFICATE_CONFIG = {
  BIRTH_CERTIFICATE: {
    label: 'Birth Certificate',
    icon: '👶',
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
    <div
      className={`upload-card${isUploaded ? ' uploaded' : ''}${isUploading ? ' uploading' : ''}${dragOver ? ' drag-over' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="upload-zone">
        <div className="upload-zone-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <h5 style={{ margin: 0, fontSize: '14px', color: isUploaded ? 'var(--accent-dark)' : 'var(--text)' }}>
              {doc.label} {doc.required && <span style={{ color: 'var(--danger)' }}>*</span>}
            </h5>
            {isUploaded && <span className="badge badge-green">Uploaded</span>}
            {isUploading && <span className="badge badge-blue">Uploading...</span>}
          </div>

          {isUploaded ? (
            <div className="upload-file-info">
              <span><i className="bi bi-file-earmark-check text-success"></i></span>
              <span>{fileInfo.name} · {fileInfo.size}</span>
            </div>
          ) : (
            <div className="upload-drop-area">
              <span className="upload-icon"><i className="bi bi-cloud-arrow-up"></i></span>
              <p>Drag & drop your file here</p>
              <div className="upload-hint">PDF, JPG, PNG — max 5MB</div>
            </div>
          )}

          {isUploading && (
            <div className="upload-progress-bar">
              <div className="upload-progress-fill" style={{ width: '70%' }} />
            </div>
          )}

          {uploadErr && <div className="form-error" style={{ marginTop: '8px' }}>{uploadErr}</div>}
        </div>

        <div>
          {!isUploading && (
            <label className={`btn btn-sm ${isUploaded ? 'btn-outline' : 'btn-accent'}`} style={{ cursor: 'pointer', margin: 0 }}>
              {isUploaded ? 'Replace File' : 'Browse Files'}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => onUpload(e.target.files[0])} />
            </label>
          )}
        </div>
      </div>
    </div>
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
    email: ''
  });

  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const config = CERTIFICATE_CONFIG[serviceType];

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
      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const processFileUpload = (docId, file) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadErrors({ ...uploadErrors, [docId]: 'Only PDF, JPG, and PNG formats are allowed' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors({ ...uploadErrors, [docId]: 'File size must be under 5MB' });
      return;
    }

    setUploadErrors({ ...uploadErrors, [docId]: null });
    setUploadingDocs({ ...uploadingDocs, [docId]: true });

    setTimeout(() => {
      setUploadingDocs(prev => ({ ...prev, [docId]: false }));
      setUploadedDocs(prev => ({
        ...prev,
        [docId]: { name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' }
      }));
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);

    const citizenId = keycloak.tokenParsed?.sub;
    const { applicantName, aadhaarNumber, ...dynamicData } = formData;

    const payload = {
      citizenId,
      serviceType,
      applicantName,
      aadhaarNumber,
      dynamicData,
      documentsSubmitted: JSON.stringify(Object.keys(uploadedDocs))
    };

    try {
      const res = await api.post('/service-management-service/api/services/apply', payload);
      setSuccessMsg(`Application Submitted Successfully! Application No: ${res.data.applicationNumber}`);
      setIsLoading(false);
      setTimeout(() => {
        navigate('/services/tracker');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit application.');
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
  };

  return (
    <AppShell title="Apply for Certificates">
      <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '3rem' }} className="animate-fade-in">

        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: 'var(--primary)', marginBottom: '4px' }}>Apply for Certificates & Permits</h1>
            <p className="text-muted">Select a service, review requirements, and complete your application online.</p>
          </div>
          {(isStarted || serviceType) && (
            <button type="button" className="btn btn-outline btn-sm" onClick={resetSelection}>
              ← Change Service
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" role="status">
            <span>✓</span> {successMsg}
          </div>
        )}

        {/* Step 1: Service Selection Cards */}
        {!serviceType && (
          <div className="animate-slide-up">
            <h2 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '16px' }}>Select a Certificate Service</h2>
            <div className="cert-services-grid">
              {Object.entries(CERTIFICATE_CONFIG).map(([key, svc]) => (
                <div
                  key={key}
                  className="cert-service-card"
                  onClick={() => selectService(key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && selectService(key)}
                  aria-label={`Apply for ${svc.label}`}
                >
                  <div className="cert-icon">{svc.icon}</div>
                  <div className="cert-name">{svc.label}</div>
                  <div className="cert-desc">{svc.description}</div>
                  <div className="cert-meta-row">
                    <span className="cert-meta-tag"><i className="bi bi-building"></i> {svc.department}</span>
                    <span className="cert-meta-tag"><i className="bi bi-clock"></i> {svc.approvalTime}</span>
                    <span className="cert-meta-tag"><i className="bi bi-credit-card"></i> {svc.fee}</span>
                  </div>
                  <div className="cert-continue">Click to Continue →</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Requirements Card */}
        {config && !isStarted && (
          <div className="card requirements-card animate-slide-up">
            <div className="card-header" style={{ background: 'var(--surface2)' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
                {config.label} — Requirements
              </h3>
            </div>
            <div className="card-body">
              <div className="req-grid">
                <div className="req-info-list">
                  <div className="req-info-item">
                    <div className="req-icon"><i className="bi bi-building"></i></div>
                    <div><strong>Department:</strong> {config.department}</div>
                  </div>
                  <div className="req-info-item">
                    <div className="req-icon"><i className="bi bi-clock"></i></div>
                    <div><strong>Processing Time:</strong> {config.approvalTime}</div>
                  </div>
                  <div className="req-info-item">
                    <div className="req-icon"><i className="bi bi-credit-card"></i></div>
                    <div><strong>Application Fee:</strong> {config.fee}</div>
                  </div>
                </div>
                <div className="doc-checklist">
                  <h4>Required Documents Checklist</h4>
                  <ul>
                    {config.documents.map(doc => (
                      <li key={doc.id}>
                        <span style={{ color: doc.required ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {doc.required ? '✔' : '○'}
                        </span>
                        <span>
                          {doc.label}
                          {doc.required
                            ? <span style={{ color: 'var(--danger)', fontSize: '12px' }}> *</span>
                            : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> (Optional)</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <button type="button" className="btn btn-primary btn-full btn-lg" onClick={() => setIsStarted(true)}>
                Start Application →
              </button>
            </div>
          </div>
        )}

        {/* Multi-step Form */}
        {config && isStarted && (
          <form onSubmit={handleSubmit} className="animate-slide-up">
            <StepIndicator steps={FORM_STEPS} currentStep={formStep} />

            <div className="card">
              <div className="card-header" style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, color: 'var(--text)' }}>
                  {config.icon} {config.label} — <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{FORM_STEPS[formStep - 1]}</span>
                </h3>
              </div>

              <div className="card-body">
                {/* Step 1: Fill Details */}
                {formStep === 1 && (
                  <>
                    <div className="detail-section">
                      <div className="detail-section-title">👤 Applicant Details</div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Applicant Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <input type="text" className="form-control" name="applicantName" value={formData.applicantName} onChange={handleInputChange} required placeholder="As per Aadhaar" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Aadhaar Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <input type="text" className="form-control" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} required placeholder="XXXX-XXXX-XXXX" maxLength="14" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <input type="text" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="10-digit number" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Email for updates" />
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <div className="detail-section-title">📋 Service Details</div>
                      <div className="form-row">
                        {config.fields.map(field => (
                          <div className="form-group" key={field.name}>
                            <label className="form-label">{field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
                            {field.type === 'select' ? (
                              <select className="form-control" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required}>
                                <option value="">— Select —</option>
                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input type={field.type} className="form-control" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Upload Documents */}
                {formStep === 2 && (
                  <>
                    <div style={{ marginBottom: '20px', background: 'var(--surface2)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
                        <span>Documents Uploaded: {uploadedRequiredCount} / {requiredDocs.length}</span>
                        <span style={{ color: progressPercent === 100 ? 'var(--accent)' : 'var(--primary)' }}>{progressPercent}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPercent}%`, background: progressPercent === 100 ? 'var(--accent)' : 'var(--primary)', transition: 'width 0.4s ease' }} />
                      </div>
                      {progressPercent === 100 && (
                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>✓ All required documents uploaded</p>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  </>
                )}

                {/* Step 3: Review */}
                {formStep === 3 && (
                  <div className="review-summary">
                    <div className="detail-section-title" style={{ border: 'none', marginBottom: '12px', paddingBottom: 0 }}>Review Your Application</div>
                    <div className="review-row">
                      <span className="review-label">Service Type</span>
                      <span className="review-value">{config.label}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Applicant Name</span>
                      <span className="review-value">{formData.applicantName}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Aadhaar</span>
                      <span className="review-value">{formData.aadhaarNumber}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Phone / Email</span>
                      <span className="review-value">{formData.phoneNumber} · {formData.email}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Department</span>
                      <span className="review-value">{config.department}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Fee</span>
                      <span className="review-value">{config.fee}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Documents</span>
                      <span className="review-value">{Object.keys(uploadedDocs).length} file(s) uploaded</span>
                    </div>
                    {config.fields.filter(f => formData[f.name]).map(field => (
                      <div className="review-row" key={field.name}>
                        <span className="review-label">{field.label}</span>
                        <span className="review-value">{formData[field.name]}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 4: Submit confirmation */}
                {formStep === 4 && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📨</div>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Ready to Submit</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.6' }}>
                      By submitting, you confirm that all information provided is accurate and all uploaded documents are genuine.
                    </p>
                    <div className="alert alert-info" style={{ textAlign: 'left', maxWidth: '420px', margin: '0 auto' }}>
                      Your application will be sent to <strong>{config.department}</strong> for verification. Expected processing time: <strong>{config.approvalTime}</strong>.
                    </div>
                  </div>
                )}
              </div>

              <div className="card-footer" style={{ padding: '16px 20px', background: 'var(--surface2)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                {formStep > 1 && (
                  <button type="button" className="btn btn-outline" onClick={() => setFormStep(formStep - 1)}>
                    ← Previous
                  </button>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                  {formStep < 4 && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (formStep === 1 && !isDetailsValid()) {
                          setError('Please fill all required fields before continuing.');
                          return;
                        }
                        if (formStep === 2 && uploadedRequiredCount < requiredDocs.length) {
                          setError('Please upload all required documents before continuing.');
                          return;
                        }
                        setError(null);
                        setFormStep(formStep + 1);
                      }}
                    >
                      Continue →
                    </button>
                  )}
                  {formStep === 4 && (
                    <button
                      type="submit"
                      className="btn btn-accent btn-lg"
                      disabled={isLoading || !isFormValid()}
                    >
                      {isLoading ? 'Submitting Application...' : '✓ Submit Application'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}

export default ServiceApplicationForm;
