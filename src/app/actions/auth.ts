"use server";

import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

/**
 * Handles new shopkeeper registration
 * @param formData - The raw form data from the register page
 */
export async function registerShopkeeper(formData: FormData) {
  // 1. Establish Database Connection
  await connectDB();

  // 2. Extract and sanitize form fields
  const name = formData.get("name") as string;
  const shopName = formData.get("shopName") as string;
  const email = (formData.get("email") as string)?.toLowerCase();
  const password = formData.get("password") as string;
  const shopLogo = formData.get("shopLogo") as string;

  // 3. Validation: Check if the user already exists
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return { error: "Security Alert: This email identity is already registered." };
    }

    // 4. Security: Hash the password before storage
    // 12 rounds of salt provides a strong balance of security and performance
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Database Commit: Create the new user record
    await User.create({
      name,
      shopName,
      email,
      password: hashedPassword,
      shopLogo: shopLogo || "", // Stores optimized WebP string
    });

  } catch (err: any) {
    console.error("REGISTRATION_FAILURE:", err.message);
    return { error: "System Error: Failed to initialize account. Please try again." };
  }

  // 6. Success: Redirect to login terminal
  redirect("/login");
}