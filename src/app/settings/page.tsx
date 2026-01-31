"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "@/app/actions/settings";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, Store, Lock, Image as ImageIcon, 
  Save, ArrowLeft, User, CheckCircle2, AlertCircle 
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  // 1. Session Management
  const { data: session, update } = useSession();
  
  // 2. Local State
  const [logo, setLogo] = useState<string>("");
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Sync logo with session data on load
  useEffect(() => {
    if (session?.user?.shopLogo) {
      setLogo(session.user.shopLogo);
    }
  }, [session]);

  // 3. Optimized Image Handler (Prevents CLIENT_FETCH_ERROR)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 200; // Keep payload small
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to optimized WebP format
        const optimizedBase64 = canvas.toDataURL("image/webp", 0.8); 
        setLogo(optimizedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 4. Submission Logic
  async function handleForm(formData: FormData) {
    setIsPending(true);
    setStatus(null);

    // Attach optimized logo to payload
    formData.set("shopLogo", logo);

    const result = await updateProfile(formData);

    if (result.success) {
      // Force refresh the client session to reflect changes in Header
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.get("name"),
          shopName: formData.get("shopName"),
          shopLogo: logo
        }
      });

      setStatus({ type: 'success', msg: "Command configuration synchronized successfully." });
    } else {
      setStatus({ type: 'error', msg: result.error || "Update rejected by system." });
    }
    setIsPending(false);
  }

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 min-h-screen bg-[#f8fafc]">
      {/* Navigation Badge */}
      <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] mb-8 transition-all group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back_to_Command
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-white"
      >
        <header className="mb-12">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Settings size={18} />
            <span className="font-black uppercase tracking-[0.3em] text-[10px]">System_Config</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">Store_Profile</h1>
        </header>

        {/* Status Toast */}
        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className={`mb-10 p-5 rounded-[2rem] flex items-center gap-3 border ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{status.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form action={handleForm} className="space-y-12">
          {/* Logo Branding */}
          <div className="flex flex-col md:flex-row gap-10 items-center bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
            <div className="w-32 h-32 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner relative">
              {logo ? (
                <img src={logo} className="w-full h-full object-cover" alt="Shop Logo" />
              ) : (
                <ImageIcon className="text-slate-300" size={32} />
              )}
            </div>
            <div className="flex-grow space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block ml-1">Receipt Branding (Logo)</label>
              {/* Flattened ClassName string to prevent hydration errors */}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoChange} 
                className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer" 
              />
              <p className="text-[9px] text-slate-400 font-medium ml-1 italic">* Auto-optimized to WebP format for performance.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Operator Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3">Operator Name</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  name="name" 
                  defaultValue={session?.user?.name || ""} 
                  required 
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 rounded-[2.5rem] outline-none border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all font-bold text-slate-800" 
                />
              </div>
            </div>

            {/* Shop Identity */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3">Shop/Clinic Identity</label>
              <div className="relative">
                <Store className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  name="shopName" 
                  defaultValue={session?.user?.shopName || ""} 
                  required 
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 rounded-[2.5rem] outline-none border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all font-bold text-slate-800" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3">Security Key (New Password)</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                name="password" 
                type="password" 
                placeholder="Leave blank to maintain current credentials" 
                className="w-full pl-16 pr-6 py-6 bg-slate-50 rounded-[2.5rem] outline-none border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all font-bold text-slate-800" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-slate-900 text-white py-7 rounded-[3rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Syncing_Configuration..." : <><Save size={18} /> Commit_Configuration</>}
          </button>
        </form>
      </motion.div>
    </main>
  );
}