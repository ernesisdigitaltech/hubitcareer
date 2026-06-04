import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  const statusStyle = (status) => {
    if (status === "confirmed")
      return "bg-green-500/20 text-green-300 border-green-500/30";
    if (status === "cancelled")
      return "bg-red-500/20 text-red-300 border-red-500/30";
    return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Bookings</h2>
          <p className="text-slate-400 text-sm mt-1">
            Your private tutor session requests
          </p>
        </div>
        <button
          onClick={() => navigate("/booking")}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all"
        >
          + New Booking
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : bookings.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 space-y-4">
          <div className="text-5xl">📅</div>
          <p className="text-slate-400">You haven't booked a session yet.</p>
          <button
            onClick={() => navigate("/booking")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            Book a Tutor
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="text-white font-semibold text-base">
                    {b.skillTitle}
                  </div>
                  <div className="text-slate-400 text-sm">
                    📅 {b.preferredDate} &nbsp;·&nbsp; ⏰ {b.preferredTime}
                  </div>
                  {b.assignedExpert && (
                    <div className="text-blue-400 text-sm">
                      👤 Expert: {b.assignedExpert}
                    </div>
                  )}
                  {b.message && (
                    <div className="text-slate-500 text-xs mt-2 italic">
                      "{b.message}"
                    </div>
                  )}
                  <div className="text-slate-600 text-xs">
                    Requested: {formatDate(b.createdAt)}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border capitalize flex-shrink-0 ${statusStyle(b.status)}`}
                >
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
