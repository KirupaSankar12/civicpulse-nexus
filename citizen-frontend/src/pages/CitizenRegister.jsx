import { useState, useEffect } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';

function CitizenRegister() {
  const [formData, setFormData] = useState({
    name: keycloak.tokenParsed?.name || '',
    email: keycloak.tokenParsed?.email || '',
    phoneNumber: '',
    aadhar: '',
    address: '',
    ward: '',
    city: '',
    state: 'India',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [existing, setExisting] = useState(null);

  // Try to fetch existing profile
  useEffect(() => {
    const id = keycloak.tokenParsed?.sub;
    if (id) {
      api.get(`/citizen-service/api/citizens/${id}`)
        .then(r => {
          setExisting(r.data);
          setFormData(r.data);
        })
        .catch(() => {}); // Not found — fresh registration
    }
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (existing) {
        await api.put(`/citizen-service/api/citizens/${existing.citizenId}`, formData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        await api.post('/citizen-service/api/citizens/register', formData);
        setMessage({ type: 'success', text: 'Citizen profile created! You can now file complaints.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed. Check all required fields.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title={existing ? 'My Profile' : 'Complete Profile'}>
      <div className="page-header">
        <h1 style={{ color: 'var(--primary)' }}>👤 {existing ? 'My Profile' : 'Complete Citizen Profile'}</h1>
        <p className="text-muted">
          {existing ? 'Update your personal information below.' : 'Complete your profile to start filing complaints and accessing services.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-body">
            {message && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder="Full legal name" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email (Keycloak Account)</label>
                  <input type="email" className="form-control" value={formData.email} disabled />
                  <div className="form-hint">This is your login email — cannot be changed here</div>
                </div>
                <div className="form-group">
                  <label>Phone Number * (10 digits)</label>
                  <input className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="9876543210" />
                </div>
              </div>

              <div className="form-group">
                <label>Aadhaar Number (Optional)</label>
                <input className="form-control" name="aadhar" value={formData.aadhar || ''} onChange={handleChange} placeholder="1234-5678-9012" />
              </div>

              <div className="form-group">
                <label>Residential Address *</label>
                <input className="form-control" name="address" value={formData.address} onChange={handleChange} required placeholder="Flat no., Street, Area/Locality" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ward *</label>
                  <input className="form-control" name="ward" value={formData.ward} onChange={handleChange} required placeholder="e.g. Ward 12" />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input className="form-control" name="city" value={formData.city} onChange={handleChange} required placeholder="e.g. New Delhi" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <input className="form-control" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Delhi" />
                </div>
                <div className="form-group">
                  <label>PIN Code * (6 digits)</label>
                  <input className="form-control" name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="110001" maxLength={6} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner-sm" /> Saving...</> : (existing ? '💾 Update Profile' : '✅ Save Profile')}
              </button>
            </form>
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header"><h3>ℹ️ Why Complete Profile?</h3></div>
          <div className="card-body" style={{ fontSize: '13.5px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            <p>Your citizen profile is required to:</p>
            <ul style={{ paddingLeft: '18px', marginTop: '8px' }}>
              <li>File grievances and complaints</li>
              <li>Apply for government certificates</li>
              <li>Receive SLA notifications</li>
              <li>Track your ward's service updates</li>
            </ul>
            {existing && (
              <div className="alert alert-info" style={{ marginTop: '16px' }}>
                ✅ Profile complete. Citizen ID: <code style={{ fontSize: '10px' }}>{existing.citizenId?.slice(0, 12)}...</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default CitizenRegister;
