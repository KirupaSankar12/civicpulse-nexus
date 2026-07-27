import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import { toast } from 'sonner';
import {
  ClipboardList, Plus, Search, Filter, Eye,
  AlertTriangle, CheckCircle2, Clock, Inbox,
  Building2, ChevronUp, ChevronDown, ChevronsUpDown,
  X, RefreshCw,
} from 'lucide-react';

// ── colour maps ───────────────────────────────────────────────────────────────
const PRIORITY_MAP = {
  HIGH:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', dot: '#ef4444', label: 'High' },
  MEDIUM: { bg: '#fff7ed', text: '#d97706', border: '#fed7aa', dot: '#f59e0b', label: 'Medium' },
  LOW:    { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', dot: '#22c55e', label: 'Low' },
};

const STATUS_MAP = {
  NEW:        { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', icon: '🔵' },
  ASSIGNED:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', icon: '🟠' },
  IN_PROGRESS:{ bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', icon: '🟢' },
  RESOLVED:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', icon: '✅' },
  CLOSED:     { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', icon: '⚫' },
  REJECTED:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: '❌' },
};

const SLA_MAP = {
  ON_TIME: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  OVERDUE: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  NEAR_DEADLINE: { bg: '#fff7ed', text: '#d97706', border: '#fed7aa' },
};

const DEPT_COLORS = [
  '#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#f97316','#6366f1',
];
function deptColor(dept = '') {
  let h = 0;
  for (let i = 0; i < dept.length; i++) h = (h * 31 + dept.charCodeAt(i)) & 0xffff;
  return DEPT_COLORS[h % DEPT_COLORS.length];
}

function PriorityBadge({ priority }) {
  const m = PRIORITY_MAP[priority] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', dot: '#94a3b8', label: priority };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      background: m.bg, color: m.text,
      border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, display: 'inline-block' }} />
      {m.label || priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_MAP[status] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', icon: '○' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      background: m.bg, color: m.text,
      border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 700,
    }}>
      {status || '—'}
    </span>
  );
}

function SlaBadge({ sla }) {
  if (!sla) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>;
  const m = SLA_MAP[sla] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 20,
      background: m.bg, color: m.text,
      border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 700,
    }}>
      {sla === 'OVERDUE' ? '⚠ ' : sla === 'ON_TIME' ? '✓ ' : '⏱ '}
      {sla.replace('_', ' ')}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 22px',
      border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 160px',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: color, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

const ALL = 'ALL';

export default function ComplaintList() {
  const [complaints, setComplaints]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [priorityFilter, setPriorityFilter] = useState(ALL);
  const [sortKey, setSortKey]         = useState('createdAt');
  const [sortDir, setSortDir]         = useState('desc');

  const roles     = keycloak.tokenParsed?.realm_access?.roles || [];
  const isCitizen = roles.includes('CITIZEN') || roles.includes('citizen');
  const citizenId = keycloak.tokenParsed?.sub;

  const load = () => {
    setLoading(true);
    api.get('/grievance-service/api/complaints')
      .then(r => {
        let data = r.data;
        if (isCitizen) data = data.filter(c => c.citizenId === citizenId);
        setComplaints(data);
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load complaints.'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  // ── Sort handler ─────────────────────────────────────────────────────────
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── Derived / filtered list ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...complaints];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.assignedOfficer?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== ALL)   list = list.filter(c => c.status === statusFilter);
    if (priorityFilter !== ALL) list = list.filter(c => c.priority === priorityFilter);

    list.sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
      if (sortKey === 'createdAt') { av = new Date(av); bv = new Date(bv); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [complaints, search, statusFilter, priorityFilter, sortKey, sortDir]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total    = complaints.length;
  const newCount = complaints.filter(c => c.status === 'NEW').length;
  const overdueC = complaints.filter(c => c.slaStatus === 'OVERDUE').length;
  const resolved = complaints.filter(c => ['RESOLVED','CLOSED'].includes(c.status)).length;

  // ── Unique filter options ─────────────────────────────────────────────────
  const statuses   = [...new Set(complaints.map(c => c.status).filter(Boolean))];
  const priorities = [...new Set(complaints.map(c => c.priority).filter(Boolean))];

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronsUpDown size={12} style={{ opacity: 0.35, flexShrink: 0 }} />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ color: '#3b82f6', flexShrink: 0 }} />
      : <ChevronDown size={12} style={{ color: '#3b82f6', flexShrink: 0 }} />;
  };

  const thStyle = (col) => ({
    padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
    cursor: 'pointer', userSelect: 'none', background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  });

  return (
    <AppShell title={isCitizen ? 'My Complaints' : 'All Complaints'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 40 }}>

        {/* ── Page Header (Overview-style Banner) ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #334155)',
          borderRadius: 16, padding: '24px 32px', color: '#fff',
          display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 10px 25px rgba(15,23,42,0.3)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: '#fff', opacity: 0.03, borderRadius: '50%', filter: 'blur(30px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              background: 'rgba(255,255,255,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)',
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block', marginBottom: 10
            }}>
              GRIEVANCE REDRESSAL
            </span>
            <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {isCitizen ? 'My Complaints' : 'Global Complaints Directory'}
            </h2>
            <p style={{ margin: 0, color: '#cbd5e1', maxWidth: 540, fontSize: 14, lineHeight: 1.5 }}>
              {isCitizen ? 'Track real-time status of your filed grievances, officer SLA deadlines, and resolution logs.' : `Real-time registry of ${total} total complaints across all municipal departments.`}
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={load} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)',
              fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer'
            }}>
              <RefreshCw size={14} /> Refresh
            </button>
            {isCitizen && (
              <Link to="/complaints/new" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 22px',
                  borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <Plus size={16} /> Raise Complaint
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        {!isCitizen && (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <StatCard label="Total Complaints" value={total}    icon={ClipboardList} color="#6366f1" />
            <StatCard label="New / Unassigned" value={newCount} icon={Clock}         color="#3b82f6" sub={`${((newCount/total||0)*100).toFixed(0)}% of total`} />
            <StatCard label="SLA Overdue"       value={overdueC} icon={AlertTriangle} color="#ef4444" sub="Needs attention" />
            <StatCard label="Resolved / Closed" value={resolved} icon={CheckCircle2}  color="#22c55e" sub={`${((resolved/total||0)*100).toFixed(0)}% resolution rate`} />
          </div>
        )}

        {/* ── Main Card ────────────────────────────────────────────────────── */}
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(15,23,42,0.07)',
          overflow: 'hidden',
        }}>
          {/* ── Toolbar ── */}
          <div style={{
            padding: '14px 18px', borderBottom: '2px solid #f1f5f9',
            display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
            background: '#fafbfc',
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                placeholder="Search by title, department, officer…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px 8px 32px',
                  border: '1.5px solid #e2e8f0', borderRadius: 9,
                  fontSize: 13, color: '#1e293b', background: '#fff',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9,
                fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <option value={ALL}>All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              style={{
                padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9,
                fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <option value={ALL}>All Priorities</option>
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              {filtered.length} of {total} shown
            </div>
          </div>

          {/* ── Table ── */}
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', margin: '0 auto 12px',
                border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ color: '#64748b', fontSize: 14 }}>Loading complaints…</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 6 }}>No complaints found</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                {search || statusFilter !== ALL || priorityFilter !== ALL
                  ? 'Try adjusting your filters'
                  : isCitizen ? 'You haven\'t filed any complaints yet.' : 'No complaints in the system.'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle('idx'), width: 48, cursor: 'default' }}>#</th>
                    <th style={thStyle('title')} onClick={() => toggleSort('title')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Title <SortIcon col="title" />
                      </span>
                    </th>
                    <th style={thStyle('department')} onClick={() => toggleSort('department')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Department <SortIcon col="department" />
                      </span>
                    </th>
                    <th style={thStyle('priority')} onClick={() => toggleSort('priority')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Priority <SortIcon col="priority" />
                      </span>
                    </th>
                    <th style={thStyle('status')} onClick={() => toggleSort('status')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Status <SortIcon col="status" />
                      </span>
                    </th>
                    <th style={thStyle('slaStatus')}>SLA</th>
                    <th style={thStyle('assignedOfficer')}>Officer</th>
                    <th style={thStyle('createdAt')} onClick={() => toggleSort('createdAt')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Filed On <SortIcon col="createdAt" />
                      </span>
                    </th>
                    <th style={{ ...thStyle('action'), cursor: 'default', width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const dc = deptColor(c.department);
                    const isOverdue = c.slaStatus === 'OVERDUE';
                    return (
                      <tr
                        key={c.complaintId}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* # */}
                        <td style={{ padding: '13px 14px', color: '#94a3b8', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                          {i + 1}
                        </td>

                        {/* Title */}
                        <td style={{ padding: '13px 14px', maxWidth: 240 }}>
                          <Link
                            to={`/complaints/${c.complaintId}`}
                            style={{ fontWeight: 700, color: '#1e293b', textDecoration: 'none', fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {c.title || 'Untitled'}
                          </Link>
                          <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
                            #{c.complaintId?.toString().slice(-6) || '—'}
                          </span>
                        </td>

                        {/* Department */}
                        <td style={{ padding: '13px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 10px', borderRadius: 20,
                            background: dc + '15', color: dc,
                            border: `1px solid ${dc}33`,
                            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                          }}>
                            <Building2 size={10} />
                            {c.department || '—'}
                          </span>
                        </td>

                        {/* Priority */}
                        <td style={{ padding: '13px 14px' }}>
                          <PriorityBadge priority={c.priority} />
                        </td>

                        {/* Status */}
                        <td style={{ padding: '13px 14px' }}>
                          <StatusBadge status={c.status} />
                        </td>

                        {/* SLA */}
                        <td style={{ padding: '13px 14px' }}>
                          <SlaBadge sla={c.slaStatus} />
                        </td>

                        {/* Officer */}
                        <td style={{ padding: '13px 14px' }}>
                          {c.assignedOfficer ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{
                                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                background: `linear-gradient(135deg, ${deptColor(c.assignedOfficer)}, #6366f1)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: 10, fontWeight: 700,
                              }}>
                                {c.assignedOfficer[0].toUpperCase()}
                              </div>
                              <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{c.assignedOfficer}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>

                        {/* Filed On */}
                        <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                          </div>
                          {isOverdue && (
                            <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, marginTop: 1 }}>⚠ SLA Breached</div>
                          )}
                        </td>

                        {/* Action */}
                        <td style={{ padding: '13px 14px' }}>
                          <Link
                            to={`/complaints/${c.complaintId}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 12px', borderRadius: 8,
                              background: '#f1f5f9', color: '#1e293b',
                              fontSize: 12, fontWeight: 700, textDecoration: 'none',
                              border: '1px solid #e2e8f0',
                              transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                          >
                            <Eye size={13} /> View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Footer ── */}
          {!loading && filtered.length > 0 && (
            <div style={{
              padding: '12px 18px', borderTop: '1px solid #f1f5f9',
              background: '#fafbfc', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', fontSize: 12, color: '#94a3b8',
            }}>
              <span>Showing <strong style={{ color: '#374151' }}>{filtered.length}</strong> of <strong style={{ color: '#374151' }}>{total}</strong> complaints</span>
              <span>Last refreshed: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
