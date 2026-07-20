import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';

const DEPARTMENTS = ['Health', 'Water', 'Roads', 'Electricity', 'Sanitation', 'Revenue', 'Municipal Corporation'];
const CATEGORIES = [
  'Water Leakage', 'Water Shortage', 'No Water Supply', 'Water Tanker Request',
  'Pothole', 'Road Damage', 'Traffic Signal Issue', 'Encroachment',
  'Power Outage', 'Street Light Issue', 'Electricity Billing', 
  'Garbage Not Collected', 'Drain Blocked', 'Public Hygiene',
  'Mosquito Breeding', 'Stray Animals', 'Other'
];

function ComplaintForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', department: '', category: '', priority: 'LOW', location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.department || !form.location) {
      setError('Please fill in Title, Description, Department, and Location.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/grievance-service/api/complaints', {
        ...form,
        citizenId: keycloak.tokenParsed?.sub,
      });
      window.dispatchEvent(new Event('refresh-notifications'));
      navigate('/complaints');
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        const errors = Object.entries(err.response.data.fieldErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        setError(`Validation failed: ${errors}`);
      } else {
        setError(err.response?.data?.message || 'Submission failed. Make sure your citizen profile is registered.');
      }
      setLoading(false);
    }
  };

  return (
    <AppShell title="Raise Complaint">
      <div className="page-header">
        <h1 style={{ color: 'var(--primary)' }}><i className="bi bi-pencil-square"></i> Raise a Complaint</h1>
        <p className="text-muted">Describe your issue below. We'll assign it to the correct department automatically.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Form */}
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-error"><span>⚠️</span><div>{error}</div></div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Complaint Title *</label>
                <input className="form-control" value={form.title} onChange={set('title')} placeholder="e.g. No water supply in Ward 12 for 3 days" required />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea className="form-control" style={{ height: '120px', resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="Describe the problem in detail — location, how long, any previous complaints, visible damage..." required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <select className="form-control" value={form.department} onChange={set('department')} required>
                    <option value="">— Select Department —</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={form.category} onChange={set('category')}>
                    <option value="">— Select Category —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" value={form.priority} onChange={set('priority')}>
                    <option value="LOW">🟢 Low — No immediate danger</option>
                    <option value="MEDIUM">🟡 Medium — Urgent but manageable</option>
                    <option value="HIGH">🔴 High — Immediate public safety risk</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location / Landmark *</label>
                  <input className="form-control" value={form.location} onChange={set('location')} placeholder="e.g. Near MG Road bus stop" required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm" /> Submitting...</> : <><i className="bi bi-send"></i> Submit Complaint</>}
                </button>
                <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate('/complaints')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info sidebar */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-header"><h3><i className="bi bi-pin-angle"></i> SLA Timelines</h3></div>
            <div className="card-body" style={{ fontSize: '13.5px' }}>
              {[
                { p: 'High', c: 'danger', t: '24 hours' },
                { p: 'Medium', c: 'warning', t: '48 hours' },
                { p: 'Low', c: 'success', t: '72 hours' },
              ].map(i => (
                <div key={i.p} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span className={`text-${i.c} fw-bold`}><i className="bi bi-circle-fill" style={{ fontSize: '10px', marginRight: '6px' }}></i>{i.p}</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{i.t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3><i className="bi bi-info-circle"></i> Complaint Flow</h3></div>
            <div className="card-body">
              <div className="timeline">
                {[
                  { dot: 'blue', status: 'NEW', desc: 'You submit complaint' },
                  { dot: 'orange', status: 'ASSIGNED', desc: 'Admin assigns to officer' },
                  { dot: 'blue', status: 'IN PROGRESS', desc: 'Officer working on it' },
                  { dot: 'green', status: 'RESOLVED', desc: 'Issue fixed & closed' },
                ].map((s, i) => (
                  <div className="timeline-item" key={i}>
                    <div className={`timeline-dot ${s.dot}`} />
                    <div className="timeline-content">
                      <div className="tl-status">{s.status}</div>
                      <div className="tl-meta">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ComplaintForm;
