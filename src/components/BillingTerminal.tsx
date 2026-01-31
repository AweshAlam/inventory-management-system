"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Receipt, Plus, Minus, Trash2, 
  CheckCircle, History, Clock, Printer, User, Search, Store
} from "lucide-react";
import { processSale } from "@/app/actions/inventory";
import { useSession } from "next-auth/react";

interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface Transaction {
  _id: string;
  billId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  timestamp: string;
}

export default function BillingTerminal({ 
  inventory, 
  history, 
  shopLogo 
}: { 
  inventory: Product[], 
  history: Transaction[], 
  shopLogo?: string 
}) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastBill, setLastBill] = useState<Transaction | null>(null);
  const [txSearchQuery, setTxSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // --- Calculations ---
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.cartQty, 0);
  const tax = subtotal * 0.08; 
  const total = subtotal + tax;

  // --- Filtering ---
  const filteredProducts = inventory.filter((item) => 
    (item.name?.toLowerCase() || "").includes(productSearchQuery.toLowerCase()) ||
    (item.sku?.toLowerCase() || "").includes(productSearchQuery.toLowerCase())
  );

  const filteredHistory = history.filter((tx) => {
    const search = txSearchQuery.toLowerCase();
    return (tx.billId?.toLowerCase() || "").includes(search) || 
           (tx.customerName?.toLowerCase() || "").includes(search);
  });

  // --- Handlers ---
  const addToCart = (item: Product) => {
    const existing = cart.find((i) => i._id === item._id);
    if (existing) {
      if (existing.cartQty < item.quantity) {
        setCart(cart.map((i) => i._id === item._id ? { ...i, cartQty: i.cartQty + 1 } : i));
      }
    } else {
      setCart([...cart, { ...item, cartQty: 1 }]);
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item._id === id) {
        const newQty = item.cartQty + delta;
        const stockLimit = inventory.find(p => p._id === id)?.quantity || 0;
        return (newQty > 0 && newQty <= stockLimit) ? { ...item, cartQty: newQty } : item;
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const result = await processSale(cart, total, customerName);
    if (result.success) {
      setLastBill(result.billData);
      setCart([]);
      setCustomerName("");
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-8 relative">
      {/* RESTORED PRINT SIZING & HYDRATION FIX */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          #printable-receipt, #printable-receipt * { visibility: visible !important; }
          #printable-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important; /* Standard Thermal Size */
            border: none !important;
            background: white !important;
            padding: 5mm !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        {/* LEFT COLUMN: CUSTOMER & CATALOG */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card bg-white border-slate-100 shadow-sm">
            <h2 className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2 tracking-[0.2em]">
              <User size={16}/> Client_Assignment
            </h2>
            <input 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Assign Customer/Patient Name..."
              className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bento-card bg-white border-slate-100 min-h-[450px] shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                 <ShoppingCart className="text-blue-600" /> Catalog_Select
              </h2>
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Filter name/SKU..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((item) => (
                  <motion.button 
                    key={item._id} layout
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => addToCart(item)} 
                    className="p-6 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-blue-400 text-left transition-all group hover:bg-white relative shadow-sm"
                  >
                    <p className="font-black text-slate-800 tracking-tight leading-none truncate group-hover:text-blue-600">{item.name}</p>
                    <p className="text-2xl font-black mt-3 text-slate-900 tracking-tighter">${item.price.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">In Stock: {item.quantity}</p>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: ACTIVE INVOICE */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bento-card bg-slate-900 text-white flex flex-col h-fit sticky top-6 shadow-2xl">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-8 text-blue-400 flex items-center gap-2">
            <Receipt size={22}/> Active_Invoice
          </h2>
          <div className="flex-grow space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {cart.map(item => (
                <motion.div key={item._id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex justify-between items-center bg-slate-800/40 p-4 rounded-[1.5rem] border border-slate-800">
                  <div className="max-w-[120px]">
                    <p className="font-black text-sm truncate">{item.name}</p>
                    <p className="text-[10px] text-blue-400 font-black tracking-widest mt-1 uppercase">${item.price} x {item.cartQty}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl">
                    <button onClick={() => updateCartQty(item._id, -1)} className="p-1 hover:text-blue-400"><Minus size={14}/></button>
                    <span className="font-black text-xs w-5 text-center">{item.cartQty}</span>
                    <button onClick={() => updateCartQty(item._id, 1)} className="p-1 hover:text-blue-400"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => setCart(cart.filter(i => i._id !== item._id))} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex justify-between text-4xl font-black text-white tracking-tighter">
                <span className="italic uppercase">Total</span>
                <span className="text-blue-500">${total.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} disabled={cart.length === 0 || isProcessing} className="w-full mt-8 py-6 rounded-[2.5rem] bg-blue-600 hover:bg-blue-500 font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
                {isProcessing ? "Processing..." : "Complete Sale"}
              </button>
          </div>
        </motion.div>

        {/* BOTTOM: AUDIT LOGS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bento-card md:col-span-3 bg-white border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><History className="text-blue-500"/> Audit_Logs</h2>
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={txSearchQuery} onChange={(e) => setTxSearchQuery(e.target.value)} placeholder="Search by ID or Customer..." className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-medium" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((tx) => (
                <motion.div key={tx._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-blue-400 transition-all relative overflow-hidden">
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{tx.billId}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-black uppercase tracking-widest"><Clock size={10} /> {isMounted ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."}</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 truncate leading-none">{tx.customerName}</p>
                  <div className="flex justify-between items-end mt-6">
                    <p className="text-sm font-black text-slate-500">${tx.total?.toFixed(2)}</p>
                    <button onClick={() => setLastBill(tx)} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm border border-slate-100 active:scale-90"><Printer size={16} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* RECEIPT MODAL */}
      <AnimatePresence>
        {lastBill && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-md no-print" onClick={() => setLastBill(null)} />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-10 rounded-[4rem] w-full max-w-md shadow-2xl relative pointer-events-auto overflow-hidden">
                <div id="printable-receipt" className="p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                  <div className="text-center mb-8">
                    {/* Personalized Logo */}
                    {shopLogo ? (
                      <img src={shopLogo} className="h-20 w-auto object-contain mx-auto mb-4 grayscale" alt="Logo" />
                    ) : (
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32}/></div>
                    )}
                    <h2 className="text-2xl font-black uppercase tracking-tighter">{session?.user?.shopName || "Medical Command"}</h2>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-widest">{lastBill.billId}</p>
                  </div>
                  <div className="space-y-3 mb-8 text-[10px] font-black uppercase border-b border-slate-200 pb-6 tracking-[0.2em]">
                     <div className="flex justify-between"><span className="text-slate-400">Client:</span> <span>{lastBill.customerName}</span></div>
                     <div className="flex justify-between"><span className="text-slate-400">Date:</span> <span>{new Date(lastBill.timestamp).toLocaleDateString()}</span></div>
                  </div>
                  <div className="space-y-4 mb-8">
                     {lastBill.items.map((i: any, idx: number) => (
                       <div key={idx} className="flex justify-between text-sm font-black">
                         <span className="text-slate-600">{i.quantity}x {i.name}</span>
                         <span className="text-slate-900">${(i.price * i.quantity).toFixed(2)}</span>
                       </div>
                     ))}
                  </div>
                  <div className="pt-8 border-t-2 border-slate-200 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Grand Total</p>
                    <p className="text-5xl font-black text-blue-600 mt-2 tracking-tighter">${lastBill.total?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-8 space-y-3 no-print">
                  <button onClick={() => window.print()} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"><Printer size={20}/> Print Receipt</button>
                  <button onClick={() => setLastBill(null)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Dismiss</button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}