import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import keycloak from '../keycloak.js';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both Email and Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build form urlencoded body for Keycloak direct grant
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', 'civicpulse-frontend');
      params.append('username', email);
      params.append('password', password);

      const response = await axios.post(
        'http://localhost:8180/realms/civicpulse/protocol/openid-connect/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, id_token } = response.data;

      // Save tokens to localStorage
      localStorage.setItem('kc_token', access_token);
      localStorage.setItem('kc_refreshToken', refresh_token);
      if (id_token) {
        localStorage.setItem('kc_idToken', id_token);
      }

      // Redirect directly to dashboard (will trigger clean page load and pick up tokens)
      window.location.href = '/dashboard';

    } catch (err) {
      console.error('Direct grant login failed:', err);
      if (err.response) {
        const errorDesc = err.response.data?.error_description || 'Invalid credentials or login flow not supported.';
        setError(errorDesc);
      } else {
        setError('Cannot connect to identity server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeycloakSSORedirect = () => {
    // Standard OIDC Login fallback
    keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <span className="big-icon">🏛️</span>
          <h2>CivicPulse Nexus</h2>
          <p>
            The Cloud-Native Smart Governance & Citizen Services Management Platform.
            Access your services, file complaints, and monitor SLA response in real time.
          </p>

          <div className="auth-trust-badges">
            <div className="trust-badge">🔒 256-bit SSL</div>
            <div className="trust-badge">🛡️ Keycloak Secure</div>
            <div className="trust-badge">🇮🇳 Govt. Certified</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <div className="logo-row">
              <div className="logo-icon">🏛️</div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>CivicPulse Nexus</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Smart Governance Platform</div>
              </div>
            </div>
            <h2>Sign In</h2>
            <p>Welcome back! Please enter your details below.</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <div className="auth-card">
            <form onSubmit={handleCustomLogin}>
              <div className="form-group">
                <label>Username or Email Address *</label>
                <input
                  type="text"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane_officer or name@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ marginBottom: 0 }}>Password *</label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Please contact your administrator to reset credentials or use the Keycloak Admin Console.');
                    }}
                    style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}
                  >
                    Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
                style={{ marginTop: '12px' }}
              >
                {loading ? <><span className="spinner-sm" /> Verifying...</> : '🔐 Login'}
              </button>
            </form>

            <div className="auth-divider" style={{ margin: '24px 0' }}>
              or sign in with
            </div>

            <button
              type="button"
              className="btn btn-outline btn-full"
              onClick={handleKeycloakSSORedirect}
            >
              🌐 Single Sign-On (SSO Redirect)
            </button>

            {/* USER CREDENTIALS REPORT */}
            <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '12px', fontSize: '14px' }}>📋 CivicPulse Nexus — User Credentials Report</div>
              <p style={{ marginBottom: '12px', color: '#475569' }}>All test accounts listed below are initialized with the password <strong>Password123</strong>.</p>
              
              <div style={{ fontWeight: '600', color: '#334155', marginBottom: '6px' }}>1. 👤 Citizens (Role: CITIZEN)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '4px 0', color: '#64748b' }}>Email (Username)</th>
                    <th style={{ padding: '4px 0', color: '#64748b' }}>Full Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>citizen1@gmail.com</td><td style={{ padding: '4px 0' }}>Citizen One</td></tr>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>citizen2@gmail.com</td><td style={{ padding: '4px 0' }}>Citizen Two</td></tr>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>citizen3@gmail.com</td><td style={{ padding: '4px 0' }}>Citizen Three</td></tr>
                </tbody>
              </table>

              <div style={{ fontWeight: '600', color: '#334155', marginBottom: '6px' }}>2. 🧑‍💼 Field Officers (Role: OFFICER)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '4px 0', color: '#64748b' }}>Username</th>
                    <th style={{ padding: '4px 0', color: '#64748b' }}>Department</th>
                    <th style={{ padding: '4px 0', color: '#64748b' }}>Authority</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>sibi</td><td style={{ padding: '4px 0' }}>Water</td><td style={{ padding: '4px 0' }}>Junior</td></tr>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>joyel</td><td style={{ padding: '4px 0' }}>Public Works</td><td style={{ padding: '4px 0' }}>Junior</td></tr>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>kirupa</td><td style={{ padding: '4px 0' }}>Sanitation Dept</td><td style={{ padding: '4px 0' }}>Approver</td></tr>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>harish</td><td style={{ padding: '4px 0' }}>Water</td><td style={{ padding: '4px 0' }}>Approver</td></tr>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>karthick</td><td style={{ padding: '4px 0' }}>Health Department</td><td style={{ padding: '4px 0' }}>Approver</td></tr>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>joseph</td><td style={{ padding: '4px 0' }}>Revenue Department</td><td style={{ padding: '4px 0' }}>Approver</td></tr>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>vikram</td><td style={{ padding: '4px 0' }}>Municipal Corporation</td><td style={{ padding: '4px 0' }}>Approver</td></tr>
                </tbody>
              </table>

              <div style={{ fontWeight: '600', color: '#334155', marginBottom: '6px' }}>3. ⚙️ Portal Administrator (Role: ADMIN)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '4px 0', color: '#64748b' }}>Username</th>
                    <th style={{ padding: '4px 0', color: '#64748b' }}>Authority</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ padding: '4px 0', fontFamily: 'monospace' }}>admin_user</td><td style={{ padding: '4px 0' }}>System Administrator</td></tr>
                </tbody>
              </table>
              <div style={{ marginTop: '12px', color: '#64748b', fontStyle: 'italic' }}>* Note: Keycloak admin interface is available at http://localhost:8180 (Credentials: admin/admin)</div>
            </div>
          </div>

          <div className="auth-footer" style={{ marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: '700', color: 'var(--accent)' }}>Register as Citizen</Link>
          </div>

          <div className="auth-footer">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
