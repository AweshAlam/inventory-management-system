import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import BentoGridClient from "@/components/BentoGridClient";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ArrowLeft, PackagePlus, ShieldCheck } from "lucide-react";

export default async function InventoryPage() {
  // 1. Identify the Shopkeeper
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  await connectDB();

  // 2. Multi-tenant Fetch: Only retrieve products owned by this user
  const products = await Product.find({ owner: userId })
    .sort({ createdAt: -1 })
    .lean();

  const serializedProducts = JSON.parse(JSON.stringify(products));

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-12 min-h-screen bg-[#f8fafc]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] mb-4 transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back_to_Command
          </Link>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 flex items-center gap-3">
            <PackagePlus className="text-blue-600" size={32} /> Warehouse_Manager
          </h2>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticated_User</p>
            <p className="text-sm font-bold text-slate-700">{session?.user?.name || "Unknown_Operator"}</p>
          </div>
        </div>
      </div>

      <BentoGridClient initialProducts={serializedProducts} />
    </main>
  );
}