import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { 
  Landmark, AlertTriangle, Info, ShieldAlert, BadgeCheck,
  Droplets, Route, Zap, Trash2, HeartPulse, FileText, FileSignature, Building2,
  PenSquare, Search, LogIn, Activity, ShieldCheck, Smartphone, CheckCircle, Bell,
  PhoneCall, BookOpen, HelpCircle, ArrowRight, CheckCircle2, Award, Sparkles, ChevronRight,
  Users, Clock, MessageSquare, Send, ThumbsUp, Heart, Flame, Share2,
  QrCode, ExternalLink, RefreshCw, Filter, Sparkle, Bot, Shield, CheckCheck, Play, Eye,
  X, MessageCircle, ChevronUp, ChevronDown, Check, CornerDownRight, Lock
} from 'lucide-react';

// ── Official Stories / Status Updates ──
const civicStories = [
  {
    id: 1,
    title: 'Monsoon Alert',
    tag: 'URGENT',
    department: 'Disaster Management',
    borderColor: '#ef4444',
    time: '15m ago',
    icon: AlertTriangle,
    headline: 'Monsoon Drainage Pre-Clearing Across 42 Wards',
    details: 'Heavy rainfall alert issued for next 48 hours. Emergency drainage pumping stations are now active 24x7. Helpline 112 is fully operational.'
  },
  {
    id: 2,
    title: 'Water 2.0',
    tag: 'UTILITY',
    department: 'Water Supply Board',
    borderColor: '#0284c7',
    time: '1h ago',
    icon: Droplets,
    headline: 'Smart Ultrasonic Water Meters Installed in Sector 7-12',
    details: 'Pipeline maintenance completed ahead of time. Digital flow monitors now provide real-time pressure updates to the central control grid.'
  },
  {
    id: 3,
    title: 'Digi-Cert',
    tag: 'E-SERVICE',
    department: 'Digital India / UIDAI',
    borderColor: '#10b981',
    time: '3h ago',
    icon: BadgeCheck,
    headline: 'Instant Residence & Income Certificates via DigiLocker',
    details: 'Paperless digital signature verification now delivers approved certificates directly to citizen mobile wallets within 24 hours.'
  },
  {
    id: 4,
    title: 'Kisan Welfare',
    tag: 'WELFARE',
    department: 'Agriculture Dept',
    borderColor: '#f59e0b',
    time: '5h ago',
    icon: Award,
    headline: 'PM-Kisan Direct Benefit Transfer Phase 12 Disbursed',
    details: 'Over 14,200 eligible state farmers received ₹2,000 direct bank transfer via Aadhaar-enabled payment bridge.'
  },
  {
    id: 5,
    title: 'AI Dispatch',
    tag: 'TECH',
    department: 'GovTech Innovations',
    borderColor: '#8b5cf6',
    time: 'Today',
    icon: Bot,
    headline: 'Autonomous Grievance Triaging & Officer Routing Live',
    details: 'AI model automatically categorizes citizen photo grievances with 99.2% accuracy and assigns field officers within 120 seconds.'
  }
];

// ── Quick Access Hero Action Cards ──
const heroQuickActions = [
  {
    icon: PenSquare,
    title: 'File Civic Grievance',
    desc: 'Report road damage, water leaks, or power outages with instant officer dispatch.',
    tag: '12h–24h SLA',
    tagColor: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))',
    borderColor: 'rgba(239,68,68,0.22)',
    to: '/login'
  },
  {
    icon: FileText,
    title: 'Apply e-Certificates',
    desc: 'Birth, Income, Residence & Caste certificates with digital cryptographic signature.',
    tag: '100% Paperless',
    tagColor: '#2563eb',
    bgGradient: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(37,99,235,0.02))',
    borderColor: 'rgba(37,99,235,0.22)',
    to: '/login'
  },
  {
    icon: Sparkles,
    title: 'State Welfare Schemes',
    desc: 'Check Aadhaar eligibility for Direct Benefit Transfer (DBT) and farmer pensions.',
    tag: 'Direct DBT',
    tagColor: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02))',
    borderColor: 'rgba(245,158,11,0.22)',
    to: '/login'
  },
  {
    icon: Search,
    title: 'Live SLA Ticket Tracker',
    desc: 'Real-time timeline tracking on the Apache Kafka Event Bus with escalation timers.',
    tag: 'Real-Time Sync',
    tagColor: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))',
    borderColor: 'rgba(16,185,129,0.22)',
    to: '#tracker'
  }
];

// ── Official Broadcast Notices ──
const initialNotices = [
  {
    id: 'n1',
    category: 'WATER SUPPLY',
    badgeColor: '#0284c7',
    badgeBg: 'rgba(2, 132, 199, 0.12)',
    title: 'Scheduled Water Supply Maintenance in Ward 7–12',
    desc: 'Pipeline rejuvenation work scheduled on 10th July between 06:00 AM – 02:00 PM. Clean water tankers are pre-stationed at public junctions.',
    date: 'Today at 09:30 AM',
    author: 'Municipal Water Board',
    icon: Droplets,
    likes: 342,
    hearts: 128,
    fires: 45,
    views: '4.8k'
  },
  {
    id: 'n2',
    category: 'ROADS & INFRA',
    badgeColor: '#d97706',
    badgeBg: 'rgba(217, 119, 6, 0.12)',
    title: 'NH-48 Elevated Corridor Smart Resurfacing',
    desc: 'Flyover maintenance underway. Heavy vehicles rerouted via Outer Ring Road. Live traffic updates broadcasted via CivicPulse GPS map.',
    date: 'Yesterday at 04:15 PM',
    author: 'Roads & Infrastructure Directorate',
    icon: Route,
    likes: 512,
    hearts: 94,
    fires: 73,
    views: '7.2k'
  },
  {
    id: 'n3',
    category: 'EMERGENCY ADVISORY',
    badgeColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    title: '24×7 Central Disaster Helpline 1800-11-2026 Active',
    desc: 'Dedicated round-the-clock emergency response teams on standby for monsoon waterlogging, fallen trees, and electrical line repairs.',
    date: '04 July 2026',
    author: 'Disaster Management Authority',
    icon: ShieldAlert,
    likes: 890,
    hearts: 412,
    fires: 201,
    views: '12.4k'
  },
  {
    id: 'n4',
    category: 'NEW E-SERVICE',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    title: 'Online Residence & Solvency Certificates Launched',
    desc: 'Zero-visit digital application now available with auto-verification of electricity bills and Aadhaar. Delivered with authentic QR code.',
    date: '01 July 2026',
    author: 'Revenue & e-Governance Cell',
    icon: BadgeCheck,
    likes: 620,
    hearts: 280,
    fires: 110,
    views: '9.1k'
  }
];

// ── Interactive Service Directory Catalog ──
const servicesCatalog = [
  { id: 'water', icon: Droplets, name: 'Water Supply & Quality', desc: 'Report leakages, low pressure, contamination, or book a free tanker.', dept: 'Water Department', sla: '24 Hrs SLA', category: 'Grievance', color: '#0284c7' },
  { id: 'roads', icon: Route, name: 'Roads, Potholes & Signals', desc: 'Instant photo upload for damaged roads, broken dividers, and signals.', dept: 'Roads Department', sla: '48 Hrs SLA', category: 'Grievance', color: '#d97706' },
  { id: 'electricity', icon: Zap, name: 'Electricity & Streetlights', desc: 'Resolve street light blackout, phase fluctuations, and dangling wires.', dept: 'Power Board', sla: '12 Hrs SLA', category: 'Grievance', color: '#8b5cf6' },
  { id: 'sanitation', icon: Trash2, name: 'Sanitation & Solid Waste', desc: 'Garbage pickup delays, overflow bins, and drain cleaning requests.', dept: 'Sanitation Dept', sla: '24 Hrs SLA', category: 'Grievance', color: '#10b981' },
  { id: 'health', icon: HeartPulse, name: 'Public Health & Fogging', desc: 'Dengue vector fogging, stray animal vaccination, and clinic queries.', dept: 'Health Department', sla: '36 Hrs SLA', category: 'Grievance', color: '#ef4444' },
  { id: 'birth', icon: FileText, name: 'Birth Certificate Issuance', desc: 'Apply with hospital discharge summary and download QR-signed e-certificate.', dept: 'Health & Vital Stats', sla: '3 Days SLA', category: 'Certificates', color: '#2563eb' },
  { id: 'death', icon: FileSignature, name: 'Death Certificate Registration', desc: 'Official digital death certificate registration with instant DigiLocker sync.', dept: 'Civil Registration', sla: '3 Days SLA', category: 'Certificates', color: '#64748b' },
  { id: 'trade', icon: Building2, name: 'Trade & Commercial License', desc: 'Apply or renew shop establishment licenses with digital payment gateway.', dept: 'Municipal Corporation', sla: '7 Days SLA', category: 'Permits', color: '#6366f1' },
  { id: 'income', icon: Award, name: 'Income & Caste Certificate', desc: 'Revenue department certificate generation for education and welfare quotas.', dept: 'Revenue Department', sla: '5 Days SLA', category: 'Certificates', color: '#059669' },
  { id: 'welfare', icon: Sparkles, name: 'State Welfare Schemes', desc: 'Apply for DBT pensions, student scholarships, and healthcare support.', dept: 'Social Welfare', sla: 'Direct DBT', category: 'Welfare', color: '#f59e0b' }
];

// ── Sample Live Grievance Tracking Simulator Data ──
const demoTrackingData = {
  'CP-2026-8941': {
    id: 'CP-2026-8941',
    type: 'Street Light Blackout',
    dept: 'Electricity Department',
    status: 'IN_PROGRESS',
    assignedOfficer: 'Er. Rajesh Varma (Lead Electrical Inspector)',
    steps: [
      { label: 'Grievance Filed & Logged on Kafka Bus', time: '08 Aug 11:20 AM', done: true },
      { label: 'Auto-Triaged & Assigned to Ward 9 Lead Officer', time: '08 Aug 11:22 AM', done: true },
      { label: 'Field Technician Dispatched with Utility Van', time: '08 Aug 01:45 PM', done: true },
      { label: 'Transformer Phase Inspection & Lamp Replacement', time: 'In Progress Now', active: true },
      { label: 'Citizen Resolution Verification & Close OTP', time: 'Estimated 04:30 PM', done: false }
    ]
  },
  'CERT-2026-3392': {
    id: 'CERT-2026-3392',
    type: 'Residence Certificate (e-Signed)',
    dept: 'Revenue & Land Records',
    status: 'APPROVED',
    assignedOfficer: 'Smt. Deepa Nair (Tahsildar)',
    steps: [
      { label: 'Application Submitted with Electricity Bill', time: '07 Aug 04:10 PM', done: true },
      { label: 'Aadhaar e-KYC Verified Instantly', time: '07 Aug 04:11 PM', done: true },
      { label: 'Village Administrative Officer (VAO) Endorsed', time: '08 Aug 10:00 AM', done: true },
      { label: 'Tahsildar Digital Cryptographic Signature Attached', time: '08 Aug 01:15 PM', done: true },
      { label: 'Certificate Issued & Synced to DigiLocker', time: '08 Aug 01:16 PM', done: true }
    ]
  }
};

export default function LandingPage() {
  const { theme: themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === 'dark';

  // State Management
  const [selectedStory, setSelectedStory] = useState(null);
  const [noticesList, setNoticesList] = useState(initialNotices);
  const [userReactions, setUserReactions] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [serviceSearch, setServiceSearch] = useState('');
  const [trackingIdInput, setTrackingIdInput] = useState('CP-2026-8941');
  const [activeTrackingResult, setActiveTrackingResult] = useState(demoTrackingData['CP-2026-8941']);
  
  // Floating AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! 🙏 Welcome to CivicPulse Nexus Smart Citizen Desk. How may I assist your governance request today?',
      time: 'Just now',
      chips: ['Track Complaint', 'Apply Certificate', 'Sanitation Issue', 'Welfare Schemes']
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [liveCitizens, setLiveCitizens] = useState(4280);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCitizens(prev => prev + (Math.random() > 0.4 ? 1 : -1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleReaction = (noticeId, type) => {
    const key = `${noticeId}-${type}`;
    const hasReacted = userReactions[key];

    setNoticesList(prev => prev.map(item => {
      if (item.id === noticeId) {
        return {
          ...item,
          [type]: hasReacted ? item[type] - 1 : item[type] + 1
        };
      }
      return item;
    }));

    setUserReactions(prev => ({
      ...prev,
      [key]: !hasReacted
    }));
  };

  const handleSendChat = (customText) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let botResponse = '';
      let actionButtons = null;

      const lower = textToSend.toLowerCase();
      if (lower.includes('track') || lower.includes('complaint') || lower.includes('status')) {
        botResponse = `🔍 Found active ticket #CP-2026-8941: Street Light Outage in Sector 9. Field technician is currently on-site. SLA deadline is within 4 hours.`;
        actionButtons = ['View Full Live Timeline', 'File Another Grievance'];
      } else if (lower.includes('cert') || lower.includes('birth') || lower.includes('income') || lower.includes('residence')) {
        botResponse = `📄 Certificates are issued 100% digitally with DigiLocker QR verification. No physical office visit needed.`;
        actionButtons = ['Apply Residence Certificate', 'Apply Birth Certificate', 'Check Required Documents'];
      } else if (lower.includes('welfare') || lower.includes('scheme') || lower.includes('kisan')) {
        botResponse = `🌾 Over 18 State & Central Welfare Schemes are active! Direct Benefit Transfers (DBT) are credited directly to your Aadhaar-linked bank account.`;
        actionButtons = ['Check Scheme Eligibility', 'View Pension Schemes'];
      } else if (lower.includes('sanitation') || lower.includes('water') || lower.includes('pothole') || lower.includes('road')) {
        botResponse = `🚨 Civic issue noted! You can upload a photo geotagged to your GPS location for instant automated dispatch to the ward engineer.`;
        actionButtons = ['Report Incident Now', 'View Helplines'];
      } else {
        botResponse = `✅ Thank you for reaching out. You can access all 24+ municipal services directly from the citizen portal with secure Keycloak SSO login.`;
        actionButtons = ['Sign In to Portal', 'Track Grievance', 'Apply Certificate'];
      }

      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: 'Just now',
        chips: actionButtons
      }]);
    }, 850);
  };

  const filteredServices = servicesCatalog.filter(svc => {
    const matchesCategory = activeCategory === 'All' || svc.category === activeCategory;
    const matchesSearch = svc.name.toLowerCase().includes(serviceSearch.toLowerCase()) || 
                          svc.desc.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                          svc.dept.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Grievance', 'Certificates', 'Permits', 'Welfare'];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark ? '#090d16' : '#f4f6fb', 
      color: isDark ? '#f1f5f9' : '#0f172a', 
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>

      {/* ── 1. Top Government & Real-Time Network Ticker Bar ── */}
      <div style={{
        background: isDark ? '#050811' : '#0f172a',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 24px',
        fontSize: 12,
        fontWeight: 600,
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 6, color: '#f8fafc', fontWeight: 700 }}>
            <span>🇮🇳</span>
            <span>GOVERNMENT OF INDIA</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: '#cbd5e1' }}>National Smart Governance Digital Grid</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8' }}>
            <Activity size={13} className="civic-pulse-badge" />
            <span>Kafka Event Bus: <strong style={{ color: '#4ade80' }}>Online (12ms)</strong></span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
            <Users size={13} style={{ color: '#a855f7' }} />
            <span>Active Citizens: <strong style={{ color: '#ffffff' }}>{liveCitizens.toLocaleString()}</strong></span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24' }}>
            <PhoneCall size={12} />
            <span>24×7 Toll-Free: <strong>1800-11-2026</strong></span>
          </div>
        </div>
      </div>

      {/* ── 2. Floating App-Style Glass Navigation Bar ── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: isDark ? 'rgba(9, 13, 22, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.9)',
        padding: '0 32px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(37,99,235,0.35)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Landmark size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ 
              fontSize: 19, 
              fontWeight: 900, 
              letterSpacing: '-0.02em', 
              color: isDark ? '#ffffff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              lineHeight: 1.2
            }}>
              CivicPulse <span style={{ color: '#2563eb' }}>Nexus</span>
              <span style={{ 
                fontSize: 9, 
                fontWeight: 800, 
                background: isDark ? 'rgba(37,99,235,0.25)' : '#eff6ff', 
                color: '#2563eb', 
                padding: '2px 6px', 
                borderRadius: 6, 
                border: '1px solid rgba(37,99,235,0.3)' 
              }}>PRO</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Unified Citizen Services Gateway
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, fontWeight: 700 }}>
          <a href="#feed" style={{ color: isDark ? '#cbd5e1' : '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
            <Bell size={15} style={{ color: '#38bdf8' }} /> Bulletins
          </a>
          <a href="#services" style={{ color: isDark ? '#cbd5e1' : '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
            <Sparkles size={15} style={{ color: '#f59e0b' }} /> Service Hub
          </a>
          <a href="#tracker" style={{ color: isDark ? '#cbd5e1' : '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
            <Search size={15} style={{ color: '#10b981' }} /> SLA Tracker
          </a>
          <button
            onClick={() => setIsChatOpen(true)}
            style={{ 
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? '#cbd5e1' : '#475569', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              fontSize: 13, 
              fontWeight: 700 
            }}
          >
            <Bot size={15} style={{ color: '#a855f7' }} /> AI Assistant
          </button>
        </div>

        {/* Right Nav Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleTheme}
            style={{
              height: 38,
              padding: '0 14px',
              borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              height: 38,
              padding: '0 18px',
              borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f172a',
              border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7
            }}>
              <LogIn size={15} /> Sign In
            </button>
          </Link>

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              height: 38,
              padding: '0 18px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: 13,
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              Register <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </nav>

      {/* ── 3. Stories Reel ── */}
      <div style={{
        background: isDark ? '#0c111c' : '#ffffff',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
        padding: '12px 32px',
        overflowX: 'auto'
      }} className="civic-scrollbar">
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, minWidth: 'max-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 16, borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.2 }}>Live Stories</div>
              <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b' }}>Official Highlights</div>
            </div>
          </div>

          {civicStories.map(story => {
            const StoryIcon = story.icon;
            return (
              <div 
                key={story.id}
                onClick={() => setSelectedStory(story)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '5px 14px 5px 6px',
                  borderRadius: 24,
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = story.borderColor; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'; }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  padding: 2,
                  background: `linear-gradient(135deg, ${story.borderColor}, #38bdf8)`,
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: isDark ? '#0f172a' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: story.borderColor
                  }}>
                    <StoryIcon size={16} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.2 }}>
                    {story.title}
                    <span style={{ fontSize: 9, fontWeight: 800, color: story.borderColor }}>• {story.tag}</span>
                  </div>
                  <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>{story.department}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Story Modal Preview ── */}
      {selectedStory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }} onClick={() => setSelectedStory(null)}>
          <div style={{
            width: '100%',
            maxWidth: 460,
            background: isDark ? '#0f172a' : '#ffffff',
            borderRadius: 20,
            padding: 24,
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: selectedStory.borderColor, color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 6 }}>
                  {selectedStory.tag}
                </span>
                <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>{selectedStory.time}</span>
              </div>
              <button onClick={() => setSelectedStory(null)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', fontSize: 18, cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 10px', color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.35 }}>
              {selectedStory.headline}
            </h3>
            <p style={{ fontSize: 13.5, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
              {selectedStory.details}
            </p>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                height: 42,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13
              }}>
                View Official Notice in Portal
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ── 4. Extended Full-Width Hero Section ── */}
      <section style={{
        padding: '50px 32px 60px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
        background: isDark 
          ? 'radial-gradient(ellipse at 30% 20%, rgba(37,99,235,0.14), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.08), transparent 60%), #090d16'
          : 'radial-gradient(ellipse at 30% 20%, rgba(224,242,254,0.7), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(243,232,255,0.5), transparent 60%), #f8fafc'
      }}>
        <div style={{ 
          maxWidth: 1280, 
          margin: '0 auto', 
          display: 'flex',
          flexDirection: 'column',
          gap: 36
        }}>
          
          {/* Hero Main Header & Fast Action Hub Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
            gap: 40,
            alignItems: 'center'
          }}>
            {/* Left Big Heading */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={{
                  background: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff',
                  color: isDark ? '#60a5fa' : '#2563eb',
                  border: isDark ? '1px solid rgba(37,99,235,0.3)' : '1px solid #bfdbfe',
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Sparkle size={14} style={{ color: '#38bdf8' }} />
                  <span>Next-Gen Smart Governance Portal • 2026 Edition</span>
                </span>
              </div>

              <h1 style={{ 
                margin: 0, 
                fontSize: 44, 
                fontWeight: 900, 
                lineHeight: 1.15, 
                letterSpacing: '-0.035em', 
                color: isDark ? '#ffffff' : '#0f172a' 
              }}>
                Your Gateway to <br />
                <span style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 50%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Smart, Instant & Accountable
                </span> <br />
                Governance.
              </h1>

              <p style={{ 
                margin: 0, 
                fontSize: 15.5, 
                color: isDark ? '#94a3b8' : '#475569', 
                lineHeight: 1.65, 
                maxWidth: 620 
              }}>
                CivicPulse Nexus is a cloud-native digital public infrastructure connecting 4,200+ citizens with municipal departments. File grievances with automated SLA tracking, apply for verified certificates, and claim welfare schemes — 100% paperless.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 6 }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button style={{
                    height: 48,
                    padding: '0 26px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 14,
                    boxShadow: '0 8px 22px rgba(37,99,235,0.38)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <PenSquare size={16} /> Register as Citizen <ArrowRight size={15} />
                  </button>
                </Link>

                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button style={{
                    height: 48,
                    padding: '0 22px',
                    borderRadius: 12,
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1.5px solid #cbd5e1',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <LogIn size={16} /> Citizen Sign In
                  </button>
                </Link>

                <button
                  onClick={() => setIsChatOpen(true)}
                  style={{
                    height: 48,
                    padding: '0 18px',
                    borderRadius: 12,
                    background: isDark ? 'rgba(168,85,247,0.12)' : '#f3e8ff',
                    color: '#9333ea',
                    border: isDark ? '1px solid rgba(168,85,247,0.3)' : '1px solid #e9d5ff',
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Bot size={17} /> Ask AI Assistant
                </button>
              </div>
            </div>

            {/* Right Side — High-End Citizen Digital Pass & Trust Hologram Card */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(145deg, rgba(30,58,138,0.3) 0%, rgba(15,23,42,0.9) 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
              borderRadius: 24,
              padding: '28px',
              border: isDark ? '1.5px solid rgba(56,189,248,0.25)' : '1.5px solid #bfdbfe',
              boxShadow: isDark ? '0 20px 45px rgba(0,0,0,0.5)' : '0 16px 36px rgba(37,99,235,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top Card Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                  }}>
                    <Landmark size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '0.02em' }}>
                      DIGITAL CITIZEN PASS
                    </div>
                    <div style={{ fontSize: 10, color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>
                      Verified Gov-Tech SSO Gateway
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(34,197,94,0.15)',
                  color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.3)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} className="civic-pulse-badge" />
                  AUTHENTICATED
                </div>
              </div>

              {/* 4 Interactive Feature Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: 11, fontWeight: 800 }}>
                    <ShieldCheck size={14} /> DigiLocker
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>QR Signed Certs</div>
                  <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b' }}>Zero physical office visits</div>
                </div>

                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 11, fontWeight: 800 }}>
                    <Clock size={14} /> SLA Engine
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>Auto Escalations</div>
                  <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b' }}>Guaranteed response time</div>
                </div>

                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 11, fontWeight: 800 }}>
                    <Award size={14} /> Direct DBT
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>Welfare Payouts</div>
                  <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b' }}>Direct Aadhaar bank credit</div>
                </div>

                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a855f7', fontSize: 11, fontWeight: 800 }}>
                    <Lock size={14} /> Keycloak SSO
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>256-Bit Security</div>
                  <div style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b' }}>Multi-factor identity</div>
                </div>
              </div>

              {/* Bottom Card Security Stamp */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                paddingTop: 14,
                fontSize: 11,
                color: isDark ? '#94a3b8' : '#64748b'
              }}>
                <span>🇮🇳 National Informatics Grid</span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>● 99.98% System Uptime</span>
              </div>
            </div>
          </div>

          {/* ── Extended 4-Column Stats Showcase Row ── */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: 16 
          }}>
            {/* Stat 1 */}
            <div style={{
              background: isDark ? '#111827' : '#ffffff',
              borderRadius: 16,
              padding: '18px 20px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 104,
              boxSizing: 'border-box',
              boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.03)'
            }} className="civic-glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#0284c7', lineHeight: 1 }}>12,847</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', background: 'rgba(22,163,74,0.12)', padding: '2px 8px', borderRadius: 6 }}>+12% week</span>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, marginTop: 4 }}>
                Complaints Resolved
              </div>
              <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <CheckCircle2 size={12} /> Avg. 18h turnaround
              </div>
            </div>

            {/* Stat 2 */}
            <div style={{
              background: isDark ? '#111827' : '#ffffff',
              borderRadius: 16,
              padding: '18px 20px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 104,
              boxSizing: 'border-box',
              boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.03)'
            }} className="civic-glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>4,200+</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', background: 'rgba(37,99,235,0.12)', padding: '2px 8px', borderRadius: 6 }}>Verified</span>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, marginTop: 4 }}>
                Citizens Registered
              </div>
              <div style={{ fontSize: 11, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <ShieldCheck size={12} /> 100% Aadhaar Verified
              </div>
            </div>

            {/* Stat 3 */}
            <div style={{
              background: isDark ? '#111827' : '#ffffff',
              borderRadius: 16,
              padding: '18px 20px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 104,
              boxSizing: 'border-box',
              boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.03)'
            }} className="civic-glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#d97706', lineHeight: 1 }}>98.5%</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', background: 'rgba(217,119,6,0.12)', padding: '2px 8px', borderRadius: 6 }}>⭐ High</span>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, marginTop: 4 }}>
                SLA Compliance
              </div>
              <div style={{ fontSize: 11, color: '#d97706', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Clock size={12} /> Auto Escalation Live
              </div>
            </div>

            {/* Stat 4 */}
            <div style={{
              background: isDark ? '#111827' : '#ffffff',
              borderRadius: 16,
              padding: '18px 20px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 104,
              boxSizing: 'border-box',
              boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.03)'
            }} className="civic-glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#8b5cf6', lineHeight: 1 }}>₹42.8 Cr</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', padding: '2px 8px', borderRadius: 6 }}>DBT</span>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, marginTop: 4 }}>
                Welfare Disbursed
              </div>
              <div style={{ fontSize: 11, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Check size={12} /> Direct Bank Transfer
              </div>
            </div>
          </div>

          {/* ── Extended 4-Grid Quick Action Portals ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16
          }}>
            {heroQuickActions.map((act, i) => {
              const ActIcon = act.icon;
              return (
                <Link
                  key={i}
                  to={act.to}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: act.bgGradient,
                    borderRadius: 16,
                    padding: '20px',
                    border: `1px solid ${act.borderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    boxSizing: 'border-box',
                    gap: 12
                  }} className="civic-glass-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                          color: act.tagColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}>
                          <ActIcon size={20} />
                        </div>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: act.tagColor,
                          background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                          padding: '3px 8px',
                          borderRadius: 8
                        }}>
                          {act.tag}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {act.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: 12.5, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
                        {act.desc}
                      </p>
                    </div>

                    <div style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: act.tagColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      Open Portal <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 5. Official Broadcast Bulletins Feed ── */}
      <section id="feed" style={{
        padding: '65px 32px',
        background: isDark ? '#0c111c' : '#ffffff',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ color: '#0284c7', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                📢 OFFICIAL BROADCAST CHANNEL
              </span>
              <h2 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em' }}>
                Live Citizen Announcements & Advisories
              </h2>
            </div>
            
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                height: 38,
                padding: '0 16px',
                borderRadius: 10,
                background: isDark ? 'rgba(56,189,248,0.1)' : '#eff6ff',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                View All Official Notices <ChevronRight size={14} />
              </button>
            </Link>
          </div>

          {/* 2-Column Grid of Broadcast Posts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            {noticesList.map(notice => {
              const NoticeIcon = notice.icon;
              return (
                <div 
                  key={notice.id}
                  style={{
                    background: isDark ? '#111827' : '#f8fafc',
                    borderRadius: 16,
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 14
                  }}
                  className="civic-glass-card"
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{
                        background: notice.badgeBg,
                        color: notice.badgeColor,
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.04em'
                      }}>
                        {notice.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>
                        <Eye size={12} />
                        <span>{notice.views}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                        color: notice.badgeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                      }}>
                        <NoticeIcon size={18} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.35 }}>
                          {notice.title}
                        </h4>
                        <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{notice.author}</span>
                          <span>•</span>
                          <span>{notice.date}</span>
                        </div>
                      </div>
                    </div>

                    <p style={{ margin: '12px 0 0', fontSize: 13, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5 }}>
                      {notice.desc}
                    </p>
                  </div>

                  {/* Reaction Bar */}
                  <div style={{
                    borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                    paddingTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleReaction(notice.id, 'likes')}
                        style={{
                          background: userReactions[`${notice.id}-likes`] ? 'rgba(59,130,246,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                          color: userReactions[`${notice.id}-likes`] ? '#3b82f6' : (isDark ? '#cbd5e1' : '#475569'),
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                          borderRadius: 16,
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <ThumbsUp size={12} /> {notice.likes}
                      </button>

                      <button
                        onClick={() => handleReaction(notice.id, 'hearts')}
                        style={{
                          background: userReactions[`${notice.id}-hearts`] ? 'rgba(239,68,68,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                          color: userReactions[`${notice.id}-hearts`] ? '#ef4444' : (isDark ? '#cbd5e1' : '#475569'),
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                          borderRadius: 16,
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Heart size={12} /> {notice.hearts}
                      </button>

                      <button
                        onClick={() => handleReaction(notice.id, 'fires')}
                        style={{
                          background: userReactions[`${notice.id}-fires`] ? 'rgba(245,158,11,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                          color: userReactions[`${notice.id}-fires`] ? '#f59e0b' : (isDark ? '#cbd5e1' : '#475569'),
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                          borderRadius: 16,
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Flame size={12} /> {notice.fires}
                      </button>
                    </div>

                    <Link to="/login" style={{ textDecoration: 'none', fontSize: 11, fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3 }}>
                      Details <ExternalLink size={12} />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 6. Interactive Live SLA Tracker Simulator ── */}
      <section id="tracker" style={{
        padding: '65px 32px',
        background: isDark ? '#090d16' : '#f8fafc',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              TRANSPARENT DISPATCH GRID
            </span>
            <h2 style={{ margin: '6px 0 8px', fontSize: 28, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em' }}>
              Interactive Live SLA Tracker
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: isDark ? '#94a3b8' : '#64748b' }}>
              Every citizen grievance is timestamped on the Kafka Event Bus, auto-assigned to field officers, and monitored against SLA breach timers.
            </p>
          </div>

          {/* Search Box */}
          <div style={{
            maxWidth: 680,
            margin: '0 auto',
            width: '100%',
            background: isDark ? '#111827' : '#ffffff',
            padding: 6,
            borderRadius: 14,
            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: isDark ? 'none' : '0 6px 20px rgba(0,0,0,0.04)'
          }}>
            <div style={{ paddingLeft: 10, color: '#3b82f6' }}>
              <Search size={18} />
            </div>
            <input 
              type="text"
              value={trackingIdInput}
              onChange={e => setTrackingIdInput(e.target.value)}
              placeholder="Enter Ticket ID (e.g. CP-2026-8941 or CERT-2026-3392)"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13.5,
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a'
              }}
            />
            <button
              onClick={() => {
                if (demoTrackingData[trackingIdInput.trim()]) {
                  setActiveTrackingResult(demoTrackingData[trackingIdInput.trim()]);
                } else {
                  setActiveTrackingResult(demoTrackingData['CP-2026-8941']);
                }
              }}
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Track Live
            </button>
          </div>

          {/* Sample quick buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
            <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Try sample tickets:</span>
            <button 
              onClick={() => { setTrackingIdInput('CP-2026-8941'); setActiveTrackingResult(demoTrackingData['CP-2026-8941']); }}
              style={{ background: 'transparent', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              CP-2026-8941 (Streetlight)
            </button>
            <span>•</span>
            <button 
              onClick={() => { setTrackingIdInput('CERT-2026-3392'); setActiveTrackingResult(demoTrackingData['CERT-2026-3392']); }}
              style={{ background: 'transparent', border: 'none', color: '#16a34a', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              CERT-2026-3392 (Residence Cert)
            </button>
          </div>

          {/* Live Timeline Display Card */}
          {activeTrackingResult && (
            <div style={{
              maxWidth: 780,
              margin: '0 auto',
              width: '100%',
              background: isDark ? '#111827' : '#ffffff',
              borderRadius: 18,
              padding: '24px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, paddingBottom: 16, borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>{activeTrackingResult.id}</span>
                    <span style={{ 
                      fontSize: 10, 
                      fontWeight: 800, 
                      padding: '2px 8px', 
                      borderRadius: 6,
                      background: activeTrackingResult.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                      color: activeTrackingResult.status === 'APPROVED' ? '#22c55e' : '#3b82f6'
                    }}>
                      {activeTrackingResult.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginTop: 3 }}>
                    {activeTrackingResult.type} • {activeTrackingResult.dept}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>Assigned Officer</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 2 }}>{activeTrackingResult.assignedOfficer}</div>
                </div>
              </div>

              {/* Step Timeline */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeTrackingResult.steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: step.done ? '#16a34a' : (step.active ? '#3b82f6' : (isDark ? '#334155' : '#e2e8f0')),
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800
                      }}>
                        {step.done ? '✓' : (step.active ? '●' : idx + 1)}
                      </div>
                      {idx !== activeTrackingResult.steps.length - 1 && (
                        <div style={{ width: 2, height: 26, background: step.done ? '#16a34a' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'), marginTop: 3 }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: step.active ? 800 : 700, color: step.active ? '#38bdf8' : (isDark ? '#f8fafc' : '#0f172a'), lineHeight: 1.2 }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ── 7. Modern Services Directory & App Hub ── */}
      <section id="services" style={{
        padding: '65px 32px',
        background: isDark ? '#0c111c' : '#ffffff',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                CITIZEN SERVICES HUB
              </span>
              <h2 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em' }}>
                Explore 24+ Digital Municipal Services
              </h2>
            </div>

            {/* Search Filter */}
            <div style={{
              background: isDark ? '#111827' : '#f8fafc',
              borderRadius: 10,
              padding: '6px 12px',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: 260
            }}>
              <Search size={15} style={{ color: '#94a3b8' }} />
              <input 
                type="text"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 12.5,
                  color: isDark ? '#fff' : '#0f172a',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeCategory === cat 
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' 
                    : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                  color: activeCategory === cat ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {filteredServices.map(svc => {
              const SvcIcon = svc.icon;
              return (
                <Link 
                  key={svc.id} 
                  to="/login"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: isDark ? '#111827' : '#f8fafc',
                    borderRadius: 16,
                    padding: '20px',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    boxSizing: 'border-box',
                    gap: 14
                  }} className="civic-glass-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                          color: svc.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                        }}>
                          <SvcIcon size={20} />
                        </div>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: svc.color,
                          background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                          padding: '3px 8px',
                          borderRadius: 8,
                          border: `1px solid ${svc.color}30`
                        }}>
                          {svc.sla}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {svc.name}
                      </h3>
                      <p style={{ margin: 0, fontSize: 12.5, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.45 }}>
                        {svc.desc}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                      paddingTop: 10
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: svc.color }}>{svc.dept}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3 }}>
                        Launch <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 8. Omni-Channel Access (WhatsApp & Telegram Bot Integration) ── */}
      <section style={{
        padding: '55px 32px',
        background: isDark ? '#090d16' : '#f8fafc',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 50%, #0f172a 100%)',
            borderRadius: 24,
            padding: '36px',
            color: '#ffffff',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 32,
            alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 16, fontSize: 11, fontWeight: 800, marginBottom: 14 }}>
                <Smartphone size={14} style={{ color: '#38bdf8' }} /> Mobile & Messaging Bot Gateway
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 10px', lineHeight: 1.25 }}>
                Access CivicPulse Directly on WhatsApp & Telegram
              </h2>
              <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 20px' }}>
                File complaints simply by sending a photo and location on WhatsApp or Telegram. Receive instant SLA status alerts right on your phone without opening a browser.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="https://wa.me/911800112026" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{
                    height: 42,
                    padding: '0 18px',
                    borderRadius: 10,
                    background: '#22c55e',
                    color: '#fff',
                    fontWeight: 800,
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <MessageSquare size={15} /> Open WhatsApp Desk
                  </button>
                </a>

                <a href="https://t.me/CivicPulseOfficialBot" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{
                    height: 42,
                    padding: '0 18px',
                    borderRadius: 10,
                    background: '#0284c7',
                    color: '#fff',
                    fontWeight: 800,
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <Send size={15} /> Telegram Bot Channel
                  </button>
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '20px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.15)',
                textAlign: 'center',
                maxWidth: 220
              }}>
                <div style={{
                  background: '#ffffff',
                  padding: 10,
                  borderRadius: 10,
                  display: 'inline-block',
                  marginBottom: 8
                }}>
                  <QrCode size={110} color="#0f172a" />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>Scan QR to Chat</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Instant bot onboarding</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Footer ── */}
      <footer style={{
        background: isDark ? '#050811' : '#0f172a',
        color: '#cbd5e1',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '45px 32px 25px'
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 36,
          paddingBottom: 36,
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Landmark size={18} />
              </div>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#ffffff' }}>CivicPulse Nexus</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              A Cloud-Native Smart Governance Infrastructure built on Apache Kafka, Keycloak Single Sign-On, and DigiLocker APIs.
            </p>
          </div>

          <div>
            <h5 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Citizen Portals
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Municipal Grievances</a>
              <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>e-Certificates & Permits</a>
              <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>State Welfare Schemes</a>
              <a href="#tracker" style={{ color: 'inherit', textDecoration: 'none' }}>Live SLA Tracking</a>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Compliance & Security
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={13} style={{ color: '#22c55e' }} /> 256-Bit SSL Encryption</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BadgeCheck size={13} style={{ color: '#38bdf8' }} /> Keycloak SSO MFA</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={13} style={{ color: '#f59e0b' }} /> RTI Disclosures</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Award size={13} style={{ color: '#a855f7' }} /> ISO 27001 Certified</span>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Emergency Hotlines
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <span>🚨 National Emergency: <strong style={{ color: '#ffffff' }}>112</strong></span>
              <span>📞 Citizen Toll-Free: <strong style={{ color: '#38bdf8' }}>1800-11-2026</strong></span>
              <span>🚑 Health & Ambulance: <strong style={{ color: '#ffffff' }}>108</strong></span>
              <span>✉️ Official Email: <strong style={{ color: '#ffffff' }}>support@civicpulse.gov.in</strong></span>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: 1280,
          margin: '20px auto 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 11,
          color: '#64748b'
        }}>
          <div>© 2026 Government of India • CivicPulse Nexus Smart Governance Platform.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ color: '#94a3b8' }}>All Governance Nodes Operational</span>
          </div>
        </div>
      </footer>

      {/* ── 10. Floating AI Assistant Widget Trigger (Bottom Right) ── */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        
        {/* Expanded Floating Chat Window */}
        {isChatOpen && (
          <div style={{
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 520,
            maxHeight: 'calc(100vh - 100px)',
            background: isDark ? '#0c111d' : '#ffffff',
            borderRadius: 22,
            border: isDark ? '1.5px solid rgba(255,255,255,0.14)' : '1.5px solid #cbd5e1',
            boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.7)' : '0 20px 45px rgba(37,99,235,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: 14,
            animation: 'chatBubbleSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            {/* Header */}
            <div style={{
              background: isDark ? '#111827' : '#f8fafc',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #0284c7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Bot size={18} />
                  </div>
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: isDark ? '2px solid #111827' : '2px solid #ffffff'
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: 5 }}>
                    CivicPulse AI Desk
                    <BadgeCheck size={14} style={{ color: '#38bdf8' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>
                    ● Online • Connected to Kafka Bus
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: isDark 
                ? 'radial-gradient(circle at center, rgba(37,99,235,0.03), transparent 70%), #0c111d'
                : 'radial-gradient(circle at center, rgba(239,246,255,0.7), transparent 70%), #fbfcfe'
            }} className="civic-scrollbar">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%'
                  }}
                  className="civic-chat-bubble"
                >
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: msg.sender === 'user' 
                      ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' 
                      : (isDark ? '#1e293b' : '#ffffff'),
                    color: msg.sender === 'user' ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a'),
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                    border: msg.sender === 'user' ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'),
                    fontSize: 13,
                    lineHeight: 1.45
                  }}>
                    <div>{msg.text}</div>
                    <div style={{ 
                      fontSize: 9, 
                      textAlign: 'right', 
                      marginTop: 4, 
                      opacity: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4
                    }}>
                      <span>{msg.time}</span>
                      {msg.sender === 'user' && <CheckCheck size={12} style={{ color: '#93c5fd' }} />}
                    </div>
                  </div>

                  {msg.chips && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {msg.chips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChat(chip)}
                          style={{
                            background: isDark ? 'rgba(56,189,248,0.12)' : '#eff6ff',
                            color: isDark ? '#38bdf8' : '#2563eb',
                            border: isDark ? '1px solid rgba(56,189,248,0.3)' : '1px solid #bfdbfe',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {chip} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: isDark ? '#1e293b' : '#ffffff', padding: '8px 12px', borderRadius: 14, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'civicPulseGlow 1s infinite' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'civicPulseGlow 1s infinite 0.2s' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'civicPulseGlow 1s infinite 0.4s' }} />
                  <span style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b', marginLeft: 4 }}>Typing...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
              style={{
                background: isDark ? '#111827' : '#f8fafc',
                borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <input 
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about grievances or certificates..."
                style={{
                  flex: 1,
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12.5,
                  color: isDark ? '#ffffff' : '#0f172a',
                  outline: 'none',
                  height: 36
                }}
              />
              <button
                type="submit"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          onClick={() => setIsChatOpen(prev => !prev)}
          style={{
            height: 54,
            padding: isChatOpen ? '0 18px' : '0 20px',
            borderRadius: 30,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13.5,
            fontWeight: 800,
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ position: 'relative' }}>
            <Bot size={22} />
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22c55e',
              border: '1.5px solid #2563eb'
            }} />
          </div>
          <span>{isChatOpen ? 'Close AI Desk' : 'Civic AI Desk'}</span>
          {!isChatOpen && (
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 8, fontSize: 10 }}>
              Online
            </span>
          )}
        </button>

      </div>

    </div>
  );
}
