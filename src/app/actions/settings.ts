"use server";

import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function updateProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Authentication failed. Please log in again." };

    await connectDB();

    const name = formData.get("name") as string;
    const shopName = formData.get("shopName") as string;
    const shopLogo = formData.get("shopLogo") as string;
    const newPassword = formData.get("password") as string;

    // 1. Prepare Update Object
    const updateData: any = { name, shopName, shopLogo };

    // 2. Handle Password Hashing (only if provided)
    if (newPassword && newPassword.trim().length >= 6) {
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // 3. Execute Update with explicit ObjectId casting
    const result = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return { error: "User not found in database." };
    }

    // 4. Force Next.js to clear cached data for these pages
    revalidatePath("/");
    revalidatePath("/settings");
    
    return { success: true };
  } catch (error: any) {
    console.error("CRITICAL_DB_ERROR:", error);
    return { error: "Database rejected the update. Check server logs." };
  }
}