import mongoose, { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  billId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  // 👈 ADD THIS FIELD
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
}, { timestamps: true });

export const Transaction = models.Transaction || model("Transaction", TransactionSchema);