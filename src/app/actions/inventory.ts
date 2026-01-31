"use server";

import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Transaction } from "@/models/Transaction";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next"; // To identify the shopkeeper
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

/**
 * HELPER: GET CURRENT USER ID
 * Ensures no one can perform actions without being logged in.
 */
async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized Access");
  return session.user.id;
}

// --- INVENTORY MANAGEMENT ---

export async function addProduct(formData: FormData) {
  await connectDB();
  const userId = await getUserId(); // 👈 Multi-tenant: Get current shopkeeper ID

  const name = formData.get("name") as string;
  const quantity = Number(formData.get("quantity"));
  const price = Number(formData.get("price"));
  const manualSku = formData.get("sku") as string;

  await Product.create({
    name,
    quantity,
    price,
    sku: manualSku || `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
    status: quantity < 5 ? "LOW_STOCK" : "NOMINAL",
    owner: userId // 👈 Link product to this shopkeeper
  });

  revalidatePath("/");
  revalidatePath("/inventory");
}

export async function editProduct(id: string, formData: FormData) {
  await connectDB();
  const userId = await getUserId();

  const updateData = {
    name: formData.get("name") as string,
    quantity: Number(formData.get("quantity")),
    price: Number(formData.get("price")),
    status: Number(formData.get("quantity")) < 5 ? "LOW_STOCK" : "NOMINAL"
  };

  // 👈 Multi-tenant: Only update if the product belongs to the user
  await Product.findOneAndUpdate({ _id: id, owner: userId }, updateData);
  
  revalidatePath("/");
  revalidatePath("/inventory");
}

export async function deleteProduct(id: string) {
  await connectDB();
  const userId = await getUserId();

  // 👈 Multi-tenant: Only delete if the product belongs to the user
  await Product.findOneAndDelete({ _id: id, owner: userId });
  
  revalidatePath("/");
  revalidatePath("/inventory");
}

// --- BILLING & SALES LOGIC ---

export async function processSale(cartItems: any[], total: number, customerName: string) {
  await connectDB();
  const userId = await getUserId();

  try {
    const billId = `INV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const finalCustomerName = customerName?.trim() || "Walk-in Customer";

    // 1. Update Inventory Stock (Filtered by Owner)
    await Promise.all(
      cartItems.map((item) =>
        Product.findOneAndUpdate(
          { _id: item._id, owner: userId }, // 👈 Security: Ensure user owns the item they are selling
          { $inc: { quantity: -item.cartQty } }
        )
      )
    );

    // 2. Create Transaction linked to the Owner
    const newTx = await Transaction.create({
      billId: billId,
      customerName: finalCustomerName,
      items: cartItems.map(i => ({ 
        name: i.name, 
        quantity: i.cartQty, 
        price: i.price 
      })),
      total: total,
      timestamp: new Date(),
      owner: userId // 👈 Store who made the sale
    });

    revalidatePath("/");
    revalidatePath("/billing");

    return { 
      success: true, 
      billData: JSON.parse(JSON.stringify(newTx)) 
    };
  } catch (error) {
    console.error("Sale Process Error:", error);
    return { success: false };
  }
}