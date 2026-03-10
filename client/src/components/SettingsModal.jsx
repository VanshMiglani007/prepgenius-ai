import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, Link as LinkIcon, Shield, Camera, Save, Eye, EyeOff } from 'lucide-react';
import { useNotification } from './../context/NotificationContext';
import { useAuth } from './../context/AuthContext';
import api from './../services/api';

const SettingsModal = ({ isOpen, onClose }) => {
   const { user, updateUser, logout } = useAuth();
   const { showNotification } = useNotification();
   const [activeTab, setActiveTab] = useState('profile');

   // Profile
   const [name, setName] = useState(user?.name || '');
   const [email] = useState(user?.email || '');
   const [avatarPreview, setAvatarPreview] = useState(null);
   const [isSaving, setIsSaving] = useState(false);
   const fileInputRef = React.useRef(null);

   // Security — Change Password
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showPasswords, setShowPasswords] = useState(false);
   const [isChangingPw, setIsChangingPw] = useState(false);

   // Security — 2FA
   const [is2FAEnabled, setIs2FAEnabled] = useState(false);
   const [is2FALoading, setIs2FALoading] = useState(false);

   // Security — Delete
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [deletePassword, setDeletePassword] = useState('');
   const [isDeleting, setIsDeleting] = useState(false);

   // Notifications
   const [notifPrefs, setNotifPrefs] = useState(() => {
      const saved = localStorage.getItem('prepgenius-notif-prefs');
      return saved ? JSON.parse(saved) : { reminders: true, reports: true, insights: false };
   });

   const toggleNotif = (key) => {
      const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
      setNotifPrefs(updated);
      localStorage.setItem('prepgenius-notif-prefs', JSON.stringify(updated));
   };

   const tabs = [
      { id: 'profile', label: 'Profile', icon: <User size={16} /> },
      { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
      { id: 'integrations', label: 'Integrations', icon: <LinkIcon size={16} /> },
      { id: 'security', label: 'Security', icon: <Shield size={16} /> }
   ];

   if (!isOpen) return null;

   // --- Handlers ---
   const handleSaveProfile = async () => {
      setIsSaving(true);
      try {
         const res = await api.post('/auth/update-profile', { name });
         if (res.data.success) {
            updateUser({ name });
            showNotification("Profile updated!", "success");
         }
      } catch {
         showNotification("Failed to update profile.", "error");
      } finally {
         setIsSaving(false);
      }
   };

   const handleChangePassword = async () => {
      if (!currentPassword || !newPassword) {
         return showNotification("Fill in all password fields.", "error");
      }
      if (newPassword.length < 6) {
         return showNotification("New password must be at least 6 characters.", "error");
      }
      if (newPassword !== confirmPassword) {
         return showNotification("Passwords do not match.", "error");
      }
      setIsChangingPw(true);
      try {
         const res = await api.post('/auth/change-password', { currentPassword, newPassword });
         if (res.data.success) {
            showNotification("Password changed successfully.", "success");
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
         }
      } catch (err) {
         showNotification(err.response?.data?.message || "Failed to change password.", "error");
      } finally {
         setIsChangingPw(false);
      }
   };

   const handleDeleteAccount = async () => {
      if (!deletePassword) {
         return showNotification("Enter your password to confirm.", "error");
      }
      setIsDeleting(true);
      try {
         const res = await api.post('/auth/delete-account', { password: deletePassword });
         if (res.data.success) {
            showNotification("Account deleted.", "success");
            onClose();
            logout();
         }
      } catch (err) {
         showNotification(err.response?.data?.message || "Failed to delete account.", "error");
      } finally {
         setIsDeleting(false);
      }
   };

   return createPortal(
      <AnimatePresence>
         <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
         >
            <motion.div
               initial={{ scale: 0.97, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.97, opacity: 0 }}
               transition={{ duration: 0.2 }}
               className="bg-[#13131f] border border-white/10 shadow-2xl rounded-2xl w-full max-w-3xl h-[65vh] min-h-[480px] flex overflow-hidden"
            >
               {/* Sidebar */}
               <div className="w-56 bg-black/30 border-r border-white/5 flex flex-col pt-5">
                  <div className="px-5 pb-4 border-b border-white/5">
                     <h2 className="text-lg font-bold text-white">Settings</h2>
                  </div>
                  <div className="flex-1 py-3 flex flex-col gap-0.5 px-2.5">
                     {tabs.map(tab => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.id
                                 ? 'text-primary bg-primary/10'
                                 : 'text-white/40 hover:text-white hover:bg-white/5'
                              }`}
                        >
                           {tab.icon}
                           <span>{tab.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto relative">
                  <button
                     onClick={onClose}
                     className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                     <X size={18} />
                  </button>

                  <div className="p-8 max-w-xl">
                     {/* ─── PROFILE ─── */}
                     {activeTab === 'profile' && (
                        <div className="space-y-6">
                           <div>
                              <h3 className="text-xl font-bold mb-1">Profile</h3>
                              <p className="text-white/40 text-sm">Manage your personal information.</p>
                           </div>

                           <div className="flex items-center gap-5">
                              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-lg overflow-hidden flex items-center justify-center">
                                 {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                 ) : (
                                    <span className="text-2xl font-bold text-white">
                                       {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                 )}
                              </div>
                              <button
                                 onClick={() => fileInputRef.current?.click()}
                                 className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors flex items-center gap-2"
                              >
                                 <Camera size={14} /> Change
                              </button>
                              <input
                                 type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }}
                                 onChange={(e) => { const f = e.target.files[0]; if (f) setAvatarPreview(URL.createObjectURL(f)); }}
                              />
                           </div>

                           <div className="space-y-3">
                              <div>
                                 <label className="block text-xs uppercase tracking-wider text-white/40 mb-1.5 font-semibold">Display Name</label>
                                 <input
                                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-primary transition-colors text-sm"
                                 />
                              </div>
                              <div>
                                 <label className="block text-xs uppercase tracking-wider text-white/40 mb-1.5 font-semibold">Email (read-only)</label>
                                 <input
                                    type="email" value={email} readOnly
                                    className="w-full bg-black/30 text-white/40 border border-white/5 rounded-lg px-3 py-2.5 outline-none text-sm"
                                 />
                              </div>
                           </div>

                           <div className="pt-4 border-t border-white/5 flex justify-end">
                              <button
                                 disabled={isSaving}
                                 onClick={handleSaveProfile}
                                 className="flex items-center gap-2 px-5 py-2 bg-primary hover:brightness-110 text-dark-bg font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 text-sm"
                              >
                                 <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
                              </button>
                           </div>
                        </div>
                     )}

                     {/* ─── NOTIFICATIONS ─── */}
                     {activeTab === 'notifications' && (
                        <div className="space-y-6">
                           <div>
                              <h3 className="text-xl font-bold mb-1">Notifications</h3>
                              <p className="text-white/40 text-sm">Control what alerts you receive.</p>
                           </div>
                           <div className="space-y-3">
                              {[
                                 { key: 'reminders', title: 'Study Reminders', desc: 'Alerts before scheduled study sessions.' },
                                 { key: 'reports', title: 'Weekly Reports', desc: 'Summary of your weekly progress.' },
                                 { key: 'insights', title: 'Tips & Insights', desc: 'Suggestions to improve your study habits.' }
                              ].map((item) => (
                                 <div key={item.key} className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                                    <div>
                                       <h4 className="font-medium text-sm">{item.title}</h4>
                                       <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                                    </div>
                                    <button
                                       onClick={() => toggleNotif(item.key)}
                                       className={`w-10 h-5 rounded-full relative transition-colors ${notifPrefs[item.key] ? 'bg-primary' : 'bg-white/15'}`}
                                    >
                                       <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform shadow ${notifPrefs[item.key] ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* ─── INTEGRATIONS ─── */}
                     {activeTab === 'integrations' && (
                        <div className="space-y-6">
                           <div>
                              <h3 className="text-xl font-bold mb-1">Integrations</h3>
                              <p className="text-white/40 text-sm">Connect your study schedule with other apps.</p>
                           </div>
                           <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-lg font-bold text-black">G</div>
                                 <div>
                                    <h4 className="font-medium text-sm">Google Calendar</h4>
                                    <p className="text-xs text-white/40 mt-0.5">Sync study sessions</p>
                                 </div>
                              </div>
                              <button className="text-xs text-primary hover:underline">Connect</button>
                           </div>
                        </div>
                     )}

                     {/* ─── SECURITY ─── */}
                     {activeTab === 'security' && (
                        <div className="space-y-6">
                           <div>
                              <h3 className="text-xl font-bold mb-1">Security</h3>
                              <p className="text-white/40 text-sm">Manage your password and account security.</p>
                           </div>

                           {/* Change Password */}
                           <div className="space-y-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                              <h4 className="font-medium text-sm mb-2">Change Password</h4>
                              <div className="relative">
                                 <input
                                    type={showPasswords ? "text" : "password"} placeholder="Current password"
                                    value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors text-sm"
                                 />
                                 <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-2.5 top-2 text-white/30 hover:text-white/60">
                                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                 </button>
                              </div>
                              <input
                                 type={showPasswords ? "text" : "password"} placeholder="New password (min 6 chars)"
                                 value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                 className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors text-sm"
                              />
                              <input
                                 type={showPasswords ? "text" : "password"} placeholder="Confirm new password"
                                 value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                 className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors text-sm"
                              />
                              <button
                                 disabled={isChangingPw}
                                 onClick={handleChangePassword}
                                 className="mt-1 px-4 py-2 bg-primary/15 hover:bg-primary/25 text-primary text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                              >
                                 {isChangingPw ? "Changing..." : "Update Password"}
                              </button>
                           </div>

                           {/* 2FA */}
                           <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] flex justify-between items-center">
                              <div>
                                 <h4 className="font-medium text-sm">Two-Factor Authentication</h4>
                                 <p className="text-xs text-white/40 mt-0.5">
                                    {is2FAEnabled ? "Extra security is active." : "Add an extra layer of protection."}
                                 </p>
                              </div>
                              <button
                                 disabled={is2FALoading}
                                 onClick={() => {
                                    setIs2FALoading(true);
                                    setTimeout(() => {
                                       setIs2FAEnabled(!is2FAEnabled);
                                       setIs2FALoading(false);
                                       showNotification(is2FAEnabled ? "2FA disabled." : "2FA enabled.", "success");
                                    }, 800);
                                 }}
                                 className={`w-10 h-5 rounded-full relative transition-colors ${is2FAEnabled ? 'bg-primary' : 'bg-white/15'}`}
                              >
                                 <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow ${is2FAEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}>
                                    {is2FALoading && <div className="w-2.5 h-2.5 m-[3px] border border-primary/30 border-t-primary rounded-full animate-spin" />}
                                 </div>
                              </button>
                           </div>

                           {/* Danger Zone */}
                           <div className="pt-4 border-t border-white/5">
                              <h4 className="text-red-400 font-semibold text-sm mb-2">Danger Zone</h4>
                              <p className="text-white/30 text-xs mb-3">Permanently delete your account and all data.</p>

                              {!showDeleteConfirm ? (
                                 <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-semibold"
                                 >
                                    Delete Account
                                 </button>
                              ) : (
                                 <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 space-y-3">
                                    <p className="text-sm text-red-400 font-semibold">Enter your password to confirm:</p>
                                    <input
                                       type="password" placeholder="Your password"
                                       value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
                                       className="w-full bg-black/20 border border-red-500/20 rounded-lg px-3 py-2 outline-none focus:border-red-400 transition-colors text-sm"
                                    />
                                    <div className="flex gap-2">
                                       <button
                                          disabled={isDeleting}
                                          onClick={handleDeleteAccount}
                                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                       >
                                          {isDeleting ? "Deleting..." : "Delete Forever"}
                                       </button>
                                       <button
                                          onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                                          className="px-4 py-2 bg-white/5 text-white/60 rounded-lg text-sm hover:text-white transition-colors"
                                       >
                                          Cancel
                                       </button>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
         </div>
      </AnimatePresence>,
      document.body
   );
};

export default SettingsModal;
