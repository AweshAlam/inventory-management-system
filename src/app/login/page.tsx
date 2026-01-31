"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, LayoutDashboard, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // NextAuth login attempt
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent automatic reload so we can handle errors
    });

    if (result?.error) {
      setError("Invalid email or security key.");
      setLoading(false);
    } else {
      router.push("/"); // Securely redirect to dashboard
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bento-card bg-white w-full max-w-md p-12 shadow-2xl rounded-[4rem] border border-white"
      >
        <header className="mb-10">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ShieldCheck size={18} />
            <span className="font-black uppercase tracking-[0.3em] text-[10px]">Security_Gateway</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
            Command_Login
          </h1>
          <p className="text-slate-400 text-sm mt-2">Access your medical management hub.</p>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Email Identity</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@medcommand.com" 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/5 font-bold transition-all border-none" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/5 font-bold transition-all border-none" 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="group w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs mt-6 flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Initialize Dashboard"} 
            {!loading && <LayoutDashboard size={18} className="group-hover:rotate-12 transition-transform" />}
          </button>
        </form>

        <footer className="mt-12 text-center pt-8 border-t border-slate-50">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            New shopkeeper? <Link href="/register" className="text-blue-600 hover:underline">Register_Account</Link>
          </p>
        </footer>
      </motion.div>
    </main>
  );
}