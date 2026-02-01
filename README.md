# 🛡️ Binary IMS: Inventory Management

An advanced, multi-tenant **Inventory Management & Billing System** designed for speed, security, and professional branding. Built with a focus on high-performance data handling and thermal-ready printing.

---

## Live
https://binary-ims.vercel.app/

---

## 🚀 Technical Architecture
This project leverages a modern Full-Stack environment to ensure low-latency operations even during heavy billing cycles:

* **Frontend**: Next.js 16 (App Router) with Framer Motion for high-fidelity UI transitions.
* **Backend**: Serverless Node.js Actions with strict TypeScript type-safety.
* **Database**: MongoDB Atlas using a global singleton connection pattern for serverless stability.
* **Auth**: NextAuth.js with JWT strategy and custom module augmentation for multi-tenant isolation.
* **Styling**: Tailwind CSS for a professional "Bento-grid" dashboard aesthetic.

---

## ✨ Key Features

### 📊 Command Dashboard
* **Real-time Analytics**: Scoped to the individual shopkeeper, displaying revenue trends for 24H and 30D cycles.
* **Database Status**: Live visual indicators for MongoDB connectivity (Online/Offline).

### 🧾 Precision Billing Terminal
* **Multi-tenant Security**: Every transaction is strictly linked to the authenticated `owner` ID.
* **Thermal Printing**: Custom `@media print` logic optimized for 80mm thermal receipt printers.
* **Dynamic Branding**: Automatically fetches and embeds the shop's logo into receipts from MongoDB Atlas, bypassing cookie bloat.

### 📦 Warehouse Control
* **Intelligent Inventory**: Automated "LOW_STOCK" alerts for items with quantity < 5.
* **Scoped Actions**: CRUD operations restricted to items owned by the logged-in session.

---

Made with ❤️ by Awesh