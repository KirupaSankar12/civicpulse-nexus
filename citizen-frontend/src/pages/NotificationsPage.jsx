import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import { Check, CheckCircle2 } from 'lucide-react';

function getNotifIcon(eventType) {
  const type = (eventType || '').toUpperCase();
  if (type.includes('COMPLAINT') || type.includes('GRIEVANCE')) return '📢';
  if (type.includes('ASSIGN')) return '👤';
  if (type.includes('RESOLV') || type.includes('APPROV')) return '✅';
  if (type.includes('REJECT')) return '❌';
  if (type.includes('PERMIT')) return '🏗';
  if (type.includes('TRADE')) return '🏢';
  if (type.includes('BIRTH')) return '👶';
  if (type.includes('DEATH')) return '🕊';
  if (type.includes('INCOME')) return '💰';
  if (type.includes('RESIDENCE')) return '🏠';
  if (type.includes('CERTIFICATE') || type.includes('SERVICE')) return '📜';
  if (type.includes('VERIFICATION')) return '🟡';
  return '🔔';
}

// Helper to determine time group
function getTimeGroup(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  
  // reset times to midnight for accurate day comparison
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = today - d;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return 'Earlier This Week';
  return 'Older';
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const navigate = useNavigate();

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer');
  const recipient = isOfficer
    ? keycloak.tokenParsed?.preferred_username
    : keycloak.tokenParsed?.sub;

  useEffect(() => {
    if (!recipient) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.get(`/notification-service/api/notifications/recipient/${recipient}`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifs();
    const t = setInterval(fetchNotifs, 10000);
    return () => clearInterval(t);
  }, [recipient]);

  const markRead = async (id) => {
    try {
      await api.put(`/notification-service/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, readStatus: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    const unreadItems = notifications.filter(n => !n.readStatus);
    for (const n of unreadItems) {
      await markRead(n.notificationId);
    }
  };

  const handleNotifClick = (n) => {
    if (!n.readStatus) markRead(n.notificationId);
    if (n.relatedEntityType === 'COMPLAINT') {
      navigate(isOfficer ? '/officer' : '/complaints');
    } else if (n.relatedEntityType === 'CERTIFICATE') {
      navigate(isOfficer ? '/services/officer/dashboard' : '/services/tracker');
    }
  };

  // Filtering
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'UNREAD') return !n.readStatus;
    if (activeTab === 'APPLICATIONS') return n.relatedEntityType === 'CERTIFICATE' && !n.eventType?.includes('PERMIT');
    if (activeTab === 'COMPLAINTS') return n.relatedEntityType === 'COMPLAINT';
    if (activeTab === 'CERTIFICATES') return n.eventType?.includes('CERTIFICATE');
    if (activeTab === 'PERMITS') return n.eventType?.includes('PERMIT');
    if (activeTab === 'SYSTEM') return n.eventType?.includes('SYSTEM') || n.eventType?.includes('SLA');
    return true; // ALL
  });

  // Grouping
  const grouped = filteredNotifications.reduce((acc, n) => {
    const group = getTimeGroup(n.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'Earlier This Week', 'Older'];

  return (
    <AppShell title="Notifications">
      <div className="max-w-4xl mx-auto" style={{ maxWidth: '900px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="h3 mb-1 fw-bold text-primary">Notifications</h1>
            <p className="text-muted mb-0">Stay updated on your applications and complaints.</p>
          </div>
          {notifications.some(n => !n.readStatus) && (
            <button className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2 shadow-sm" onClick={markAllRead}>
              <CheckCircle2 size={18} /> Mark All as Read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 overflow-auto pb-2 mb-4 hide-scrollbar" style={{ whiteSpace: 'nowrap' }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'UNREAD', label: 'Unread', count: notifications.filter(n => !n.readStatus).length },
            { id: 'APPLICATIONS', label: 'Applications' },
            { id: 'COMPLAINTS', label: 'Complaints' },
            { id: 'CERTIFICATES', label: 'Certificates' },
            { id: 'PERMITS', label: 'Permits' },
            { id: 'SYSTEM', label: 'System' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn rounded-pill px-4 fw-semibold ${activeTab === tab.id ? 'btn-primary shadow-sm' : 'btn-light border text-muted'}`}
            >
              {tab.label} {tab.count > 0 && <span className={`badge ms-2 rounded-pill ${activeTab === tab.id ? 'bg-white text-primary' : 'bg-primary'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          // Skeleton Loader
          <div className="card shadow-sm border-0 p-4 rounded-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="d-flex gap-3 mb-4 last-mb-0">
                <div className="rounded-circle bg-light flex-shrink-0" style={{ width: '50px', height: '50px' }}></div>
                <div className="flex-grow-1">
                  <div className="placeholder-glow"><span className="placeholder col-4 rounded mb-2"></span></div>
                  <div className="placeholder-glow"><span className="placeholder col-8 rounded mb-2"></span></div>
                  <div className="placeholder-glow"><span className="placeholder col-12 rounded"></span></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          // Empty State
          <div className="card shadow-sm border-0 rounded-4 text-center py-5">
            <div className="card-body py-5">
              <h1 className="display-1 mb-4">🎉</h1>
              <h4 className="fw-bold text-dark">You're all caught up!</h4>
              <p className="text-muted mb-0">No new notifications in this category.</p>
            </div>
          </div>
        ) : (
          // Timeline View
          <div className="d-flex flex-column gap-4">
            {groupOrder.map(group => {
              const groupNotifs = grouped[group];
              if (!groupNotifs || groupNotifs.length === 0) return null;
              
              return (
                <div key={group}>
                  <h6 className="fw-bold text-muted mb-3 ps-2 text-uppercase" style={{ letterSpacing: '1px', fontSize: '13px' }}>{group}</h6>
                  <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                    <div className="list-group list-group-flush">
                      {groupNotifs.map(n => (
                        <div
                          key={n.notificationId}
                          onClick={() => handleNotifClick(n)}
                          className={`list-group-item list-group-item-action p-4 border-bottom d-flex gap-3 align-items-start custom-hover-bg ${!n.readStatus ? 'bg-primary bg-opacity-10' : ''}`}
                          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm flex-shrink-0" style={{ width: '48px', height: '48px', fontSize: '24px' }}>
                            {getNotifIcon(n.eventType)}
                          </div>
                          <div className="flex-grow-1 min-vw-0">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className={`mb-1 fw-bold text-truncate ${!n.readStatus ? 'text-primary' : 'text-dark'}`} style={{ fontSize: '15px' }}>
                                {n.title || n.eventType}
                              </h6>
                              <small className="text-muted fw-semibold ms-2" style={{ whiteSpace: 'nowrap' }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </div>
                            
                            <p className="mb-2 text-muted lh-sm" style={{ fontSize: '14px' }}>
                              {n.message}
                            </p>
                            
                            {/* Metadata Pills */}
                            <div className="d-flex gap-2 flex-wrap mt-2">
                              {n.relatedEntityType && (
                                <span className="badge bg-light text-dark border text-capitalize px-2 py-1">
                                  {n.relatedEntityType.toLowerCase()}
                                </span>
                              )}
                              {n.eventType?.includes('VERIFICATION') && (
                                <span className="badge bg-warning text-dark border-warning px-2 py-1">Under Verification</span>
                              )}
                              {n.eventType?.includes('APPROV') && (
                                <span className="badge bg-success text-white px-2 py-1">Approved</span>
                              )}
                              {n.eventType?.includes('REJECT') && (
                                <span className="badge bg-danger text-white px-2 py-1">Rejected</span>
                              )}
                              
                              <button className="btn btn-sm btn-link text-decoration-none fw-bold ms-auto p-0" style={{ fontSize: '13px' }}>
                                View Details →
                              </button>
                            </div>
                          </div>
                          {!n.readStatus && (
                            <div className="align-self-center ms-2">
                              <div className="rounded-circle bg-primary" style={{ width: '10px', height: '10px' }}></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .last-mb-0:last-child {
          margin-bottom: 0 !important;
        }
      `}</style>
    </AppShell>
  );
}

export default NotificationsPage;
