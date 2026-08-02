import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import api from '../api.js';
import { BookOpen, ChevronDown, ChevronUp, X } from 'lucide-react';

const EVENT_CATEGORY = {
  'complaint-status-changed': { color: '#f97316', bg: '#fff7ed', label: 'Complaint Status' },
  'complaint-escalated':      { color: '#ef4444', bg: '#fef2f2', label: 'Escalation' },
  'application-submitted':    { color: '#3b82f6', bg: '#eff6ff', label: 'Application' },
  'document-verified':        { color: '#8b5cf6', bg: '#f5f3ff', label: 'Document' },
  'certificate-approved':     { color: '#10b981', bg: '#f0fdf4', label: 'Certificate' },
  'certificate-generated':    { color: '#059669', bg: '#ecfdf5', label: 'Certificate' },
  'beneficiary-applied':      { color: '#06b6d4', bg: '#ecfeff', label: 'Welfare' },
  'beneficiary-approved':     { color: '#16a34a', bg: '#f0fdf4', label: 'Welfare' },
  'beneficiary-rejected':     { color: '#dc2626', bg: '#fef2f2', label: 'Welfare' },
  'funds-disbursed':          { color: '#7c3aed', bg: '#f5f3ff', label: 'Finance' },
  'budget-threshold-alert':   { color: '#b45309', bg: '#fffbeb', label: 'Budget Alert' },
};

function EventBadge({ eventType }) {
  const cat = EVENT_CATEGORY[eventType] || { color: '#64748b', bg: '#f8fafc', label: eventType };
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700,
      background: cat.bg, color: cat.color, whiteSpace: 'nowrap',
    }}>
      {cat.label}
    </span>
  );
}

function JsonDialog({ payload, onClose }) {
  let formatted = payload;
  try { formatted = JSON.stringify(JSON.parse(payload), null, 2); } catch {}
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(4px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div style={{ background: '#1e293b', borderRadius: 14, maxWidth: 720, width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #334155' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Raw Event Payload</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
        <pre style={{
          flex: 1, overflowY: 'auto', padding: '16px 20px', margin: 0,
          fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
          fontSize: 12, lineHeight: 1.7, color: '#7dd3fc', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {formatted}
        </pre>
      </div>
    </div>
  );
}

const EVENT_TYPES = [
  'complaint-status-changed','complaint-escalated','application-submitted',
  'document-verified','certificate-approved','certificate-generated',
  'beneficiary-applied','beneficiary-approved','beneficiary-rejected',
  'funds-disbursed','budget-threshold-alert',
];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [filterEventType, setFilterEventType] = useState('');
  const PAGE_SIZE = 20;

  const load = (p = 0) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, size: PAGE_SIZE });
    if (filterEventType) params.set('eventType', filterEventType);
    api.get(`/api/reports/audit-logs?${params}`)
      .then(r => {
        setLogs(r.data.content || []);
        setTotal(r.data.totalElements || 0);
        setPage(p);
      })
      .catch(e => setError(e.response?.data?.message || 'Failed to load audit logs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); }, [filterEventType]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppShell title="Audit Logs">
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 0 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Audit Logs</h2>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
              Immutable event trail — {total.toLocaleString()} total events
            </p>
          </div>
          {/* Event type filter */}
          <select
            value={filterEventType}
            onChange={e => setFilterEventType(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
              fontSize: 13, background: '#fff', color: '#374151', cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">All Event Types</option>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Timestamp', 'Event Type', 'Entity ID', 'Category', 'Payload'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    Loading audit logs…
                  </td>
                </tr>
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                    <BookOpen size={32} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
                    <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500, margin: 0 }}>No audit logs yet</p>
                    <p style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>Events appear here once services start publishing Kafka messages</p>
                  </td>
                </tr>
              )}
              {logs.map(log => (
                <tr key={log.auditId} style={{ borderTop: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#475569', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                    {log.receivedAt ? new Date(log.receivedAt).toLocaleString() : '—'}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: 11, color: '#374151', fontWeight: 600, fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>
                      {log.eventType}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: '#475569', fontFamily: 'monospace', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.entityId || '—'}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <EventBadge eventType={log.eventType} />
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <button
                      onClick={() => setSelectedPayload(log.payload)}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
                        background: '#f8fafc', fontSize: 11, fontWeight: 600, color: '#4f46e5',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background='#eef2ff'; e.currentTarget.style.borderColor='#a5b4fc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0'; }}
                    >
                      View JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button
              disabled={page === 0}
              onClick={() => load(page - 1)}
              style={{
                padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: page === 0 ? '#f1f5f9' : '#fff', color: page === 0 ? '#94a3b8' : '#374151',
                cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
              }}
            >
              ← Prev
            </button>
            <span style={{ padding: '6px 16px', fontSize: 13, color: '#64748b' }}>
              Page {page + 1} of {totalPages} · {total} events
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => load(page + 1)}
              style={{
                padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: page >= totalPages - 1 ? '#f1f5f9' : '#fff',
                color: page >= totalPages - 1 ? '#94a3b8' : '#374151',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {selectedPayload && (
        <JsonDialog payload={selectedPayload} onClose={() => setSelectedPayload(null)} />
      )}
    </AppShell>
  );
}
