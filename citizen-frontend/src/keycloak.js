import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180',
  realm: 'civicpulse',
  clientId: 'civicpulse-frontend',
});

const originalLogout = keycloak.logout;
keycloak.logout = async function(options) {
  const refreshToken = localStorage.getItem('kc_refreshToken');
  
  localStorage.removeItem('kc_token');
  localStorage.removeItem('kc_refreshToken');
  localStorage.removeItem('kc_idToken');
  
  if (refreshToken) {
    try {
      const params = new URLSearchParams();
      params.append('client_id', 'civicpulse-frontend');
      params.append('refresh_token', refreshToken);
      
      await fetch('http://localhost:8180/realms/civicpulse/protocol/openid-connect/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });
    } catch (err) {
      console.warn('Silent keycloak logout failed', err);
    }
  }
  
  window.location.href = '/';
};

keycloak.onAuthRefreshSuccess = function() {
  localStorage.setItem('kc_token', keycloak.token);
  localStorage.setItem('kc_refreshToken', keycloak.refreshToken);
  if (keycloak.idToken) {
    localStorage.setItem('kc_idToken', keycloak.idToken);
  }
};

export default keycloak;
