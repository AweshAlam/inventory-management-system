"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, LayoutDashboard, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Capture external errors (like Middleware redirects)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "CredentialsSignin") {
      setError("Invalid email identity or security key.");
    } else if (urlError) {
      setError("Authentication failed. Please check your connection.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 2. Execute Auth with explicit redirect control
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(), // Normalize input
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific failure
        setError("Login Rejected: Incorrect credentials or unauthorized shop.");
        setLoading(false);
      } else {
        // 3. Success: Force refresh and redirect
        // Using window.location instead of router.push can sometimes solve 
        // Vercel session propagation issues.
        window.location.href = "/";
      }
    } catch (err) {
      setError("System_Error: Failed to reach Security_Gateway.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md p-12 shadow-2xl rounded-[4rem] border border-white"
      >
        <header className="mb-10">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ShieldCheck size={18} />
            <span className="font-black uppercase tracking-[0.3em] text-[10px]">Security_Gateway</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
            Command_Login
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Access your medical management hub.</p>
        </header>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-5 bg-red-50 text-red-600 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-3"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3">Email Identity</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@medcommand.com" 
                className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-[2.5rem] outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 font-bold transition-all border-none text-slate-800" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-[2.5rem] outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 font-bold transition-all border-none text-slate-800" 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="group w-full bg-slate-900 text-white py-6 rounded-[3rem] font-black uppercase tracking-[0.2em] text-[10px] mt-6 flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying_Identity..." : (
              <>
                Initialize Dashboard 
                <LayoutDashboard size={18} className="group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </form>

        <footer className="mt-12 text-center pt-8 border-t border-slate-50">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            New shopkeeper? <Link href="/register" className="text-blue-600 hover:underline">Register_Account</Link>
          </p>
        </footer>
      </motion.div>
    </main>
  );
}