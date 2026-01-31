"use server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function processCheckout(cartItems: { id: string; quantity: number }[]) {
  await connectDB();

  for (const item of cartItems) {
    await Product.findByIdAndUpdate(item.id, {
      $inc: { quantity: -item.quantity }
    });
  }

  revalidatePath("/");
  revalidatePath("/billing");
  return { success: true };
}