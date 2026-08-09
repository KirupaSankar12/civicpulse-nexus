import { useEffect, useState, useRef } from 'react';
import AppShell from '../components/AppShell.jsx';
import api from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { ReportPageHeader, KpiCard, SectionCard, GLOBAL_STYLES } from '../components/ReportShared.jsx';
import {
  Users, AlertTriangle, Award, Wallet, TrendingUp,
  Activity, RefreshCw, BarChart2, CheckCircle2, Clock,
  Brain, Sparkles, Send, X, ChevronDown, ChevronUp,
  MessageSquare, Zap, AlertCircle, Lightbulb, Shield, Landmark
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';

const DEPT_COLORS = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#06b6d4','#f97316'
];

const EXAMPLE_QUESTIONS = [
  'Which department needs attention?',
  'Summarize today\'s governance performance.',
  'Why is the resolution rate low?',
  'Analyze welfare budget utilization.',
  'How can SLA performance be improved?',
];

// ─── Status color helpers ─────────────────────────────────────────────────────
function statusColor(status) {
  switch (status) {
    case 'HIGH_PERFORMANCE': return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    case 'GOOD':             return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' };
    case 'NEEDS_ATTENTION':  return { bg: '#fef9c3', text: '#a16207', border: '#fde047' };
    case 'CRITICAL':         return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
    default:                 return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };
  }
}

function statusLabel(status) {
  switch (status) {
    case 'HIGH_PERFORMANCE': return '✅ High Performance';
    case 'GOOD':             return '🔵 Good';
    case 'NEEDS_ATTENTION':  return '⚠️ Needs Attention';
    case 'CRITICAL':         return '🔴 Critical';
    default:                 return status || '—';
  }
}

// ─── PerformanceBar ───────────────────────────────────────────────────────────
function PerformanceBar({ dept, rate, isDark }) {
  const pct = Math.min(100, Math.max(0, rate));
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151' }}>{dept}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 8, background: isDark ? '#334155' : '#e2e8f0', borderRadius: 9999 }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 9999,
          background: color, transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}

// ─── AI Chat Drawer ───────────────────────────────────────────────────────────
function AiChatDrawer({ open, onClose, isDark }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendQuestion = async (question) => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const r = await api.post('/api/ai/governance/chat', { question: q });
      const d = r.data;
      let responseText = d.summary || '';
      if (d.insights?.length) responseText += '\n\n**Key points:**\n' + d.insights.map(i => `• ${i}`).join('\n');
      if (d.recommendations?.length) responseText += '\n\n**Recommendations:**\n' + d.recommendations.map(r => `→ ${r}`).join('\n');
      setMessages(prev => [...prev, {
        role: 'ai',
        text: responseText,
        status: d.overallStatus,
        unavailable: d.aiUnavailable,
        error: d.errorMessage,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'AI insights temporarily unavailable. Please try again shortly.',
        unavailable: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const bg   = isDark ? '#1e293b' : '#fff';
  const subBg = isDark ? '#0f172a' : '#f8fafc';
  const border = isDark ? '#334155' : '#e2e8f0';
  const textMain = isDark ? '#f1f5f9' : '#0f172a';
  const textSub  = isDark ? '#94a3b8' : '#64748b';

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            zIndex: 999, backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 440,
        background: bg, borderLeft: `1px solid ${border}`,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
        zIndex: 1000, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px', borderBottom: `1px solid ${border}`,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>CivicPulse AI</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Governance Intelligence</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ padding: '20px 0' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textSub, marginBottom: 12 }}>
                Try asking:
              </div>
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendQuestion(q)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    borderRadius: 10, border: `1px solid ${border}`,
                    background: subBg, color: '#6366f1', fontSize: 13,
                    fontWeight: 500, cursor: 'pointer', marginBottom: 8,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = isDark ? '#1e293b' : '#f0f0ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = subBg; }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {msg.role === 'user' ? (
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: '14px 14px 4px 14px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontSize: 13, fontWeight: 500, lineHeight: 1.5,
                }}>
                  {msg.text}
                </div>
              ) : (
                <div style={{
                  maxWidth: '95%', padding: '12px 14px', borderRadius: '14px 14px 14px 4px',
                  background: msg.unavailable ? (isDark ? '#291400' : '#fff7ed') : subBg,
                  border: `1px solid ${msg.unavailable ? '#f97316' : border}`,
                  fontSize: 13, color: textMain, lineHeight: 1.6,
                }}>
                  {msg.unavailable ? (
                    <span style={{ color: '#f97316' }}>⚠️ {msg.text}</span>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 12,
              background: subBg, border: `1px solid ${border}`,
              width: 'fit-content', fontSize: 13, color: '#8b5cf6',
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              AI is analyzing…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}` }}>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              style={{
                fontSize: 11, color: textSub, background: 'none', border: 'none',
                cursor: 'pointer', marginBottom: 8, padding: 0, fontWeight: 500,
              }}
            >
              Clear conversation
            </button>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendQuestion(input)}
              placeholder="Ask about governance…"
              disabled={loading}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${border}`, background: subBg,
                color: textMain, fontSize: 13, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => sendQuestion(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: 10, border: 'none',
                background: loading || !input.trim() ? (isDark ? '#334155' : '#e2e8f0') : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: loading || !input.trim() ? (isDark ? '#64748b' : '#94a3b8') : '#fff',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: textSub, textAlign: 'center' }}>
            AI answers using only live CivicPulse data
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </>
  );
}

// ─── AI Intelligence Card ─────────────────────────────────────────────────────
function AiIntelligenceCard({ isDark }) {
  const [aiData, setAiData]         = useState(null);
  const [analyzing, setAnalyzing]   = useState(false);
  const [chatOpen, setChatOpen]     = useState(false);
  const [expanded, setExpanded]     = useState(true);
  const [aiError, setAiError]       = useState(null);

  const bg     = isDark ? '#1e293b' : '#fff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const textMain = isDark ? '#f1f5f9' : '#0f172a';
  const textSub  = isDark ? '#94a3b8' : '#64748b';
  const subBg    = isDark ? '#0f172a' : '#f8fafc';

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAiError(null);
    try {
      const r = await api.post('/api/ai/governance/analyze');
      setAiData(r.data);
      if (r.data.aiUnavailable) setAiError(r.data.errorMessage);
    } catch (e) {
      setAiError('AI insights temporarily unavailable. Dashboard data remains available.');
      setAiData(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const sc = aiData && !aiData.aiUnavailable ? statusColor(aiData.overallStatus) : null;

  return (
    <>
      <AiChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} isDark={isDark} />

      <div style={{
        background: bg, borderRadius: 16, border: `1px solid ${border}`,
        boxShadow: '0 4px 24px rgba(99,102,241,0.08)',
        overflow: 'hidden', marginBottom: 24, position: 'relative',
      }}>
        {/* Gradient top accent */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)',
        }} />

        {/* Card header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: expanded ? `1px solid ${border}` : 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* AI icon with pulse */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={20} color="#fff" />
              </div>
              <div style={{
                position: 'absolute', top: -2, right: -2,
                width: 10, height: 10, borderRadius: '50%',
                background: aiData && !aiData.aiUnavailable ? '#10b981' : '#94a3b8',
                border: `2px solid ${bg}`,
              }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: textMain, letterSpacing: '-0.01em' }}>
                CivicPulse AI Intelligence
              </div>
              <div style={{ fontSize: 12, color: textSub, marginTop: 1 }}>
                {aiData && !aiData.aiUnavailable
                  ? `Analysis generated · ${new Date(aiData.dataTimestamp).toLocaleTimeString()}`
                  : 'Powered by Google Gemini · Uses live governance data only'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Status badge */}
            {aiData && !aiData.aiUnavailable && sc && (
              <span style={{
                padding: '4px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 700,
                background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
              }}>
                {statusLabel(aiData.overallStatus)}
              </span>
            )}

            {/* Generate button */}
            <button
              id="btn-generate-ai-analysis"
              onClick={runAnalysis}
              disabled={analyzing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 9, border: 'none',
                background: analyzing ? (isDark ? '#334155' : '#e2e8f0')
                  : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: analyzing ? textSub : '#fff',
                fontWeight: 600, fontSize: 12, cursor: analyzing ? 'not-allowed' : 'pointer',
                boxShadow: analyzing ? 'none' : '0 4px 12px rgba(99,102,241,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {analyzing
                ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing…</>
                : <><Sparkles size={13} /> Generate AI Analysis</>}
            </button>

            {/* Chat button */}
            <button
              id="btn-ask-civicpulse-ai"
              onClick={() => setChatOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 9,
                border: `1px solid ${isDark ? '#6366f1' : '#6366f1'}`,
                background: 'transparent', color: '#6366f1',
                fontWeight: 600, fontSize: 12, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.1)' : '#eef2ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <MessageSquare size={13} /> Ask CivicPulse AI
            </button>

            {/* Collapse toggle */}
            {aiData && (
              <button
                onClick={() => setExpanded(x => !x)}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: `1px solid ${border}`,
                  background: 'transparent', color: textSub, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Error / unavailable state */}
        {aiError && (
          <div style={{
            margin: 16, padding: '12px 16px', borderRadius: 10,
            background: isDark ? '#1c1917' : '#fff7ed',
            border: '1px solid #f97316', fontSize: 13, color: '#ea580c',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{aiError}</span>
          </div>
        )}

        {/* Empty state — before first analysis */}
        {!aiData && !analyzing && !aiError && (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: isDark ? '#1e293b' : '#f5f3ff',
              border: `1px dashed ${isDark ? '#6366f1' : '#a5b4fc'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={24} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: textMain, marginBottom: 6 }}>
              AI Governance Analysis Ready
            </div>
            <div style={{ fontSize: 13, color: textSub, maxWidth: 420, margin: '0 auto' }}>
              Click <strong>Generate AI Analysis</strong> to get an executive summary, department insights,
              and recommendations based on your live CivicPulse data.
            </div>
          </div>
        )}

        {/* Loading shimmer */}
        {analyzing && (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: 16, borderRadius: 8,
                background: isDark ? '#334155' : '#f1f5f9',
                width: ['100%','85%','92%','70%'][i-1],
                animation: 'shimmer 1.4s infinite',
              }} />
            ))}
          </div>
        )}

        {/* AI results — expanded */}
        {aiData && !aiData.aiUnavailable && expanded && (
          <div style={{ padding: '16px 20px 20px' }}>

            {/* Executive Summary */}
            <div style={{
              padding: '14px 16px', borderRadius: 12,
              background: isDark ? '#0f172a' : '#f8fafc',
              border: `1px solid ${border}`, marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Executive Summary
              </div>
              <p style={{ fontSize: 13, color: textMain, lineHeight: 1.65, margin: 0 }}>
                {aiData.summary}
              </p>
            </div>

            {/* Insights + Warnings side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Insights */}
              {aiData.insights?.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Lightbulb size={14} color="#f59e0b" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Key Insights
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {aiData.insights.map((ins, i) => (
                      <div key={i} style={{
                        padding: '9px 12px', borderRadius: 9,
                        background: isDark ? '#0f172a' : '#fffbeb',
                        border: `1px solid ${isDark ? '#78350f' : '#fde68a'}`,
                        fontSize: 12, color: isDark ? '#fcd34d' : '#92400e',
                        lineHeight: 1.5,
                      }}>
                        💡 {ins}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {aiData.warnings?.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <AlertTriangle size={14} color="#ef4444" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Warnings
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {aiData.warnings.map((w, i) => (
                      <div key={i} style={{
                        padding: '9px 12px', borderRadius: 9,
                        background: isDark ? '#1c0a0a' : '#fff1f2',
                        border: `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}`,
                        fontSize: 12, color: isDark ? '#fca5a5' : '#dc2626',
                        lineHeight: 1.5,
                      }}>
                        ⚠️ {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {aiData.recommendations?.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Shield size={14} color="#10b981" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: textSub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Recommendations
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8 }}>
                  {aiData.recommendations.map((rec, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', borderRadius: 10,
                      background: isDark ? '#0f172a' : '#f0fdf4',
                      border: `1px solid ${isDark ? '#14532d' : '#86efac'}`,
                      fontSize: 12, color: isDark ? '#86efac' : '#15803d',
                      lineHeight: 1.5,
                    }}>
                      → {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main GovernanceDashboard ─────────────────────────────────────────────────
export default function GovernanceDashboard() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = () => {
    setLoading(true);
    setError(null);
    api.get('/api/reports/governance/summary')
      .then(r => { setData(r.data); setLastRefresh(new Date()); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load governance data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deptData = data?.departmentPerformance
    ? Object.values(data.departmentPerformance).map(d => ({
        name: d.department?.replace(' Department','').replace(' Dept','') || 'Unknown',
        rate: Math.round(d.resolutionRate * 10) / 10,
        total: d.totalHandled,
      }))
    : [];

  const bg     = isDark ? '#0f172a' : '#f8fafc';
  const card   = isDark ? '#1e293b' : '#fff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const textMain = isDark ? '#f1f5f9' : '#0f172a';
  const textSub  = isDark ? '#94a3b8' : '#64748b';

  return (
    <AppShell title="Governance Analytics Dashboard">
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '12px 0 40px' }}>
        {/* Header */}
        <ReportPageHeader
          title="Governance Analytics"
          subtitle={`Cross-service aggregated view of civic performance and live AI intelligence`}
          icon={BarChart2}
          iconBg="linear-gradient(135deg, #0f172a, #334155)"
          iconColor="#38bdf8"
          isDark={isDark}
          lastRefresh={lastRefresh}
          onRefresh={load}
          refreshing={loading}
        />

        {/* Unavailability banners */}
        {data && (data.grievanceDataUnavailable || data.welfareDataUnavailable || data.certificateDataUnavailable) && (
          <div style={{
            padding: '10px 16px', borderRadius: 10, background: isDark ? '#1c1400' : '#fef9c3',
            border: '1px solid #fde047', marginBottom: 20, fontSize: 13,
            color: isDark ? '#fde047' : '#713f12',
            display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600,
          }}>
            ⚠️ Some services are temporarily unreachable. Showing partial data.
            {data.grievanceDataUnavailable && ' [Grievance Service]'}
            {data.certificateDataUnavailable && ' [Certificate Service]'}
            {data.welfareDataUnavailable && ' [Welfare Service]'}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: isDark ? '#1c0000' : '#fef2f2',
            border: '1px solid #fecaca', marginBottom: 20, fontSize: 13, color: '#dc2626', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {/* Stat cards */}
        {loading && !data ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{
                height: 100, borderRadius: 16,
                background: isDark
                  ? 'linear-gradient(90deg,#1e293b 0%,#334155 50%,#1e293b 100%)'
                  : 'linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 50%,#f1f5f9 100%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
              }} />
            ))}
          </div>
        ) : data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
            <KpiCard icon={Users} label="Total Citizens" value={data.totalCitizens?.toLocaleString() || '—'} color="#3b82f6" bg="#eff6ff" isDark={isDark} />
            <KpiCard icon={AlertTriangle} label="Total Requests" value={data.totalRequests?.toLocaleString() || '—'} color="#f97316" bg="#fff7ed" isDark={isDark} />
            <KpiCard icon={CheckCircle2} label="Resolution Rate" value={`${(data.overallResolutionRate || 0).toFixed(1)}%`} subtitle="Across all services" color="#10b981" bg="#f0fdf4" isDark={isDark} />
            <KpiCard icon={Wallet} label="Revenue Collected" value={`₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`} color="#8b5cf6" bg="#f5f3ff" isDark={isDark} />
            <KpiCard icon={Activity} label="Satisfaction Score" value={data.citizenSatisfactionScore > 0 ? `${data.citizenSatisfactionScore.toFixed(1)} / 5 ★` : 'No data'} subtitle="Based on feedback" color="#ec4899" bg="#fdf2f8" isDark={isDark} />
          </div>
        )}

        {/* ── AI INTELLIGENCE CARD (always shown) ────────────────────────── */}
        <AiIntelligenceCard isDark={isDark} />

        {/* Charts row */}
        {data && deptData.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            {/* Department resolution rate bar chart */}
            <SectionCard title="Resolution Rates by Department" subtitle="Comparative resolution percentages across municipal sectors" icon={BarChart2} isDark={isDark}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: textSub }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: textSub }} domain={[0, 100]} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Resolution Rate']}
                    contentStyle={{ background: card, border: `1px solid ${border}`, borderRadius: 10, color: textMain }}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            {/* Performance progress bars */}
            <SectionCard title="Department Performance Progress" subtitle="Live completion status and target resolution rate" icon={TrendingUp} isDark={isDark}>
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {deptData.map((d, i) => (
                  <PerformanceBar key={i} dept={d.name} rate={d.rate} isDark={isDark} />
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* Summary table */}
        {data && deptData.length > 0 && (
          <SectionCard title="Department Summary Table" subtitle="Detailed breakdown of workload, turnaround times, and resolution rates" icon={Award} isDark={isDark}>
            <div style={{ overflowX: 'auto', margin: '-20px -22px', marginTop: '-20px', marginBottom: '-20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: isDark ? '#0f172a' : '#f8fafc', borderBottom: `1px solid ${border}` }}>
                    {['Department','Total Cases','Resolution Rate','Avg Turnaround'].map(h => (
                      <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.departmentPerformance).map(([key, d]) => (
                    <tr key={key} style={{ borderBottom: `1px solid ${border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? '#0f172a' : '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700, color: textMain }}>{d.department}</td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: textMain, fontWeight: 600 }}>{d.totalHandled?.toLocaleString()}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                          background: d.resolutionRate >= 75 ? (isDark ? '#064e3b' : '#dcfce7') : d.resolutionRate >= 50 ? (isDark ? '#78350f' : '#fef9c3') : (isDark ? '#7f1d1d' : '#fee2e2'),
                          color: d.resolutionRate >= 75 ? (isDark ? '#6ee7b7' : '#15803d') : d.resolutionRate >= 50 ? (isDark ? '#fde047' : '#a16207') : (isDark ? '#fca5a5' : '#dc2626'),
                        }}>
                          {d.resolutionRate?.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: textSub, fontWeight: 600 }}>
                        {d.avgTurnaroundHours > 0 ? `${d.avgTurnaroundHours}h` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {data && !deptData.length && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <BarChart2 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 500 }}>No department data available yet</p>
            <p style={{ fontSize: 13 }}>Data populates as complaints and applications are processed</p>
          </div>
        )}
      </div>

      <style>{`
        ${GLOBAL_STYLES}
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </AppShell>
  );
}
