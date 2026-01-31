"use server";

import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Transaction } from "@/models/Transaction";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

/**
 * HELPER: GET CURRENT USER ID
 * Ensures the 'id' exists and satisfies TypeScript.
 */
async function getUserId() {
  const session = await getServerSession(authOptions);
  
  // Explicitly check for session and user id to satisfy strict TS checks
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized Access: Terminal session required.");
  }
  
  return session.user.id;
}

// --- INVENTORY MANAGEMENT ---

export async function addProduct(formData: FormData) {
  await connectDB();
  const userId = await getUserId();

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
    owner: userId 
  });

  revalidatePath("/");
  revalidatePath("/inventory");
}

export async function editProduct(id: string, formData: FormData) {
  await connectDB();
  const userId = await getUserId();

  const quantity = Number(formData.get("quantity"));
  const updateData = {
    name: formData.get("name") as string,
    quantity: quantity,
    price: Number(formData.get("price")),
    status: quantity < 5 ? "LOW_STOCK" : "NOMINAL"
  };

  await Product.findOneAndUpdate({ _id: id, owner: userId }, updateData);
  
  revalidatePath("/");
  revalidatePath("/inventory");
}

export async function deleteProduct(id: string) {
  await connectDB();
  const userId = await getUserId();

  await Product.findOneAndDelete({ _id: id, owner: userId });
  
  revalidatePath("/");
  revalidatePath("/inventory");
}

// --- BILLING & SALES LOGIC ---

export async function processSale(cartItems: any[], total: number, customerName: string) {
  try {
    await connectDB();
    const userId = await getUserId();

    const billId = `INV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const finalCustomerName = customerName?.trim() || "Walk-in Customer";

    // 1. Update Inventory Stock (Atomic operation with owner check)
    await Promise.all(
      cartItems.map((item) =>
        Product.findOneAndUpdate(
          { _id: item._id, owner: userId }, 
          { $inc: { quantity: -item.cartQty } },
          { new: true }
        ).then(updated => {
          // Update status if stock falls low during sale
          if (updated && updated.quantity < 5) {
            updated.status = "LOW_STOCK";
            return updated.save();
          }
        })
      )
    );

    // 2. Create Transaction
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
      owner: userId 
    });

    revalidatePath("/");
    revalidatePath("/billing");

    return { 
      success: true, 
      billData: JSON.parse(JSON.stringify(newTx)) 
    };
  } catch (error: any) {
    console.error("Sale Process Error:", error.message);
    return { success: false, error: error.message };
  }
}