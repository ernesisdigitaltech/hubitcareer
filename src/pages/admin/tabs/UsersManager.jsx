import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

const ROLES = ["student", "expert", "admin"];

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
      setFiltered(list);
    } catch (e) {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    experts: users.filter((u) => u.role === "expert").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, role: newRole }));
      }
      showToast(`Role updated to ${newRole}`);
    } catch {
      showToast("Failed to update role", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBan = async (userId, currentBanned) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "users", userId), { banned: !currentBanned });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, banned: !currentBanned } : u
        )
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => ({ ...prev, banned: !currentBanned }));
      }
      showToast(`User ${!currentBanned ? "banned" : "unbanned"}`);
    } catch {
      showToast("Failed to update ban status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setConfirmDelete(null);
      setSelectedUser(null);
      showToast("User deleted");
    } catch {
      showToast("Failed to delete user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const roleColor = (role) => {
    if (role === "admin") return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    if (role === "expert") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg border ${
            toast.type === "error"
              ? "bg-red-500/20 text-red-300 border-red-500/30"
              : "bg-green-500/20 text-green-300 border-green-500/30"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Users Manager</h2>
        <p className="text-slate-400 text-sm mt-1">
          View, manage roles, and moderate all registered users
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total, color: "text-white" },
          { label: "Students", value: stats.students, color: "text-slate-300" },
          { label: "Experts", value: stats.experts, color: "text-blue-400" },
          { label: "Admins", value: stats.admins, color: "text-purple-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50"
        />
        <div className="flex gap-2 flex-wrap">
          {["all", "student", "expert", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                roleFilter === r
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading users...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No users found</div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase">
                  <th className="text-left px-5 py-4">User</th>
                  <th className="text-left px-5 py-4">Role</th>
                  <th className="text-left px-5 py-4 hidden md:table-cell">Joined</th>
                  <th className="text-left px-5 py-4 hidden lg:table-cell">Status</th>
                  <th className="text-left px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(user.displayName || user.email || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium leading-tight">
                            {user.displayName || "—"}
                          </div>
                          <div className="text-slate-400 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${roleColor(user.role)}`}
                      >
                        {user.role || "student"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-slate-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          user.banned
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : "bg-green-500/20 text-green-300 border-green-500/30"
                        }`}
                      >
                        {user.banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedUser(user)}
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h3 className="text-white font-semibold">Manage User</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Avatar + Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {(selectedUser.displayName || selectedUser.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">
                    {selectedUser.displayName || "No Name"}
                  </div>
                  <div className="text-slate-400 text-sm">{selectedUser.email}</div>
                  {selectedUser.phone && (
                    <div className="text-slate-500 text-xs">{selectedUser.phone}</div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-slate-400 text-xs">Joined</div>
                  <div className="text-white mt-0.5">{formatDate(selectedUser.createdAt)}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-slate-400 text-xs">Status</div>
                  <div className={`mt-0.5 font-medium ${selectedUser.banned ? "text-red-400" : "text-green-400"}`}>
                    {selectedUser.banned ? "Banned" : "Active"}
                  </div>
                </div>
              </div>

              {/* Change Role */}
              <div>
                <label className="text-slate-400 text-xs uppercase tracking-wide mb-2 block">
                  Change Role
                </label>
                <div className="flex gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      disabled={actionLoading || selectedUser.role === r}
                      onClick={() => handleRoleChange(selectedUser.id, r)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${
                        selectedUser.role === r
                          ? "bg-blue-600 border-blue-500 text-white cursor-default"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => handleToggleBan(selectedUser.id, selectedUser.banned)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedUser.banned
                      ? "bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                      : "bg-yellow-600/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/30"
                  }`}
                >
                  {selectedUser.banned ? "Unban User" : "Ban User"}
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => setConfirmDelete(selectedUser)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30 transition-all"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-white font-bold text-lg">Delete User?</h3>
            <p className="text-slate-400 text-sm">
              This will permanently delete{" "}
              <span className="text-white font-medium">
                {confirmDelete.displayName || confirmDelete.email}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm transition-all"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all"
              >
                {actionLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}