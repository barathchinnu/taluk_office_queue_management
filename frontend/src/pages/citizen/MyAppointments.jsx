import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { departmentService, serviceService, appointmentService } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import {
  Calendar,
  Clock,
  Building2,
  Ticket,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const MyAppointments = () => {
  const [activeTab, setActiveTab] = useState("my"); // "my" or "book"
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);

  // Form State
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:30 AM");
  const [purpose, setPurpose] = useState("");

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getMyAppointments();
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    departmentService.getAll().then((data) => {
      if (data.success) {
        setDepartments(data.departments);
      }
    });
  }, []);

  const handleDeptChange = async (deptId) => {
    setSelectedDept(deptId);
    setSelectedService("");
    if (!deptId) {
      setServices([]);
      return;
    }
    try {
      const data = await serviceService.getByDepartment(deptId);
      if (data.success) {
        setServices(data.services);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedService || !appointmentDate) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    try {
      setBookingLoading(true);
      setMessage(null);

      const res = await appointmentService.createAppointment({
        department: selectedDept,
        service: selectedService,
        appointmentDate,
        appointmentTime,
        purpose,
      });

      if (res.success) {
        setMessage({
          type: "success",
          text: "Appointment booked successfully!",
        });
        setActiveTab("my");
        fetchAppointments();
        // Reset form
        setSelectedDept("");
        setSelectedService("");
        setAppointmentDate("");
        setPurpose("");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to book appointment",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      setMessage(null);
      const res = await appointmentService.checkIn(appointmentId);

      if (res.success && res.token) {
        setMessage({
          type: "success",
          text: `Check-in successful! Generated Token: ${res.token.tokenDisplay}. View your queue position on the dashboard.`,
        });
        fetchAppointments();
        navigate("/citizen");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Check-in failed. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      setActionLoading(appointmentId);
      setMessage(null);
      const res = await appointmentService.cancelAppointment(appointmentId);

      if (res.success) {
        setMessage({
          type: "success",
          text: "Appointment cancelled successfully.",
        });
        fetchAppointments();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Cancellation failed.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Min date for appointment is tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/citizen" className="hover:text-indigo-600 font-medium">
              Citizen Desk
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">Appointments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Taluk Office Appointments
          </h1>
          <p className="text-xs text-slate-500">
            Book upcoming visit slots or check in to join the queue on your scheduled date
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "my"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab("book")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "book"
                ? "bg-gov-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Book New
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: BOOK NEW APPOINTMENT */}
      {activeTab === "book" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Schedule Advance Office Visit
            </h2>
            <p className="text-xs text-slate-500">
              Appointments allow priority check-in on the selected date without early morning walk-in rush.
            </p>
          </div>

          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Department *
              </label>
              <select
                required
                value={selectedDept}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-gov-500"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Service *
              </label>
              <select
                required
                disabled={!selectedDept}
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-gov-500 disabled:opacity-50"
              >
                <option value="">
                  {selectedDept ? "-- Choose Service --" : "-- Select a Department First --"}
                </option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.averageServiceTime || 10} mins)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  min={minDateString}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-gov-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time Slot *
                </label>
                <select
                  required
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-gov-500"
                >
                  <option value="10:00 AM">10:00 AM – 11:00 AM</option>
                  <option value="11:30 AM">11:30 AM – 12:30 PM</option>
                  <option value="02:30 PM">02:30 PM – 03:30 PM</option>
                  <option value="04:00 PM">04:00 PM – 05:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Purpose / Application Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Document verification for certificate application..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-gov-500"
              ></textarea>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={bookingLoading}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gov-700 hover:bg-gov-800 disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-emerald-300" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("my")}
                className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MY APPOINTMENTS LIST */}
      {activeTab === "my" && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Appointments Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Schedule your visit in advance to avoid waiting hall congestion and get priority check-in.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("book")}
                className="px-5 py-2.5 rounded-xl bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs shadow-xs"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appointments.map((appt) => {
                const isBooked = appt.status === "booked" || appt.status === "confirmed";
                const isCheckedIn = appt.status === "checked_in";

                return (
                  <div
                    key={appt._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{appt.service?.name}</span>
                        <StatusBadge status={appt.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {appt.department?.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(appt.appointmentDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          <Clock className="w-3.5 h-3.5" />
                          {appt.appointmentTime || "10:00 AM"}
                        </span>
                      </div>

                      {appt.purpose && (
                        <p className="text-xs text-slate-500 italic">"{appt.purpose}"</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {isBooked && (
                        <>
                          <button
                            onClick={() => handleCheckIn(appt._id)}
                            disabled={actionLoading === appt._id}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            {actionLoading === appt._id ? (
                              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <Ticket className="w-3.5 h-3.5 text-amber-300" />
                            )}
                            <span>Check-in to Queue</span>
                          </button>

                          <button
                            onClick={() => handleCancel(appt._id)}
                            disabled={actionLoading === appt._id}
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {isCheckedIn && (
                        <Link
                          to="/citizen"
                          className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                        >
                          <span>Token Active</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
