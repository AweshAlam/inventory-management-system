import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User"; // 👈 Import User model
import Link from "next/link";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
  ReceiptText, Package, TrendingUp, Calendar, 
  BarChart3, ArrowRight, LayoutDashboard, Activity, 
  Trophy, Store, Settings
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  await connectDB();
  const isConnected = mongoose.connection.readyState === 1;

  // 1. Fetch Logo directly from DB to prevent cookie bloat
  const dbUser = await User.findById(userId).select("shopLogo").lean();
  const shopLogo = dbUser?.shopLogo;

  // 2. Scoped Transaction Data
  const transactions = await Transaction.find({ owner: userId }).lean();

  // Revenue Calculations
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const dailyTotal = transactions
    .filter(tx => new Date(tx.timestamp) >= today)
    .reduce((acc, tx) => acc + (tx.total || 0), 0);

  const monthlyTotal = transactions
    .filter(tx => new Date(tx.timestamp) >= startOfMonth)
    .reduce((acc, tx) => acc + (tx.total || 0), 0);

  const itemCounts: Record<string, number> = {};
  transactions.forEach(tx => {
    tx.items.forEach((item: any) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });

  const topItems = Object.entries(itemCounts)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-12 min-h-screen bg-[#f8fafc]">
      
      {/* 1. TOP HEADER NAVIGATION CLUSTER */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-20 gap-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Store Logo Display */}
            {shopLogo && (
              <img src={shopLogo} alt="Logo" className="h-8 w-8 rounded-lg object-contain bg-white p-1 border border-slate-100 shadow-sm" />
            )}
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-100 bg-white shadow-sm">
              <LayoutDashboard size={14} className="text-blue-600" />
              <span className="font-black uppercase tracking-[0.2em] text-[9px] text-blue-600">Analytics_Hub</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 bg-white shadow-sm">
              <Store size={12} className="text-slate-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                {session?.user?.shopName || "Gulf Travels"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-green-100 bg-green-50/50 shadow-sm">
              <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <Activity size={12} className={isConnected ? "text-green-600" : "text-red-600"} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${isConnected ? "text-green-600" : "text-red-600"}`}>
                {isConnected ? 'DB_Online' : 'DB_Offline'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <LogoutButton />
            <h1 className="text-6xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">
              Stock_Command
            </h1>
          </div>
        </div>
        
        {/* 2. FLOATING ACTION CLUSTER */}
        <div className="flex flex-wrap items-center gap-4 pt-4 lg:pt-8">
          <Link href="/settings" className="p-6 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-full transition-all shadow-xl shadow-slate-200/40 active:scale-95 group">
            <Settings size={28} className="group-hover:rotate-90 transition-transform duration-500" />
          </Link>

          <Link href="/billing" className="group bg-blue-600 text-white pl-8 pr-6 py-6 rounded-[2.5rem] flex items-center gap-6 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95">
             <div className="flex items-center gap-4">
                <ReceiptText size={24} /> 
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 leading-none mb-1">Sales Terminal</p>
                  <p className="font-black text-lg tracking-tight">Open Billing</p>
                </div>
             </div>
             <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="/inventory" className="group bg-white text-slate-900 border border-slate-100 px-8 py-6 rounded-[2.5rem] flex items-center gap-4 hover:border-blue-400 transition-all shadow-xl shadow-slate-200/40 active:scale-95">
            <Package size={24} className="text-blue-500" /> 
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Warehouse</p>
              <p className="font-black text-lg tracking-tight">Manage Stock</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Daily Revenue Card */}
        <div className="bento-card bg-white border-slate-50 p-12 flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm min-h-[400px]">
          <div className="flex justify-between items-start">
            <div className="p-5 bg-green-50 text-green-600 rounded-[1.5rem]"><TrendingUp size={32} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Period: 24H</p>
          </div>
          <div>
            <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
              ${dailyTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Revenue Today</p>
          </div>
        </div>

        {/* Monthly Performance & Best Sellers */}
        <div className="bento-card bg-[#0a0f1d] text-white p-12 flex flex-col shadow-2xl shadow-blue-900/20 hover:scale-[1.02] transition-transform min-h-[400px]">
          <div className="flex justify-between items-start mb-16">
            <div className="p-5 bg-blue-600 text-white rounded-[1.5rem]"><Calendar size={32} /></div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Cycle: 30D</p>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-6xl font-black text-white tracking-tighter leading-none">
                ${monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-4">Monthly Performance</p>
            </div>
            <div className="pt-8 border-t border-slate-800">
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Trophy size={14} /> Best_Sellers
              </h4>
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-300 italic">{index + 1}. {item.name}</span>
                    <span className="bg-slate-800 px-2 py-1.5 rounded-lg text-[9px] font-black text-blue-400 uppercase">
                      {item.quantity} SOLD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sales Records Card */}
        <div className="bento-card bg-white border-slate-50 p-12 flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm min-h-[400px]">
          <div className="flex justify-between items-start">
            <div className="p-5 bg-purple-50 text-purple-600 rounded-[1.5rem]"><BarChart3 size={32} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Global_Scale</p>
          </div>
          <div>
            <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
              {transactions.length} Total Sales
            </h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Records Scoped to Shop</p>
          </div>
        </div>
      </div>
    </main>
  );
}