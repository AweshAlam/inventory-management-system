"use client";

import { registerShopkeeper } from "@/app/actions/auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Store, Mail, Lock, User, ArrowRight, Image as ImageIcon, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  // Optimized Logo Handler to prevent CLIENT_FETCH_ERROR
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 200; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        // Optimize to WebP to keep the payload under 4KB
        setLogo(canvas.toDataURL("image/webp", 0.7)); 
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    // Attach the optimized logo string to the server action
    formData.set("shopLogo", logo); 
    
    const result = await registerShopkeeper(formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl p-12 shadow-2xl rounded-[3.5rem] border border-white"
      >
        <header className="mb-10">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <UserPlus size={18} />
            <span className="font-black uppercase tracking-[0.3em] text-[10px]">Onboarding_Console</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Register_Command
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Initialize your medical station</p>
        </header>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 border border-red-100"
            >
              <AlertCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form action={handleSubmit} className="space-y-6">
          {/* LOGO UPLOAD COMPONENT */}
          <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
            <div className="w-20 h-20 rounded-3xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {logo ? <img src={logo} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon className="text-slate-300" size={24} />}
            </div>
            <div className="flex-grow">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2 ml-1">Store Branding (Logo)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoChange} 
                className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:font-black file:bg-blue-600 file:text-white cursor-pointer transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3">Operator Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input name="name" required placeholder="John Doe" className="w-full pl-14 pr-4 py-4 bg-slate-50 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all border-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3">Shop/Clinic Name</label>
              <div className="relative">
                <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input name="shopName" required placeholder="City Medics" className="w-full pl-14 pr-4 py-4 bg-slate-50 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all border-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3">Email Identity</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input name="email" type="email" required placeholder="admin@medcommand.com" className="w-full pl-14 pr-4 py-4 bg-slate-50 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all border-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input name="password" type="password" required placeholder="••••••••" className="w-full pl-14 pr-4 py-4 bg-slate-50 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all border-none" />
            </div>
          </div>

          <button 
            disabled={isPending}
            className="group w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] mt-4 flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isPending ? "Initializing_System..." : <>Complete Registration <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <footer className="mt-10 text-center pt-8 border-t border-slate-50">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Already registered? <Link href="/login" className="text-blue-600 hover:underline">Access_Login</Link>
          </p>
        </footer>
      </motion.div>
    </main>
  );
}