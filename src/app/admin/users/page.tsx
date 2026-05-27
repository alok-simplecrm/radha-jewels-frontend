'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Key, ShieldAlert, Plus, Edit2, Trash2, X, Search, 
  Shield, CheckCircle, AlertTriangle, Monitor, Globe, Clock, ShieldCheck
} from 'lucide-react';
import apiClient from '../../../lib/api-client';
import { useAuthStore } from '../../../store/useAuthStore';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'admin' | 'staff' | 'user';
  isActive: boolean;
  createdAt: string;
}

interface UserSession {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'sessions'>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'staff' as 'admin' | 'staff',
  });

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    role: 'user' as 'admin' | 'staff' | 'user',
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, sessionsRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/users/sessions')
      ]);
      setUsers(usersRes.data);
      setSessions(sessionsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user directory & active sessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/users/admin', addForm);
      setSuccess('Staff member added successfully!');
      setIsAddStaffOpen(false);
      // Reset form
      setAddForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'staff',
      });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create staff member.');
    }
  };

  const handleEditUserClick = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditForm({
      firstName: userToEdit.firstName || '',
      lastName: userToEdit.lastName || '',
      role: userToEdit.role,
      isActive: userToEdit.isActive,
    });
    setIsEditUserOpen(true);
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError('');
    setSuccess('');
    try {
      await apiClient.patch(`/users/${selectedUser.id}`, editForm);
      setSuccess('User profile updated successfully!');
      setIsEditUserOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user profile.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError('You cannot delete your own account.');
      return;
    }
    if (!confirm('Are you sure you want to delete this user? This will delete all their details and revoke all active sessions.')) return;
    setError('');
    setSuccess('');
    try {
      await apiClient.delete(`/users/${userId}`);
      setSuccess('User deleted successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session? The user will be logged out immediately.')) return;
    setError('');
    setSuccess('');
    try {
      await apiClient.delete(`/users/sessions/${sessionId}`);
      setSuccess('User session revoked successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke session.');
    }
  };

  // Helper to parse user-agent strings
  const getBrowserDetails = (ua: string | null) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) return 'Google Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Apple Safari';
    if (ua.includes('Firefox')) return 'Mozilla Firefox';
    if (ua.includes('Edg')) return 'Microsoft Edge';
    if (ua.includes('PostmanRuntime')) return 'Postman App';
    return ua.split(' ')[0] || 'Web Browser';
  };

  const getOSDetails = (ua: string | null) => {
    if (!ua) return 'Unknown OS';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Macintosh') || ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Other';
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = u.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(search) || email.includes(search);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-gold-500" />
            Users & Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage administrative staff permissions and monitor logged-in devices in real-time.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-all hover:scale-[1.02] flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-gold-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="h-4 w-4" />
          User Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'border-gold-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Key className="h-4 w-4" />
          Active Sessions ({sessions.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
        </div>
      ) : activeTab === 'users' ? (
        /* --- Directory Tab --- */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:border-gold-500 outline-none text-sm bg-slate-50/50"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="staff">Staff</option>
              <option value="user">Customer</option>
            </select>
          </div>

          {/* Directory Table */}
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Joined At</th>
                    {currentUser?.role === 'admin' && <th className="px-6 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium bg-slate-50/10">
                        No users found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {`${u.firstName || ''} ${u.lastName || ''}`.trim() || <span className="text-slate-400 italic">Not set</span>}
                          {u.id === currentUser?.id && (
                            <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200/80">You</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            u.role === 'admin' ? 'text-red-700 bg-red-50 border border-red-150 px-2.5 py-0.5 rounded-full' :
                            u.role === 'staff' ? 'text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 rounded-full' :
                            'text-slate-600 bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded-full'
                          }`}>
                            {u.role === 'admin' && <Shield className="h-3.5 w-3.5" />}
                            {u.role === 'staff' && <ShieldCheck className="h-3.5 w-3.5" />}
                            <span className="capitalize">{u.role === 'admin' ? 'Administrator' : u.role}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        
                        {currentUser?.role === 'admin' && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => handleEditUserClick(u)}
                                className="p-1.5 text-slate-400 hover:text-gold-600 hover:bg-slate-100 rounded-lg transition-all"
                                title="Edit permissions/profile"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={u.id === currentUser?.id}
                                className={`p-1.5 rounded-lg transition-all ${
                                  u.id === currentUser?.id 
                                    ? 'text-slate-200 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-red-600 hover:bg-slate-100'
                                }`}
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* --- Sessions Tab --- */
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Device / Browser</th>
                    <th className="px-6 py-3.5">IP Address</th>
                    <th className="px-6 py-3.5">Login Time</th>
                    <th className="px-6 py-3.5">Last Active</th>
                    {currentUser?.role === 'admin' && <th className="px-6 py-3.5 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium bg-slate-50/10">
                        No active login sessions recorded.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/30">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {s.user ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() || s.user.email : 'Unknown'}
                            {s.userId === currentUser?.id && (
                              <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200/80">This device</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{s.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-800 font-medium">
                            <Monitor className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            {getBrowserDetails(s.userAgent)}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{getOSDetails(s.userAgent)}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-slate-400" />
                            {s.ipAddress || 'Unknown IP'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(s.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(s.updatedAt).toLocaleString()}
                        </td>
                        
                        {currentUser?.role === 'admin' && (
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRevokeSession(s.id)}
                              className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-[1.01]"
                              title="Revoke session"
                            >
                              Revoke
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD STAFF MODAL --- */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-950">Add Administrative Staff</h2>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStaffSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={addForm.firstName}
                  onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                  placeholder="e.g. Alok"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={addForm.lastName}
                  onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                  placeholder="e.g. Rawat"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. staff@shivayejewels.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Enter a secure password (min 6 chars)"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">System Role</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: 'staff' })}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      addForm.role === 'staff'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: 'admin' })}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      addForm.role === 'admin'
                        ? 'border-red-600 bg-red-50/50 text-red-700 ring-1 ring-red-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Administrator
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {isEditUserOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-950">Edit Profile & Permissions</h2>
              <button
                onClick={() => {
                  setIsEditUserOpen(false);
                  setSelectedUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditUserSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                <div className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-150 px-4 py-2.5 rounded-xl">
                  {selectedUser.email}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  placeholder="First name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  placeholder="Last name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                />
              </div>

              {/* Prevent editing own role */}
              {selectedUser.id !== currentUser?.id ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assigned Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-gold-500 outline-none text-sm bg-white"
                  >
                    <option value="user">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Role</label>
                  <div className="text-sm font-bold text-red-600 bg-red-50 border border-red-150 px-4 py-2.5 rounded-xl capitalize">
                    {selectedUser.role} (Cannot modify your own system role)
                  </div>
                </div>
              )}

              {/* Prevent deactivating self */}
              {selectedUser.id !== currentUser?.id ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Account Active</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Toggle active status to enable or block portal access.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editForm.isActive ? 'bg-green-600' : 'bg-slate-350'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editForm.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-250 rounded-2xl text-xs text-yellow-800 flex gap-2">
                  <ShieldAlert className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <p>For safety reasons, you cannot deactivate your own administrative user account.</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditUserOpen(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
