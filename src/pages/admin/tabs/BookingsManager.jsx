import { useState, useEffect } from "react";
import {
  collection, getDocs, doc, updateDoc,
  query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

export default function BookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [expertInput, setExpertInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(list);
      setFiltered(list);
    } catch (e) {
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFiltered(bookings);
    } else {
      setFiltered(bookings.filter((b) => b.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const updateBooking = async (id, updates) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "bookings", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
      if (selected?.id === id) {
        setSelected((prev) => ({ ...prev, ...updates }));
      }
      showToast("Booking updated");
    } catch {
      showToast("Update failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const statusStyle = (status) => {
    if (status === "confirmed")
      return "bg-green-500/20 text-green-300 border-green-500/30";
    if (status === "cancelled")
      return "bg-red-500/20 text-red-300 border-red-500/30";
    return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg border ${
          toast.type === "error"
            ? "bg-red-500/20 text-red-300 border-red-500/30"
            : "bg-green-500/20 text-green-300 border-green-500/30"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Bookings Manager</h2>
        <p className="text-slate-400 text-sm mt-1">
          Review and manage all private tutor session requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Pending", value: stats.pending, color: "text-yellow-400" },
          { label: "Confirmed", value: stats.confirmed, color: "text-green-400" },
          { label: "Cancelled", value: stats.cancelled, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "confirmed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
              statusFilter === f
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No bookings found</div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase">
                  <th className="text-left px-5 py-4">Student</th>
                  <th className="text-left px-5 py-4">Skill</th>
                  <th className="text-left px-5 py-4 hidden md:table-cell">Date & Time</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-left px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-white font-medium">{b.userName}</div>
                      <div className="text-slate-400 text-xs">{b.userEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{b.skillTitle}</td>
                    <td className="px-5 py-4 hidden md:table-cell text-slate-400">
                      {b.preferredDate} · {b.preferredTime}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusStyle(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setSelected(b);
                          setExpertInput(b.assignedExpert || "");
                        }}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manage Modal */}
      {selected && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h3 className="text-white font-semibold">Manage Booking</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Student", value: selected.userName },
                  { label: "Email", value: selected.userEmail },
                  { label: "Skill", value: selected.skillTitle },
                  { label: "Requested", value: formatDate(selected.createdAt) },
                  { label: "Date", value: selected.preferredDate },
                  { label: "Time", value: selected.preferredTime },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-800/60 rounded-xl p-3">
                    <div className="text-slate-400 text-xs">{item.label}</div>
                    <div className="text-white mt-0.5 text-sm truncate">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Message */}
              {selected.message && (
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-1">Student Message</div>
                  <div className="text-slate-300 text-sm italic">"{selected.message}"</div>
                </div>
              )}

              {/* Assign Expert */}
              <div>
                <label className="text-slate-400 text-xs uppercase tracking-wide mb-2 block">
                  Assign Expert
                </label>
                <input
                  type="text"
                  placeholder="Expert name or email..."
                  value={expertInput}
                  onChange={(e) => setExpertInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Status Buttons */}
              <div>
                <label className="text-slate-400 text-xs uppercase tracking-wide mb-2 block">
                  Update Status
                </label>
                <div className="flex gap-2">
                  {["pending", "confirmed", "cancelled"].map((s) => (
                    <button
                      key={s}
                      disabled={actionLoading || selected.status === s}
                      onClick={() =>
                        updateBooking(selected.id, {
                          status: s,
                          assignedExpert: expertInput.trim() || null,
                        })
                      }
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${
                        selected.status === s
                          ? "bg-blue-600 border-blue-500 text-white cursor-default"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Expert only */}
              <button
                disabled={actionLoading}
                onClick={() =>
                  updateBooking(selected.id, {
                    assignedExpert: expertInput.trim() || null,
                  })
                }
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-all"
              >
                {actionLoading ? "Saving..." : "Save Expert Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}