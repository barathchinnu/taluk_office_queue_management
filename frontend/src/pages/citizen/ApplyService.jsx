import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  officeService,
  departmentService,
  serviceService,
  applicationService,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";

const ApplyService = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId");

  const [offices, setOffices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedOffice, setSelectedOffice] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedService, setSelectedService] = useState(preselectedServiceId || "");
  const [activeServiceObj, setActiveServiceObj] = useState(null);

  const [priorityType, setPriorityType] = useState("NORMAL");
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successApp, setSuccessApp] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const initData = async () => {
      try {
        const [offRes, deptRes, srvRes] = await Promise.all([
          officeService.getAll(),
          departmentService.getAll(),
          serviceService.getAll(),
        ]);

        if (offRes.success && offRes.data?.length > 0) {
          setOffices(offRes.data);
          setSelectedOffice(offRes.data[0]._id);
        }

        if (deptRes.success) {
          setDepartments(deptRes.data);
        }

        if (srvRes.success) {
          setServices(srvRes.data);
          if (preselectedServiceId) {
            const found = srvRes.data.find((s) => s._id === preselectedServiceId);
            if (found) {
              setActiveServiceObj(found);
              if (found.department) {
                setSelectedDept(
                  typeof found.department === "object"
                    ? found.department._id
                    : found.department
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };

    initData();
  }, [isAuthenticated, preselectedServiceId]);

  const handleDeptChange = (deptId) => {
    setSelectedDept(deptId);
    setSelectedService("");
    setActiveServiceObj(null);
  };

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    const found = services.find((s) => s._id === serviceId);
    setActiveServiceObj(found || null);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedService) {
      setError("Please select both a department and a service.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // 1. Create Application
      const appPayload = {
        office: selectedOffice || undefined,
        department: selectedDept,
        service: selectedService,
        priorityType,
        remarks: remarks.trim() || undefined,
      };

      const res = await applicationService.create(appPayload);

      if (res.success && res.data) {
        const createdApp = res.data;

        // 2. Upload Documents if any
        if (files.length > 0) {
          for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("documentType", file.name);
            await applicationService.uploadDocument(createdApp._id, formData);
          }
        }

        setSuccessApp(createdApp);
      } else {
        setError(res.message || "Failed to submit application");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setError(
        err.response?.data?.message || "Application submission failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const availableServices = selectedDept
    ? services.filter(
        (s) =>
          (typeof s.department === "object" ? s.department?._id : s.department) ===
          selectedDept
      )
    : services;

  if (successApp) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Application Successfully Submitted
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Government Service Request Logged
            </h2>
            <p className="text-sm text-slate-500">
              Your application has been assigned to the Taluk Officer for document verification and processing.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-left space-y-3 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans">Application No:</span>
              <strong className="text-base text-gov-800 font-bold">
                {successApp.applicationNumber}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans">Initial Status:</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-sans font-bold">
                {successApp.status}
              </span>
            </div>
            {successApp.expectedCompletionDate && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-sans">Expected SLA:</span>
                <span className="text-slate-800 font-sans">
                  {new Date(successApp.expectedCompletionDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/track?q=${successApp.applicationNumber}`}
              className="flex-1 py-3 bg-gov-700 hover:bg-gov-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm text-center"
            >
              Track Status
            </Link>
            <Link
              to="/citizen/applications"
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all text-center"
            >
              My Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gov-600 hover:text-gov-800 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Service Catalog
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Online Government Service Application
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Submit your taluk documentation digitally to reduce in-person waiting times.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-8"
        >
          {/* Step 1: Select Office & Department */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-gov-700 text-white flex items-center justify-center text-xs">
                1
              </span>
              Office & Department Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offices.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Government Office
                  </label>
                  <select
                    value={selectedOffice}
                    onChange={(e) => setSelectedOffice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600 focus:outline-none"
                  >
                    {offices.map((off) => (
                      <option key={off._id} value={off._id}>
                        {off.name} ({off.taluk || off.district})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Department *
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600 focus:outline-none"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Service *
              </label>
              <select
                value={selectedService}
                onChange={(e) => handleServiceChange(e.target.value)}
                required
                disabled={!selectedDept}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600 focus:outline-none disabled:bg-slate-100"
              >
                <option value="">-- Choose Service --</option>
                {availableServices.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code || "Service"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Details Card if selected */}
          {activeServiceObj && (
            <div className="bg-gov-50/60 border border-gov-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gov-900 text-sm">
                  {activeServiceObj.name}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {activeServiceObj.fee === 0 ? "Free Service" : `Fee: ₹${activeServiceObj.fee}`}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {activeServiceObj.description}
              </p>
              {activeServiceObj.requiredDocuments?.length > 0 && (
                <div className="pt-2 border-t border-gov-100">
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Prerequisite Documents:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeServiceObj.requiredDocuments.map((doc, i) => (
                      <span
                        key={i}
                        className="text-xs bg-white text-slate-700 px-2 py-1 rounded-lg border border-slate-200"
                      >
                        ✓ {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Citizen Priority & Remarks */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-gov-700 text-white flex items-center justify-center text-xs">
                2
              </span>
              Priority Category & Application Remarks
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Citizen Category / Priority Eligibility
              </label>
              <select
                value={priorityType}
                onChange={(e) => setPriorityType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600 focus:outline-none"
              >
                <option value="NORMAL">Normal FIFO Citizen</option>
                <option value="SENIOR_CITIZEN">Senior Citizen (60+ Years)</option>
                <option value="DISABILITY">Person with Disability (PwD)</option>
                <option value="PREGNANT">Pregnant Woman / Mother with Infant</option>
                <option value="EMERGENCY">Emergency / Authorized Priority</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1 italic">
                * Note: Priority categories must be verified by the Taluk Officer upon scrutiny before preferential queue ordering takes effect.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Additional Remarks / Details (Optional)
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Specify survey number, previous application reference, or specific notes..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-gov-600 focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* Step 3: Document Uploads */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-gov-700 text-white flex items-center justify-center text-xs">
                3
              </span>
              Attach Supporting Documents (PDF, PNG, JPG - Max 10MB)
            </h3>

            <div className="border-2 border-dashed border-slate-300 hover:border-gov-600 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-slate-50/50 hover:bg-slate-50">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">
                Click or drag files here to upload
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Aadhaar card, Ration card, previous tax receipts, or relevant certificates
              </p>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">
                  Files to be attached ({files.length}):
                </span>
                <div className="space-y-1.5">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-gov-700 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {file.name}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/services"
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-gov-700 hover:bg-gov-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {submitting ? "Submitting Application..." : "Submit Application"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyService;
