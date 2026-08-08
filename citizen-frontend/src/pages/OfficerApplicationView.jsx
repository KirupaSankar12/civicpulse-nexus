import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, ArrowLeft, Check, X, FileText, Download, RotateCw, ZoomIn, ZoomOut, CheckCircle, XCircle } from 'lucide-react';

function getBadgeVariant(status) {
  if (['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(status)) return 'default';
  if (status === 'REJECTED') return 'destructive';
  return 'secondary';
}

function OfficerApplicationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checklist, setChecklist] = useState({
    documentsVerified: false,
    infoMatches: false,
    readyForApproval: false
  });

  const [officerRemarks, setOfficerRemarks] = useState('');
  
  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);

  // Document Viewer Modal
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [docViewerUrl, setDocViewerUrl] = useState(null);
  const [docViewerName, setDocViewerName] = useState('');
  const [docZoom, setDocZoom] = useState(1);
  const [docRotation, setDocRotation] = useState(0);

  const handleDocumentPreview = (docObj) => {
    const isObject = typeof docObj === 'object' && docObj !== null;
    const docName = isObject ? docObj.id : docObj;
    
    if (isObject && docObj.data) {
      try {
        const arr = docObj.data.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], {type: mime});
        const url = URL.createObjectURL(blob);
        setDocViewerUrl(url);
        setDocViewerName(docObj.name || docName);
        setDocZoom(1);
        setDocRotation(0);
        setShowDocViewer(true);
        return;
      } catch (e) {
        console.error("Error creating blob from data URL", e);
      }
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${docName}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; background: #f3f4f6; text-align: center; }
            .doc { background: white; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="doc">
            <h2>${docName}</h2>
            <p style="color: #6b7280;">Document Preview Placeholder</p>
          </div>
        </body>
      </html>
    `;
    const dummyBlob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(dummyBlob);
    setDocViewerUrl(url);
    setDocViewerName(docName);
    setDocZoom(1);
    setDocRotation(0);
    setShowDocViewer(true);
  };

  const closeDocViewer = () => {
    setShowDocViewer(false);
    if (docViewerUrl) {
      URL.revokeObjectURL(docViewerUrl);
      setDocViewerUrl(null);
    }
  };

  const downloadDocument = () => {
    if (!docViewerUrl) return;
    const link = document.createElement('a');
    link.href = docViewerUrl;
    link.setAttribute('download', docViewerName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get(`/service-management-service/api/services/${id}`);
        setApp(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load application details.');
        setIsLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const allChecked = Object.values(checklist).every(Boolean);

  const handleApprove = async () => {
    try {
      await api.put(`/service-management-service/api/services/approve/${id}`, {
        officerRemarks: officerRemarks
      });
      toast.success('Application approved successfully!');
      setShowApproveModal(false);
      navigate('/services/officer/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      toast.error('Please select a rejection reason.');
      return;
    }
    try {
      await api.put(`/service-management-service/api/services/reject/${id}`, {
        reason: rejectReason,
        officerRemarks: officerRemarks
      });
      toast.error('Application rejected.');
      setShowRejectModal(false);
      navigate('/services/officer/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to reject application');
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Application Details">
        <PageLoader message="Loading application details..." />
      </AppShell>
    );
  }

  if (error || !app) {
    return (
      <AppShell title="Application Details">
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <AlertCircle size={48} className="text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold">Application Not Found</h3>
            <p className="text-sm text-muted-foreground">{error || 'The requested application could not be loaded.'}</p>
            <Button onClick={() => navigate('/services/officer/dashboard')}>
              <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  let documents = [];
  if (app.documentsSubmitted) {
    try {
      documents = JSON.parse(app.documentsSubmitted);
    } catch (e) {
      documents = app.documentsSubmitted.split(',').map(d => d.trim());
    }
  }

  const isPendingAction = ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status);

  return (
    <AppShell title="Application Details">
      <div className="space-y-6 w-full max-w-full px-6 sm:px-8 lg:px-12 py-2" style={{ boxSizing: 'border-box' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/services/officer/dashboard')}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Application Details</h1>
          </div>
          <Badge variant={getBadgeVariant(app.status)}>{app.status}</Badge>
        </div>

        {/* Application Summary Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Application Number</div>
                <div className="font-bold text-base mt-0.5">{app.applicationNumber}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Applicant Name</div>
                <div className="font-bold text-base mt-0.5">{app.applicantName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Aadhaar Number</div>
                <div className="font-bold text-base mt-0.5">XXXX-XXXX-{app.aadhaarNumber?.slice(-4) || 'XXXX'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Current Status</div>
                <div className="font-bold text-base mt-0.5">{app.status}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Certificate Type</div>
                <div className="font-bold text-base mt-0.5">{app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Applied Date</div>
                <div className="font-bold text-base mt-0.5">{new Date(app.appliedDate).toLocaleDateString('en-IN')}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Department</div>
                <div className="font-bold text-base mt-0.5">{app.department || 'Municipal Corporation'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase font-medium">Assigned Officer</div>
                <div className="font-bold text-base mt-0.5">{app.assignedOfficer || 'Auto-Assigned'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isPendingAction ? (
          <>
            {/* Two Column Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT: Uploaded Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                  ) : (
                    documents.map((doc, idx) => {
                      const isObject = typeof doc === 'object' && doc !== null;
                      const docId = isObject ? doc.id : doc;
                      const docName = isObject ? doc.name : `${doc.toLowerCase().replace(/\s+/g, '_')}.pdf`;
                      
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText size={24} className="text-muted-foreground" />
                            <div>
                              <div className="text-sm font-semibold">{docId}</div>
                              <div className="text-xs text-muted-foreground">{docName}</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleDocumentPreview(doc)}>
                            👁 Preview
                          </Button>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* RIGHT: Verification Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${checklist.documentsVerified ? 'bg-green-50/50 dark:bg-green-950/20 border-green-500' : 'bg-muted/20 border-border'}`}>
                    <Checkbox 
                      checked={checklist.documentsVerified} 
                      onCheckedChange={(checked) => setChecklist({ ...checklist, documentsVerified: !!checked })} 
                    />
                    <span className="text-sm font-medium">Documents Verified</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${checklist.infoMatches ? 'bg-green-50/50 dark:bg-green-950/20 border-green-500' : 'bg-muted/20 border-border'}`}>
                    <Checkbox 
                      checked={checklist.infoMatches} 
                      onCheckedChange={(checked) => setChecklist({ ...checklist, infoMatches: !!checked })} 
                    />
                    <span className="text-sm font-medium">Information Matches Application</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${checklist.readyForApproval ? 'bg-green-50/50 dark:bg-green-950/20 border-green-500' : 'bg-muted/20 border-border'}`}>
                    <Checkbox 
                      checked={checklist.readyForApproval} 
                      onCheckedChange={(checked) => setChecklist({ ...checklist, readyForApproval: !!checked })} 
                    />
                    <span className="text-sm font-medium">Ready for Approval</span>
                  </label>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Actions Section */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Officer Remarks (Optional)</h3>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                      placeholder="Enter remarks (optional)..."
                      value={officerRemarks}
                      maxLength={500}
                      onChange={e => setOfficerRemarks(e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground text-right mt-1">
                      {officerRemarks.length} / 500
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold mb-2">Actions</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-12 text-destructive border-destructive hover:bg-destructive/10 text-base font-semibold"
                      onClick={() => setShowRejectModal(true)}
                    >
                      <X size={20} className="mr-2" /> Reject
                    </Button>
                    <Button 
                      type="button" 
                      disabled={!allChecked}
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-base font-semibold"
                      onClick={() => setShowApproveModal(true)}
                    >
                      <Check size={20} className="mr-2" /> Approve & Digitally Sign
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-semibold">Processing History</h3>
              {['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(app.status) ? (
                <>
                  <div className="p-4 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-900 flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle size={18} className="text-green-600" /> Approved By: {app.approvedBy || 'Officer'}
                  </div>
                  {app.officerRemarks && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 rounded-lg border border-blue-200 dark:border-blue-900 space-y-1 text-sm">
                      <div className="font-semibold">Officer Remarks:</div>
                      <div>{app.officerRemarks}</div>
                    </div>
                  )}
                  {app.certificateNumber && (
                    <div className="p-6 bg-muted/30 rounded-lg border text-center space-y-2">
                      <FileText size={32} className="text-muted-foreground mx-auto" />
                      <div className="font-semibold text-base">Certificate Issued</div>
                      <div className="font-mono text-sm font-bold text-primary">{app.certificateNumber}</div>
                    </div>
                  )}
                </>
              ) : app.status === 'REJECTED' ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-900 space-y-2 text-sm">
                  <div className="font-bold flex items-center gap-2 text-red-600">
                    <XCircle size={18} /> Application Rejected
                  </div>
                  <div><strong>Reason:</strong> {app.rejectionReason}</div>
                  {app.officerRemarks && <div><strong>Remarks:</strong> {app.officerRemarks}</div>}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Approve Dialog Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>This action will:</p>
              <ul className="list-disc pl-5 space-y-1 text-foreground">
                <li>Approve the application</li>
                <li>Generate the certificate</li>
                <li>Apply your digital signature</li>
                <li>Notify the citizen</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowApproveModal(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}>
                Approve & Sign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Reject Reason *</label>
              <Select value={rejectReason} onValueChange={val => setRejectReason(val)}>
                <SelectTrigger><SelectValue placeholder="Select reason..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Missing Document">Missing Document</SelectItem>
                  <SelectItem value="Information Mismatch">Information Mismatch</SelectItem>
                  <SelectItem value="Invalid Document">Invalid Document</SelectItem>
                  <SelectItem value="Unreadable Document">Unreadable Document</SelectItem>
                  <SelectItem value="Duplicate Application">Duplicate Application</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Remarks</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]"
                placeholder="Provide details to help the citizen fix the issue..."
                value={officerRemarks}
                onChange={e => setOfficerRemarks(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog open={showDocViewer} onOpenChange={closeDocViewer}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b bg-background">
            <h3 className="font-semibold text-base">{docViewerName}</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setDocZoom(z => z + 0.25)}><ZoomIn size={16} /></Button>
              <Button variant="outline" size="sm" onClick={() => setDocZoom(z => Math.max(0.5, z - 0.25))}><ZoomOut size={16} /></Button>
              <Button variant="outline" size="sm" onClick={() => setDocRotation(r => r + 90)}><RotateCw size={16} /></Button>
              <Button size="sm" onClick={downloadDocument}><Download size={16} className="mr-1" /> Download</Button>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-auto bg-muted/20 flex items-center justify-center">
            <div className="bg-background p-6 rounded shadow-lg min-w-[60%] min-h-[60%] flex items-center justify-center transition-transform" style={{ transform: `scale(${docZoom}) rotate(${docRotation}deg)` }}>
              {docViewerUrl && <iframe src={docViewerUrl} className="w-full h-[400px] border-none" title="Document Preview" />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default OfficerApplicationView;
