import React, { useState, useEffect } from 'react';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { Search, Filter, Plus, Edit2, Trash2, ShieldOff, KeyRound } from 'lucide-react';

function AdminOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // App data for metrics
  const [complaints, setComplaints] = useState([]);
  const [applications, setApplications] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    officerName: '',
    username: '',
    department: 'Health Department',
    role: 'OFFICER',
    email: '',
    phoneNumber: '',
    status: 'Active'
  });

  const [toastMessage, setToastMessage] = useState('');

  const departments = [
    'Health Department',
    'Revenue Department',
    'Municipal Corporation',
    'Water Department',
    'Roads Department',
    'Electricity Department',
    'Sanitation Department',
    'Urban Planning Department'
  ];

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const [officersRes, compRes, appsRes] = await Promise.all([
        api.get('/service-management-service/api/officers'),
        api.get('/grievance-service/api/complaints?page=0&size=1000'),
        api.get('/service-management-service/api/services')
      ]);
      setOfficers(officersRes.data);
      setComplaints(compRes.data.content || compRes.data || []);
      setApplications(appsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data for officers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({
      id: null,
      officerName: '',
      username: '',
      department: 'Health Department',
      role: 'OFFICER',
      email: '',
      phoneNumber: '',
      status: 'Active'
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (officer) => {
    setFormData({
      id: officer.id,
      officerName: officer.officerName || '',
      username: officer.username || '',
      department: officer.department || 'Health Department',
      role: officer.role || 'OFFICER',
      email: officer.email || '',
      phoneNumber: officer.phoneNumber || '',
      status: officer.status || 'Active'
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/service-management-service/api/officers/${formData.id}`, formData);
        setToastMessage('Officer updated successfully!');
      } else {
        await api.post('/service-management-service/api/officers', formData);
        setToastMessage('Officer created successfully!');
      }
      setShowModal(false);
      fetchOfficers();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save officer', err);
      alert('Failed to save officer. Check console for details.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this officer?")) {
      try {
        await api.delete(`/service-management-service/api/officers/${id}`);
        fetchOfficers();
      } catch (err) {
        console.error('Failed to delete officer', err);
      }
    }
  };

  const filteredOfficers = officers.map(o => {
    // Calculate metrics
    const myComplaints = complaints.filter(c => c.assignedOfficer === o.username);
    const myApps = applications.filter(a => a.department === o.department); // approximate assigned apps

    const totalAssigned = myComplaints.length + myApps.length;
    const resolvedComps = myComplaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
    const resolvedApps = myApps.filter(a => ['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED', 'REJECTED'].includes(a.status)).length;
    
    const totalResolved = resolvedComps + resolvedApps;
    const resolutionRate = totalAssigned > 0 ? Math.round((totalResolved / totalAssigned) * 100) : 0;
    
    return { ...o, totalAssigned, totalResolved, resolutionRate };
  }).filter(o => {
    const matchSearch = o.officerName?.toLowerCase().includes(search.toLowerCase()) || 
                        o.username?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || o.department === deptFilter;
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <AppShell title="Manage Officers">
      <div style={{ width: '100%', maxWidth: '100%', padding: '0 24px 40px 24px', margin: '0 auto', boxSizing: 'border-box' }}>
        {toastMessage && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1100 }}>
          <div style={{ background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 8, fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            ✓ {toastMessage}
          </div>
        </div>
      )}

      {/* ── Welcome Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #334155)',
        borderRadius: 16, padding: '24px 32px', color: '#fff',
        display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 10px 25px rgba(15,23,42,0.3)',
        marginBottom: 30, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: '#fff', opacity: 0.03, borderRadius: '50%', filter: 'blur(30px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block' }}>
            ADMINISTRATION
          </span>
          <h2 style={{ margin: '10px 0 6px', fontSize: 28, fontWeight: 800, color: '#ffffff' }}>Manage Officers</h2>
          <p style={{ margin: 0, color: '#cbd5e1', maxWidth: 500, fontSize: 14 }}>
            View and manage field officers assigned to municipal departments.
          </p>
        </div>
        
        <button onClick={openAddModal} style={{
          background: '#fff', color: '#0f172a', border: 'none', padding: '12px 20px',
          borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative', zIndex: 1
        }}>
          <Plus size={18} /> Add Officer
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input 
              type="text" 
              placeholder="Search by name or username..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff', color: '#0f172a', outline: 'none' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select 
              style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff', color: '#0f172a', outline: 'none' }}
              value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
              style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff', color: '#0f172a', outline: 'none' }}
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><PageLoader message="Fetching officers..." /></div>
        ) : (
          <div style={{ overflowX: 'auto', padding: '0 0 20px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Officer Name</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Username</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact Info</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cases (Total/Res)</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Resolution %</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0f172a' }}>{o.officerName}</td>
                    <td style={{ padding: '16px 20px', fontSize: 13, fontFamily: 'monospace', color: '#64748b' }}>@{o.username}</td>
                    <td style={{ padding: '16px 20px', fontSize: 14 }}>{o.department}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: o.role === 'SENIOR_OFFICER' ? '#cff4fc' : '#cfe2ff',
                        color: o.role === 'SENIOR_OFFICER' ? '#055160' : '#084298',
                        padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        {o.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>
                      <div style={{ marginBottom: 4 }}>📧 {o.email}</div>
                      <div>📞 {o.phoneNumber}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{o.totalAssigned}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{o.totalResolved} Resolved</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 6, width: 60, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            background: o.resolutionRate > 80 ? '#10b981' : o.resolutionRate > 50 ? '#f59e0b' : '#ef4444',
                            width: `${o.resolutionRate}%`
                          }}></div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{o.resolutionRate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: o.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                        color: o.status === 'Active' ? '#15803d' : '#64748b',
                        padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: o.status === 'Active' ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button onClick={() => openEditModal(o)} style={{
                          background: '#fff', color: '#3b82f6', border: '1px solid #e2e8f0', padding: '6px',
                          borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32
                        }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(o.id)} style={{
                          background: '#fff', color: '#ef4444', border: '1px solid #e2e8f0', padding: '6px',
                          borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOfficers.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                      No officers found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                  <h4 className="modal-title fw-bold">{isEditing ? 'Edit Officer' : 'Add New Officer'}</h4>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input required type="text" className="form-control" name="officerName" value={formData.officerName} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Username</label>
                      <input required type="text" className="form-control" name="username" value={formData.username} onChange={handleInputChange} disabled={isEditing} />
                      {!isEditing && <div className="form-text">Will be used for Keycloak login.</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input required type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone Number</label>
                      <input required type="text" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select required className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Department</label>
                      <select required className="form-select" name="department" value={formData.department} onChange={handleInputChange}>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Role</label>
                      <select required className="form-select" name="role" value={formData.role} onChange={handleInputChange}>
                        <option value="OFFICER">Officer</option>
                        <option value="SENIOR_OFFICER">Senior Officer</option>
                      </select>
                    </div>
                    {!isEditing && (
                      <div className="col-12 mt-4 bg-light p-3 rounded-3 text-muted small d-flex align-items-center gap-2">
                        <KeyRound size={16} /> 
                        <span>A default password <strong>Password123</strong> will be assigned to this user automatically upon creation.</span>
                      </div>
                    )}
                    <div className="col-12 text-end mt-4">
                      <button type="button" className="btn btn-light me-2" onClick={() => setShowModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary px-4 fw-bold">{isEditing ? 'Save Changes' : 'Create Officer'}</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </AppShell>
  );
}

export default AdminOfficers;
