import { useEffect, useState, useRef } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';

function getNotifIcon(eventType) {
  const type = (eventType || '').toUpperCase();
  if (type.includes('COMPLAINT') || type.includes('GRIEVANCE')) return '📋';
  if (type.includes('ASSIGN')) return '👮';
  if (type.includes('RESOLV') || type.includes('APPROV')) return '✅';
  if (type.includes('REJECT')) return '✕';
  if (type.includes('CERTIFICATE') || type.includes('SERVICE')) return '📜';
  if (type.includes('SLA') || type.includes('ESCALAT')) return '⏰';
  if (type.includes('REGISTER') || type.includes('CITIZEN')) return '👤';
  return '🔔';
}

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer');
  const recipient = isOfficer
    ? keycloak.tokenParsed?.preferred_username
    : keycloak.tokenParsed?.sub;

  useEffect(() => {
    if (!recipient) return;
    const fetch = () => {
      api.get(`/notification-service/api/notifications/recipient/${recipient}`)
        .then(r => setNotifications(r.data))
        .catch(() => {});
    };
    fetch();
    const t = setInterval(fetch, 10000);
    return () => clearInterval(t);
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
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="notif-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        aria-expanded={isOpen}
      >
        🔔
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown animate-slide-up">
          <div className="notif-header">
            <h4>Notifications</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unread > 0 && <span className="badge badge-red">{unread} new</span>}
              {unread > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={markAllRead} style={{ fontSize: '11px' }}>
                  Mark all read
                </button>
              )}
            </div>
          </div>
          {notifications.length === 0 ? (
            <div className="notif-empty">
              <span className="notif-empty-icon">🔔</span>
              <p style={{ fontSize: '13px' }}>No notifications yet.</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Updates about your complaints and applications will appear here.</p>
            </div>
          ) : (
            notifications.slice(0, 15).map(n => (
              <div
                key={n.notificationId}
                className={`notif-item${!n.readStatus ? ' unread' : ''}`}
                onClick={() => !n.readStatus && markRead(n.notificationId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && !n.readStatus && markRead(n.notificationId)}
              >
                <div className="notif-item-inner">
                  <div className="notif-icon" aria-hidden="true">{getNotifIcon(n.eventType)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="notif-type">{n.eventType}</div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                  </div>
                  {!n.readStatus && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--info)', flexShrink: 0, marginTop: '6px' }} aria-hidden="true" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
