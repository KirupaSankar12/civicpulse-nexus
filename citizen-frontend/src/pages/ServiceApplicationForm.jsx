import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';

function ServiceApplicationForm() {
  const navigate = useNavigate();
  const [type, setType] = useState('BIRTH_CERTIFICATE');
  const [applicantName, setApplicantName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('https://storage.civicpulse.gov/proof_document.pdf');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dynamic form fields state
  const [birthDetails, setBirthDetails] = useState({ childName: '', fatherName: '', motherName: '', dob: '', hospital: '' });
  const [deathDetails, setDeathDetails] = useState({ deceasedName: '', dod: '', placeOfDeath: '', cause: '' });
  const [incomeDetails, setIncomeDetails] = useState({ annualIncome: '', employmentType: 'Salaried', source: '' });
  const [residenceDetails, setResidenceDetails] = useState({ stayDuration: '', address: '', city: '', pin: '' });
  const [tradeDetails, setTradeDetails] = useState({ businessName: '', category: 'Retail', address: '', pan: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let details = {};
    if (type === 'BIRTH_CERTIFICATE') details = birthDetails;
    else if (type === 'DEATH_CERTIFICATE') details = deathDetails;
    else if (type === 'INCOME_CERTIFICATE') details = incomeDetails;
    else if (type === 'RESIDENCE_CERTIFICATE') details = residenceDetails;
    else if (type === 'TRADE_LICENSE') details = tradeDetails;

    const citizenId = keycloak.tokenParsed?.sub;

    const payload = {
      citizenId,
      applicantName,
      type,
      detailsJson: JSON.stringify(details),
      documentUrl
    };

    try {
      await api.post('/service-management-service/api/services/apply', payload);
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        navigate('/services/tracker');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit application. Please check your inputs.');
      setIsLoading(false);
    }
  };

  return (
    <AppShell title="Apply for Service">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '8px' }}>📜 Apply for Certificates & Licenses</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Fill out the form below to submit an application. The respective municipal officer will review and verify your documents.
        </p>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <span>✓</span> Application submitted successfully! Redirecting to tracker...
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="applicantName">Applicant Name</label>
            <input
              id="applicantName"
              type="text"
              className="form-control"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              required
              placeholder="Enter full legal name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="serviceType">Service Type</label>
            <select
              id="serviceType"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
              <option value="DEATH_CERTIFICATE">Death Certificate</option>
              <option value="INCOME_CERTIFICATE">Income Certificate</option>
              <option value="RESIDENCE_CERTIFICATE">Residence Certificate</option>
              <option value="TRADE_LICENSE">Trade License / Business Permit</option>
            </select>
          </div>

          {/* Dynamic Fields: Birth Certificate */}
          {type === 'BIRTH_CERTIFICATE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Birth Certificate Details</h3>
              <div className="form-group">
                <label className="form-label">Child Name</label>
                <input type="text" className="form-control" placeholder="Full name of child" value={birthDetails.childName} onChange={e => setBirthDetails({ ...birthDetails, childName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Father's Name</label>
                <input type="text" className="form-control" placeholder="Full name of father" value={birthDetails.fatherName} onChange={e => setBirthDetails({ ...birthDetails, fatherName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mother's Name</label>
                <input type="text" className="form-control" placeholder="Full name of mother" value={birthDetails.motherName} onChange={e => setBirthDetails({ ...birthDetails, motherName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" value={birthDetails.dob} onChange={e => setBirthDetails({ ...birthDetails, dob: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Place of Birth (Hospital/Address)</label>
                <input type="text" className="form-control" placeholder="Name of hospital or residence" value={birthDetails.hospital} onChange={e => setBirthDetails({ ...birthDetails, hospital: e.target.value })} required />
              </div>
            </div>
          )}

          {/* Dynamic Fields: Death Certificate */}
          {type === 'DEATH_CERTIFICATE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Death Certificate Details</h3>
              <div className="form-group">
                <label className="form-label">Name of Deceased</label>
                <input type="text" className="form-control" placeholder="Full name of deceased" value={deathDetails.deceasedName} onChange={e => setDeathDetails({ ...deathDetails, deceasedName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Death</label>
                <input type="date" className="form-control" value={deathDetails.dod} onChange={e => setDeathDetails({ ...deathDetails, dod: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Place of Death</label>
                <input type="text" className="form-control" placeholder="Hospital name or address" value={deathDetails.placeOfDeath} onChange={e => setDeathDetails({ ...deathDetails, placeOfDeath: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Cause of Death</label>
                <input type="text" className="form-control" placeholder="As certified by medical officer" value={deathDetails.cause} onChange={e => setDeathDetails({ ...deathDetails, cause: e.target.value })} required />
              </div>
            </div>
          )}

          {/* Dynamic Fields: Income Certificate */}
          {type === 'INCOME_CERTIFICATE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Income Certificate Details</h3>
              <div className="form-group">
                <label className="form-label">Annual Family Income (INR)</label>
                <input type="number" className="form-control" placeholder="Enter annual income in Rupees" value={incomeDetails.annualIncome} onChange={e => setIncomeDetails({ ...incomeDetails, annualIncome: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select className="form-select" value={incomeDetails.employmentType} onChange={e => setIncomeDetails({ ...incomeDetails, employmentType: e.target.value })}>
                  <option value="Salaried">Salaried Employee</option>
                  <option value="Self-Employed">Self-Employed / Business owner</option>
                  <option value="Unemployed">Pensioner / Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Primary Source of Income</label>
                <input type="text" className="form-control" placeholder="Salary, Agriculture, Business, etc." value={incomeDetails.source} onChange={e => setIncomeDetails({ ...incomeDetails, source: e.target.value })} required />
              </div>
            </div>
          )}

          {/* Dynamic Fields: Residence Certificate */}
          {type === 'RESIDENCE_CERTIFICATE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Residence Certificate Details</h3>
              <div className="form-group">
                <label className="form-label">Duration of Stay at Current Address (Years)</label>
                <input type="number" className="form-control" placeholder="e.g. 5" value={residenceDetails.stayDuration} onChange={e => setResidenceDetails({ ...residenceDetails, stayDuration: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Current Address</label>
                <input type="text" className="form-control" placeholder="Flat, Street, Area" value={residenceDetails.address} onChange={e => setResidenceDetails({ ...residenceDetails, address: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" className="form-control" placeholder="City" value={residenceDetails.city} onChange={e => setResidenceDetails({ ...residenceDetails, city: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Postal PIN Code</label>
                <input type="text" className="form-control" placeholder="e.g. 110001" value={residenceDetails.pin} onChange={e => setResidenceDetails({ ...residenceDetails, pin: e.target.value })} required />
              </div>
            </div>
          )}

          {/* Dynamic Fields: Trade License */}
          {type === 'TRADE_LICENSE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Trade License / Permit Details</h3>
              <div className="form-group">
                <label className="form-label">Name of Business / Trade</label>
                <input type="text" className="form-control" placeholder="Legal business title" value={tradeDetails.businessName} onChange={e => setTradeDetails({ ...tradeDetails, businessName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Business Category</label>
                <select className="form-select" value={tradeDetails.category} onChange={e => setTradeDetails({ ...tradeDetails, category: e.target.value })}>
                  <option value="Retail">Retail Store</option>
                  <option value="Food/Restaurant">Restaurant / Food Stall</option>
                  <option value="Industrial">Manufacturing / Workshop</option>
                  <option value="Professional Services">Office / Consultation Agency</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Business Location Address</label>
                <input type="text" className="form-control" placeholder="Full address of commercial unit" value={tradeDetails.address} onChange={e => setTradeDetails({ ...tradeDetails, address: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Permanent Account Number (PAN)</label>
                <input type="text" className="form-control" placeholder="10-digit PAN number" value={tradeDetails.pan} onChange={e => setTradeDetails({ ...tradeDetails, pan: e.target.value })} required />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="documentUrl">Proof Document (Aadhar/Voter ID/Property tax slip)</label>
            <input
              id="documentUrl"
              type="text"
              className="form-control"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '0.5rem' }} disabled={isLoading}>
            {isLoading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

export default ServiceApplicationForm;
