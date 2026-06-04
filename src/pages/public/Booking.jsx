// src/pages/public/Booking.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import PublicLayout from "../../components/layout/PublicLayout";

export default function Booking() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({
    skillId: "",
    skillTitle: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  useEffect(() => {
    const fetchSkills = async () => {
      const snap = await getDocs(collection(db, "skills"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSkills(list);
    };
    fetchSkills();
  }, []);

  const handleSkillChange = (e) => {
    const selected = skills.find((s) => s.id === e.target.value);
    setForm((prev) => ({
      ...prev,
      skillId: selected?.id || "",
      skillTitle: selected?.title || "",
    }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.skillId || !form.preferredDate || !form.preferredTime) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userName: userData?.displayName || user.displayName || "Student",
        userEmail: user.email,
        skillId: form.skillId,
        skillTitle: form.skillTitle,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        message: form.message.trim(),
        status: "pending",
        assignedExpert: null,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Minimum date = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-950 text-white py-16 px-4">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-medium mb-4">
              Private Tutoring
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Book a Live Tutor
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Request a one-on-one session with an expert tutor.
              Our team will confirm your session within 24 hours.
            </p>
          </div>

          {submitted ? (
            /* Success State */
            <div className="bg-slate-900/80 border border-green-500/30 rounded-2xl p-8 text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h2 className="text-xl font-bold text-white">Booking Requested!</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your session request for{" "}
                <span className="text-white font-medium">{form.skillTitle}</span>{" "}
                on{" "}
                <span className="text-white font-medium">
                  {form.preferredDate} at {form.preferredTime}
                </span>{" "}
                has been submitted. We'll confirm within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      skillId: "", skillTitle: "",
                      preferredDate: "", preferredTime: "", message: "",
                    });
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all"
                >
                  Book Another
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all"
                >
                  View My Bookings
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 md:p-8 space-y-5">

              {/* Skill Select */}
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Select Skill <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.skillId}
                  onChange={handleSkillChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/60 appearance-none"
                >
                  <option value="">— Choose a skill —</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">
                    Preferred Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={form.preferredDate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, preferredDate: e.target.value }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/60"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">
                    Preferred Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.preferredTime}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, preferredTime: e.target.value }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/60"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Message{" "}
                  <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell the tutor what you'd like to focus on..."
                  value={form.message}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/60 resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Request Session →"}
              </button>

              <p className="text-slate-500 text-xs text-center">
                We'll review your request and confirm within 24 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}