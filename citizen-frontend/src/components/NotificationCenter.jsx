import { useEffect, useState, useRef } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';

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

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="notif-btn" onClick={() => setIsOpen(!isOpen)} title="Notifications">
        🔔
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h4>🔔 Notifications</h4>
            {unread > 0 && <span className="badge badge-red">{unread} new</span>}
          </div>
          {notifications.length === 0 ? (
            <div className="notif-item" style={{ cursor: 'default', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
              No notifications yet.
            </div>
          ) : (
            notifications.slice(0, 15).map(n => (
              <div
                key={n.notificationId}
                className={`notif-item${!n.readStatus ? ' unread' : ''}`}
                onClick={() => !n.readStatus && markRead(n.notificationId)}
              >
                <div className="notif-type">{n.eventType}</div>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{new Date(n.createdAt).toLocaleString('en-IN')}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
