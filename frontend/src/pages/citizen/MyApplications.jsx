import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { applicationService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ExternalLink,
  Upload,
  Calendar,
  Building,
} from "lucide-react";

const getStatusBadge = (status) => {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "REJECTED":
    case "CANCELLED":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "ADDITIONAL_INFO_REQUIRED":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "DOCUMENT_VERIFICATION":
    case "OFFICER_REVIEW":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

const MyApplications = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalApp, setUploadModalApp] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getMy();
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load citizen applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchApplications();
  }, [isAuthenticated]);

  const handleUploadAdditionalDoc = async (e) => {
    e.preventDefault();
    if (!fileToUpload || !uploadModalApp) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("documentType", fileToUpload.name);

      await applicationService.uploadDocument(uploadModalApp._id, formData);
      setUploadModalApp(null);
      setFileToUpload(null);
      fetchApplications();
    } catch (err) {
      console.error("Failed to upload additional document:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gov-100 text-gov-800 flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                My Government Applications
              </h1>
              <p className="text-sm text-slate-500">
                Manage your submitted citizen service requests and document verifications
              </p>
            </div>
          </div>

          <Link
            to="/citizen/apply"
            className="px-5 py-3 bg-gov-700 hover:bg-gov-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Application
          </Link>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-700 mx-auto"></div>
            <p className="mt-4 font-semibold text-slate-600">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              No Applications Submitted Yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              You haven't submitted any service applications yet. Apply online to avoid physical lines at the taluk office!
            </p>
            <Link
              to="/citizen/apply"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gov-700 hover:bg-gov-800 text-white font-bold text-sm rounded-xl transition-all"
            >
              Apply For Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-gov-800 bg-gov-50 px-2.5 py-1 rounded-lg border border-gov-200">
                      {app.applicationNumber}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status.replace(/_/g, " ")}
                    </span>
                    {app.priorityType && app.priorityType !== "NORMAL" && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {app.priorityType.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {app.service?.name || "Government Service"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>
                      Dept: <strong>{app.department?.name || "General"}</strong>
                    </span>
                    <span>
                      Submitted: <strong>{new Date(app.createdAt).toLocaleDateString()}</strong>
                    </span>
                    {app.expectedCompletionDate && (
                      <span>
                        SLA Due:{" "}
                        <strong className="text-slate-700">
                          {new Date(app.expectedCompletionDate).toLocaleDateString()}
                        </strong>
                      </span>
                    )}
                  </div>

                  {app.remarks && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      Officer Remark: {app.remarks}
                    </p>
                  )}

                  {/* Documents count */}
                  {app.documents && app.documents.length > 0 && (
                    <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        Documents ({app.documents.length}):
                      </span>
                      {app.documents.map((d, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                        >
                          {d.documentType} ({d.verificationStatus})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                  <Link
                    to={`/track?q=${app.applicationNumber}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    Track Progress
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setUploadModalApp(app)}
                    className="px-4 py-2 bg-gov-50 hover:bg-gov-100 text-gov-700 text-xs font-bold rounded-xl border border-gov-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Attach Doc
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {uploadModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">
                  Upload Supporting Document
                </h3>
                <button
                  onClick={() => setUploadModalApp(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Upload verification certificate or ID proof for application{" "}
                <strong>{uploadModalApp.applicationNumber}</strong>
              </p>

              <form onSubmit={handleUploadAdditionalDoc} className="space-y-4">
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setFileToUpload(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gov-50 file:text-gov-700 hover:file:bg-gov-100"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalApp(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !fileToUpload}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload File"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
