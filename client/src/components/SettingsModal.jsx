import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, Link as LinkIcon, CreditCard, Shield } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'integrations', label: 'Integrations', icon: <LinkIcon size={16} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> }
  ];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
          className="bg-[#1a1a2e] border border-white/10 shadow-2xl rounded-2xl w-full max-w-4xl h-[70vh] min-h-[500px] flex overflow-hidden relative"
        >
          {/* Sidebar */}
          <div className="w-64 bg-black/20 border-r border-white/5 flex flex-col pt-6">
             <div className="px-6 pb-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white tracking-wide">Settings</h2>
             </div>
             <div className="flex-1 py-4 flex flex-col gap-1 px-3">
               {tabs.map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                     activeTab === tab.id 
                       ? 'bg-primary/10 text-primary' 
                       : 'text-white/50 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   {tab.icon}
                   {tab.label}
                 </button>
               ))}
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto relative bg-[#151525]">
             <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
             >
                <X size={20} />
             </button>

             <div className="p-10 max-w-2xl">
                {activeTab === 'profile' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div>
                        <h3 className="text-2xl font-bold mb-2">Public Profile</h3>
                        <p className="text-white/50 text-sm">Manage your personal information and how it appears across the platform.</p>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                           Change Avatar
                        </button>
                     </div>
                     <div className="space-y-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-semibold">Display Name</label>
                          <input type="text" defaultValue={user?.name || ''} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors hover:border-white/20" />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2 font-semibold">Email Address</label>
                          <input type="email" defaultValue={user?.email || ''} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors hover:border-white/20" />
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div>
                        <h3 className="text-2xl font-bold mb-2">Notification Preferences</h3>
                        <p className="text-white/50 text-sm">Control what alerts you receive and how they are delivered.</p>
                     </div>
                     <div className="space-y-4">
                        {[
                          { title: 'Study Reminders', desc: 'Get alerted 15 minutes before exactly scheduled study sessions.' },
                          { title: 'Weekly Reports', desc: 'Receive an email every Sunday with your productivity analytics.' },
                          { title: 'AI Insights', desc: 'Occasional pushes from your AI assistant on restructuring.' }
                        ].map((item, idx) => (
                           <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                              <div>
                                <h4 className="font-semibold">{item.title}</h4>
                                <p className="text-sm text-white/50 mt-1">{item.desc}</p>
                              </div>
                              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                                <div className="w-4 h-4 rounded-full bg-dark-bg absolute right-1 top-1"></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </motion.div>
                )}

                {activeTab === 'integrations' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div>
                        <h3 className="text-2xl font-bold mb-2">Connected Accounts</h3>
                        <p className="text-white/50 text-sm">Sync your study schedule automatically with third-party calendars.</p>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl font-bold text-black border border-white/20 shadow-md">G</div>
                               <div>
                                 <h4 className="font-bold">Google Calendar</h4>
                                 <p className="text-xs text-green-400 mt-1">Connected</p>
                               </div>
                            </div>
                            <button className="text-sm text-white/50 hover:text-white transition-colors">Disconnect</button>
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeTab === 'billing' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div>
                        <h3 className="text-2xl font-bold mb-2">Plan & Billing</h3>
                        <p className="text-white/50 text-sm">Manage your subscription and payment methods.</p>
                     </div>
                     <div className="p-6 bg-gradient-to-br from-primary/20 to-indigo-500/10 border border-primary/30 rounded-2xl relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full"></div>
                        <h4 className="text-primary font-bold uppercase tracking-wider text-xs mb-2">Current Plan</h4>
                        <h2 className="text-3xl font-bold mb-1">Pro Scholar</h2>
                        <p className="text-white/70 text-sm mb-6">Unlimited AI requests and advanced analytics.</p>
                        <button className="px-5 py-2.5 bg-primary text-dark-bg font-bold rounded-lg shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:scale-105 transition-transform">
                          Manage Subscription
                        </button>
                     </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div>
                        <h3 className="text-2xl font-bold mb-2">Security</h3>
                        <p className="text-white/50 text-sm">Update your password and secure your account.</p>
                     </div>
                     <div className="space-y-4">
                        <button className="w-full text-left p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-colors font-medium">
                           Change Password
                        </button>
                        <button className="w-full text-left p-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-colors font-medium">
                           Enable Two-Factor Authentication (2FA)
                        </button>
                        <button className="w-full text-left p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors font-medium mt-8">
                           Delete Account Permanently
                        </button>
                     </div>
                  </motion.div>
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
