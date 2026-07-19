import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';

const CERTIFICATE_CONFIG = {
  BIRTH_CERTIFICATE: {
    label: 'Birth Certificate',
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
  }
};

function ServiceApplicationForm() {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    applicantName: '',
    aadhaarNumber: '',
    phoneNumber: '',
    email: ''
  });
  
  // Documents State
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const config = CERTIFICATE_CONFIG[serviceType];
  
  // Calculate Progress
  const requiredDocs = config ? config.documents.filter(d => d.required) : [];
  const uploadedRequiredCount = requiredDocs.filter(d => uploadedDocs[d.id]).length;
  const progressPercent = requiredDocs.length > 0 ? Math.round((uploadedRequiredCount / requiredDocs.length) * 100) : 100;
  
  // Validation for Submit Button
  const isFormValid = () => {
    if (!formData.applicantName || formData.aadhaarNumber.length < 14) return false;
    if (requiredDocs.length > uploadedRequiredCount) return false;
    for (let field of config?.fields || []) {
      if (field.required && !formData[field.name]) return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'aadhaarNumber') {
      let val = value.replace(/\D/g, '');
      if (val.length > 12) val = val.slice(0, 12);
      let formatted = val.match(/.{1,4}/g)?.join('-') || '';
      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileUpload = (docId, file) => {
    if (!file) return;
    
    // Validate File
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadErrors({ ...uploadErrors, [docId]: 'Only PDF, JPG, and PNG formats are allowed' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors({ ...uploadErrors, [docId]: 'File size must be under 5MB' });
      return;
    }
    
    // Clear errors, start upload simulation
    setUploadErrors({ ...uploadErrors, [docId]: null });
    setUploadingDocs({ ...uploadingDocs, [docId]: true });
    
    // Simulate network upload
    setTimeout(() => {
      setUploadingDocs({ ...uploadingDocs, [docId]: false });
      setUploadedDocs({ ...uploadedDocs, [docId]: { name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' } });
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setIsLoading(true);
    setError(null);

    const citizenId = keycloak.tokenParsed?.sub;
    
    // Separate standard fields from dynamic fields
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
    setFormData({ applicantName: '', aadhaarNumber: '', phoneNumber: '', email: '' });
    setUploadedDocs({});
  };

  return (
    <AppShell title="Apply for Certificates">
      <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: '3rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: 'var(--primary)', marginBottom: '4px' }}>📝 Apply for Certificates & Permits</h1>
            <p className="text-muted">Select a service type to view requirements and begin your application.</p>
          </div>
          {isStarted && (
            <button className="btn btn-outline btn-sm" onClick={resetSelection}>
              Change Service
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}
        
        {successMsg && (
          <div className="alert alert-success">
            <span>✓</span> {successMsg}
          </div>
        )}

        {/* 1. Selection Step */}
        {!isStarted && (
          <div className="card glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
            <div className="form-group mb-0">
              <label className="form-label" style={{ fontSize: '15px' }}>Select Certificate Type</label>
              <select
                className="form-control"
                style={{ fontSize: '15px', padding: '12px' }}
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="">-- Select an option --</option>
                {Object.keys(CERTIFICATE_CONFIG).map(key => (
                  <option key={key} value={key}>{CERTIFICATE_CONFIG[key].label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 2. Application Requirements Card */}
        {config && !isStarted && (
          <div className="card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="card-header" style={{ background: '#f8fafc' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📑</span> {config.label} Requirements
              </h3>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '14px' }}><strong>Department:</strong> <span className="badge badge-blue">{config.department}</span></p>
                <p style={{ margin: '0 0 10px', fontSize: '14px' }}><strong>Approval Time:</strong> <span className="badge badge-purple">{config.approvalTime}</span></p>
                <p style={{ margin: '0 0 10px', fontSize: '14px' }}><strong>Application Fee:</strong> <span className="badge badge-green">{config.fee}</span></p>
              </div>
              <div style={{ background: '#f0f4f8', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Required Documents</h4>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {config.documents.map(doc => (
                    <li key={doc.id} style={{ fontSize: '14px', marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: doc.required ? 'var(--accent)' : 'var(--text-muted)' }}>{doc.required ? '✔' : '○'}</span>
                      {doc.label} {doc.required ? <span style={{ color: 'var(--danger)', fontSize: '12px' }}>*</span> : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Optional)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setIsStarted(true)}>
                Start Application ➔
              </button>
            </div>
          </div>
        )}

        {/* 3. Dynamic Form */}
        {config && isStarted && (
          <form onSubmit={handleSubmit} className="card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="card-header" style={{ background: 'var(--primary)', color: 'white' }}>
              <h3 style={{ margin: 0, color: 'white' }}>{config.label} Application Form</h3>
            </div>
            
            <div className="card-body">
              <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Applicant Details</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Applicant Name <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className="form-control" name="applicantName" value={formData.applicantName} onChange={handleInputChange} required placeholder="As per Aadhaar" />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar Number <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className="form-control" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} required placeholder="XXXX-XXXX-XXXX" maxLength="14" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number <span style={{color: 'red'}}>*</span></label>
                  <input type="text" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="10-digit number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address <span style={{color: 'red'}}>*</span></label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Email for updates" />
                </div>
              </div>

              <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Service Details</h4>
              <div className="form-row">
                {config.fields.map(field => (
                  <div className="form-group" key={field.name}>
                    <label className="form-label">{field.label} {field.required && <span style={{color: 'red'}}>*</span>}</label>
                    {field.type === 'select' ? (
                      <select className="form-control" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required}>
                        <option value="">-- Select --</option>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} className="form-control" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required} />
                    )}
                  </div>
                ))}
              </div>

              {/* 4. Document Upload Section */}
              <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                Document Upload
              </h4>
              
              {/* Upload Progress */}
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
                  <span>Documents Uploaded: {uploadedRequiredCount} / {requiredDocs.length}</span>
                  <span style={{ color: progressPercent === 100 ? 'var(--accent)' : 'var(--primary)' }}>{progressPercent}%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, background: progressPercent === 100 ? 'var(--accent)' : 'var(--primary)', transition: 'width 0.4s ease' }}></div>
                </div>
                {progressPercent === 100 && <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>✓ All Required Documents Uploaded</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {config.documents.map(doc => {
                  const isUploaded = !!uploadedDocs[doc.id];
                  const isUploading = uploadingDocs[doc.id];
                  const uploadErr = uploadErrors[doc.id];

                  return (
                    <div key={doc.id} style={{ border: `1px solid ${isUploaded ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '8px', padding: '15px', background: isUploaded ? '#f0fdf4' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h5 style={{ margin: 0, fontSize: '14px', color: isUploaded ? 'var(--accent-dark)' : 'var(--text)' }}>
                            {doc.label} {doc.required && <span style={{color: 'red'}}>*</span>}
                          </h5>
                          {isUploaded && <span className="badge badge-green">Uploaded</span>}
                        </div>
                        
                        {isUploaded ? (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {uploadedDocs[doc.id].name} • {uploadedDocs[doc.id].size}
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PDF, JPG, PNG up to 5MB</div>
                        )}
                        
                        {uploadErr && <div className="form-error">{uploadErr}</div>}
                      </div>

                      <div>
                        {isUploading ? (
                          <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>Uploading...</span>
                        ) : (
                          <label className={`btn btn-sm ${isUploaded ? 'btn-outline' : 'btn-accent'}`} style={{ cursor: 'pointer', margin: 0 }}>
                            {isUploaded ? 'Replace' : 'Choose File'}
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => handleFileUpload(doc.id, e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
            
            <div className="card-footer" style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
              <button 
                type="submit" 
                className={`btn btn-full btn-lg ${isFormValid() ? 'btn-primary' : 'btn-outline'}`}
                disabled={isLoading || !isFormValid()}
                title={!isFormValid() ? "Please fill all required fields and upload mandatory documents" : ""}
                style={{ 
                  background: isFormValid() ? 'var(--primary)' : '#e2e8f0', 
                  color: isFormValid() ? 'white' : '#94a3b8',
                  border: 'none',
                  cursor: isFormValid() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s'
                }}
              >
                {isLoading ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}

      </div>
    </AppShell>
  );
}

export default ServiceApplicationForm;

