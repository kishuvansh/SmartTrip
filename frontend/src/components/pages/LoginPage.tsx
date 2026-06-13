import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

export const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/dashboard');
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#00050A] flex items-center justify-center relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orbit-900/40 to-[#00050A]" />
            <div className="absolute inset-0 opacity-[0.02] bg-noise" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-sm"
            >
                <div className="bg-[#0A0F1C]/80 backdrop-blur-xl rounded-none border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-50" />

                    <div className="flex flex-col items-center mb-10">
                        <div className="p-3 bg-white/5 rounded-full mb-4 border border-white/5">
                            <ShieldCheck size={24} className="text-white/80" />
                        </div>
                        <h2 className="text-xl font-display font-medium text-white tracking-widest uppercase">Identity Verification</h2>
                    </div>

                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-sm text-red-400 text-xs text-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest ml-1">Official Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-orbit-500 group-focus-within:text-white transition-colors" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@orbit.travel"
                                    className="w-full bg-[#050A10] border border-white/10 rounded-sm px-12 py-3 text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-[#0A0F1C] transition-all font-mono placeholder:text-orbit-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest">Access Token</label>
                                <Link to="/forgot-password" className="text-[10px] text-orbit-400 hover:text-white transition-colors">Lost token?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-orbit-500 group-focus-within:text-white transition-colors" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#050A10] border border-white/10 rounded-sm px-12 py-3 text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-[#0A0F1C] transition-all font-mono placeholder:text-orbit-700"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black hover:bg-orbit-200 font-bold py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Authorize</span>
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
                                <span className="px-2 bg-[#0A0F1C]/80 text-orbit-500">Or continue with</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-[#050A10] border border-white/10 hover:bg-white/5 text-white font-medium py-3 rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span>Google ID</span>
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <Link to="/signup" className="text-xs text-orbit-400 hover:text-white transition-colors">
                            Need clearance? Create identity
                        </Link>
                    </div>

                </div>
            </motion.div>

        </div>
    );
};
