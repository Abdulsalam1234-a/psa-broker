import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  X,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, canClose = false }) => {
  const { login, registerUser, users, switchUserById, isAuthenticated } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+234');
  const [regPassword, setRegPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }

    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
      setTimeout(() => {
        if (onClose) onClose();
      }, 400);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setErrorMessage('All fields are required to register.');
      return;
    }

    const res = registerUser(regFullName, regEmail, regPhone, regPassword || 'password123');
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    }
  };

  const handleQuickDemoLogin = (userId: string) => {
    switchUserById(userId);
    setSuccessMessage('Logged in successfully!');
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-2xl shadow-2xl shadow-navy-950/80 overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 p-6 border-b border-navy-700/80 text-center">
          {canClose && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 shadow-lg shadow-gold-500/20 mb-3">
            <TrendingUp className="w-7 h-7 text-navy-950 font-black stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white font-sans">
            PSA <span className="text-gold-400">Broker</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            In Strategic Partnership with <span className="text-gold-300 font-semibold">Naira Stock Academy</span>
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-[11px] text-gold-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Authenticated Simulation & Institutional Academic Terminal</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-navy-950/60 border-b border-navy-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('LOGIN'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'LOGIN'
                ? 'bg-gold-500 text-navy-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In to Account
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('REGISTER'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'REGISTER'
                ? 'bg-gold-500 text-navy-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create New Account
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-bear/15 border border-bear/40 text-bear text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-bull/15 border border-bull/40 text-bull text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          {activeTab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address or Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. chidi.okafor@nairastock.edu.ng"
                    className="w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-gold-400 hover:underline cursor-pointer">
                    Demo default: password123
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-black text-sm shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Access PSA Broker Trading Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Babatunde Lawal"
                    className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="babatunde@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+2348012345678"
                    className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create password (optional for demo)"
                    className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-navy-800/80 border border-navy-700 text-[11px] text-slate-300">
                <span className="text-gold-400 font-semibold">Starter Benefit:</span> All new accounts automatically receive <strong className="text-white">₦1,000,000</strong> simulated practice capital and 100 Academy XP!
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-black text-sm shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Complete Registration & Open Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Personas 1-Click Login */}
          <div className="pt-4 border-t border-navy-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                Quick 1-Click Demo Persona
              </span>
              <span className="text-[10px] text-slate-500">Instant Switch</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-admin')}
                className="p-2 text-left rounded-xl bg-navy-950 hover:bg-navy-800 border border-purple-500/40 hover:border-purple-400 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">PSA Super Admin</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-200 border border-purple-500/50 font-mono">ADMIN</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">CRUD Users & Events</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-funke')}
                className="p-2 text-left rounded-xl bg-navy-950 hover:bg-navy-800 border border-gold-500/40 hover:border-gold-400 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold-300">Dr. Funke Adeyemi</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-gold-500/20 text-gold-300 border border-gold-500/40 font-mono">MGR</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">NairaStock Mentor</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-chidi')}
                className="p-2 text-left rounded-xl bg-navy-950 hover:bg-navy-800 border border-navy-700 hover:border-slate-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Chidi Okafor</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-navy-800 text-slate-300 border border-navy-600 font-mono">STUDENT</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">₦1.04M Portfolio (Active)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-amina')}
                className="p-2 text-left rounded-xl bg-navy-950 hover:bg-navy-800 border border-navy-700 hover:border-slate-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Amina Bello</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-navy-800 text-slate-300 border border-navy-600 font-mono">STUDENT</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">₦1.18M Portfolio (Rank 1)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-navy-950 px-6 py-2.5 border-t border-navy-800 text-center text-[10px] text-slate-400">
          © PSA Investment Property | In Strategic Partnership with Naira Stock Academy
        </div>

      </div>
    </div>
  );
};
