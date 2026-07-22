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
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-bg-success border-0 fade" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body fw-bold">
                ✓ {toastMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 mb-1 fw-bold text-primary">🧑‍💼 Manage Officers</h1>
          <p className="text-muted mb-0">View and manage field officers assigned to municipal departments.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill shadow-sm" onClick={openAddModal}>
          <Plus size={18} /> Add Officer
        </button>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap gap-3 align-items-center rounded-top-4">
          <div className="input-group" style={{ flex: '1 1 300px' }}>
            <span className="input-group-text bg-white border-end-0"><Search size={16} className="text-muted" /></span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder="Search by name or username..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="ALL">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center"><PageLoader message="Fetching officers..." /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Officer Name</th>
                  <th>Username</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Contact Info</th>
                  <th>Cases (Total/Res)</th>
                  <th>Resolution %</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map((o) => (
                  <tr key={o.id}>
                    <td className="ps-4 fw-semibold">{o.officerName}</td>
                    <td className="font-monospace small text-muted">@{o.username}</td>
                    <td>{o.department}</td>
                    <td>
                      <span className={`badge rounded-pill ${o.role === 'SENIOR_OFFICER' ? 'bg-info text-dark' : 'bg-primary'}`}>
                        {o.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="small text-muted">
                      <div className="mb-1"><i className="bi bi-envelope me-1"></i> {o.email}</div>
                      <div><i className="bi bi-telephone me-1"></i> {o.phoneNumber}</div>
                    </td>
                    <td>
                      <div className="fw-bold">{o.totalAssigned}</div>
                      <div className="small text-muted">{o.totalResolved} Resolved</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '6px', width: '60px' }}>
                          <div className={`progress-bar ${o.resolutionRate > 80 ? 'bg-success' : o.resolutionRate > 50 ? 'bg-warning' : 'bg-danger'}`} 
                               style={{ width: `${o.resolutionRate}%` }}></div>
                        </div>
                        <span className="small fw-semibold">{o.resolutionRate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${o.status === 'Active' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-1">
                        <button className="btn btn-sm btn-light text-primary border rounded-circle p-2" onClick={() => openEditModal(o)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-sm btn-light text-danger border rounded-circle p-2" onClick={() => handleDelete(o.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOfficers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
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
    </AppShell>
  );
}

export default AdminOfficers;
