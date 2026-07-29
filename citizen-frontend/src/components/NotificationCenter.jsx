import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import { Bell, Check, CheckCircle2, Circle, AlertCircle, RefreshCw } from 'lucide-react';

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

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const navigate = useNavigate();

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer');
  const recipient = isOfficer
    ? keycloak.tokenParsed?.preferred_username
    : keycloak.tokenParsed?.sub;

  useEffect(() => {
    if (!recipient) return;
    const fetch = () => {
      api.get(`/notification-service/api/notifications/recipient/${recipient}`)
        .then(r => {
          setNotifications(r.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    fetch();
    const t = setInterval(fetch, 2000);
    
    const handleForceRefresh = () => setTimeout(fetch, 500);
    window.addEventListener('refresh-notifications', handleForceRefresh);
    
    return () => {
      clearInterval(t);
      window.removeEventListener('refresh-notifications', handleForceRefresh);
    };
  }, [recipient]);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.readStatus).length;

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

  return (
    <div ref={ref} className="position-relative">
      <button
        type="button"
        className="btn btn-light position-relative p-2 rounded-circle border-0 d-flex align-items-center justify-content-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '40px', height: '40px', background: isOpen ? '#f1f5f9' : 'transparent', transition: 'all 0.2s' }}
      >
        <Bell size={20} className="text-secondary" />
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm border border-2 border-white" style={{ fontSize: '10px', marginTop: '4px', marginLeft: '-8px' }}>
            {unread > 9 ? '9+' : unread}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg border overflow-hidden" style={{ width: '380px', zIndex: 1050 }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
            <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
              Notifications
              {unread > 0 && <span className="badge bg-primary rounded-pill">{unread} new</span>}
            </h6>
            {unread > 0 && (
              <button type="button" className="btn btn-link text-decoration-none p-0 fw-semibold" style={{ fontSize: '13px' }} onClick={markAllRead}>
                <Check size={14} className="me-1" /> Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              // Loading Skeleton Cards
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-3 border-bottom d-flex gap-3">
                  <div className="rounded-circle bg-light" style={{ width: '40px', height: '40px' }}></div>
                  <div className="flex-fill">
                    <div className="placeholder-glow mb-2">
                      <span className="placeholder col-7 rounded"></span>
                    </div>
                    <div className="placeholder-glow mb-2">
                      <span className="placeholder col-10 rounded"></span>
                    </div>
                    <div className="placeholder-glow">
                      <span className="placeholder col-4 rounded"></span>
                    </div>
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <h1 className="mb-3">🎉</h1>
                <h6 className="fw-bold text-dark">You're all caught up!</h6>
                <p className="small mb-0">No new notifications right now.</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <div
                  key={n.notificationId}
                  className={`p-3 border-bottom d-flex gap-3 ${!n.readStatus ? 'bg-primary bg-opacity-10' : 'bg-white'} custom-hover-bg`}
                  style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                  onClick={() => {
                    if (!n.readStatus) markRead(n.notificationId);
                    setIsOpen(false);
                    if (n.relatedEntityType === 'COMPLAINT') {
                      navigate(isOfficer ? '/officer' : '/complaints');
                    } else if (n.relatedEntityType === 'CERTIFICATE') {
                      navigate(isOfficer ? '/services/officer/dashboard' : '/services/tracker');
                    }
                  }}
                >
                  <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm flex-shrink-0" style={{ width: '42px', height: '42px', fontSize: '20px' }}>
                    {getNotifIcon(n.eventType)}
                  </div>
                  <div className="flex-grow-1 min-vw-0">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className={`mb-0 fw-bold text-truncate ${!n.readStatus ? 'text-primary' : 'text-dark'}`} style={{ fontSize: '14px', maxWidth: '200px' }}>
                        {n.title || n.eventType}
                      </h6>
                      <small className="text-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    <p className="mb-0 text-muted small lh-sm" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {n.message}
                    </p>
                  </div>
                  {!n.readStatus && (
                    <div className="align-self-center ms-2">
                      <div className="rounded-circle bg-primary" style={{ width: '8px', height: '8px' }}></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-light border-top text-center">
            <button 
              className="btn btn-link text-decoration-none fw-bold w-100 py-1"
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
