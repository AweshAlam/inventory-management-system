"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Trash2, Edit3, X, Save, Plus, 
  Wallet, AlertCircle, Search, DollarSign,
  PackagePlus, Layers
} from "lucide-react";
import { addProduct, deleteProduct, editProduct } from "@/app/actions/inventory";

interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  status: string;
}

export default function BentoGridClient({ initialProducts }: { initialProducts: Product[] }) {
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Logic: Calculate total inventory value
  const totalValue = initialProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  // Logic: Filter products based on search
  const filteredProducts = initialProducts.filter(p => 
    (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (p.sku?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* --- CARD 1: FINANCIAL OVERVIEW --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bento-card md:col-span-1 bg-blue-600 text-white flex flex-col justify-between shadow-2xl shadow-blue-200"
        >
          <div>
            <div className="p-3 bg-blue-500/50 rounded-2xl w-fit mb-4">
              <Wallet size={20} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total_Stock_Value</h3>
            <p className="text-4xl font-black mt-2 tracking-tighter">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mt-6 bg-white/10 p-2 rounded-xl w-fit">
            <Layers size={12} /> {initialProducts.length} Unique SKUs
          </div>
        </motion.div>

        {/* --- CARD 2: QUICK ENTRY FORM --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bento-card md:col-span-1 bg-slate-900 text-white shadow-xl"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
            <PackagePlus size={16}/> New_Inventory_Entry
          </h2>
          <form action={addProduct} className="space-y-4">
            <input name="name" placeholder="Item Name" required className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all" />
            <div className="flex gap-3">
              <input name="quantity" type="number" placeholder="Qty" required className="w-1/2 bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <input name="price" type="number" step="0.01" placeholder="Price $" required className="w-1/2 bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all mt-2 shadow-lg shadow-blue-900/40 active:scale-95">
              Generate SKU
            </button>
          </form>
        </motion.div>

        {/* --- CARD 3: SMART SEARCH --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bento-card md:col-span-2 flex flex-col justify-center bg-white border-slate-100 shadow-sm"
        >
          <div className="relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Product Name or SKU ID..." 
              className="w-full pl-16 pr-6 py-6 bg-slate-50 rounded-[2rem] border-none focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-xl font-medium tracking-tight"
            />
          </div>
        </motion.div>

        {/* --- CARD 4: MASTER INVENTORY GRID --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bento-card md:col-span-4 bg-white border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Package className="text-blue-500" /> Warehouse_Catalog
            </h2>
            <div className="h-px bg-slate-100 flex-grow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div 
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col justify-between p-7 bg-slate-50 rounded-[3rem] border border-slate-100 hover:border-blue-400 hover:bg-white transition-all group relative overflow-hidden"
                >
                  {/* HOVER ACTIONS - Z-INDEX FIX */}
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-30 pointer-events-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingItem(product); }} 
                      className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 shadow-md hover:shadow-lg transition-all active:scale-90"
                    >
                      <Edit3 size={18}/>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteProduct(product._id); }} 
                      className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 shadow-md hover:shadow-lg transition-all active:scale-90"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>

                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white rounded-[1.5rem] text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Package size={22} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 leading-none text-lg">{product.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-2 tracking-widest uppercase">{product.sku}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">MSRP</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Stock</p>
                      <p className={`text-2xl font-black ${product.quantity < 5 ? 'text-red-500' : 'text-slate-900'} tracking-tighter`}>
                        {product.quantity}
                      </p>
                    </div>
                  </div>
                  
                  {product.quantity < 5 && (
                    <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 relative z-10">
                      <AlertCircle size={14} /> Low_Stock_Warning
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* --- EDIT DRAWER (Sleek Glassmorphism) --- */}
      <AnimatePresence>
        {editingItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-[101] p-12 flex flex-col"
            >
              <div className="flex justify-between items-center mb-16">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Editor_Console</p>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">Update SKU</h2>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-4 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-600 active:scale-95">
                  <X size={28} />
                </button>
              </div>

              <form action={async (formData) => {
                await editProduct(editingItem._id, formData);
                setEditingItem(null);
              }} className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Identity</label>
                  <input name="name" defaultValue={editingItem.name} className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-blue-600 outline-none text-lg font-bold transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory Count</label>
                    <input name="quantity" type="number" defaultValue={editingItem.quantity} className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unit Price ($)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingItem.price} className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold focus:ring-2 focus:ring-blue-600" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-2xl active:scale-[0.98] mt-12">
                  <Save size={20} /> Apply Transformations
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}