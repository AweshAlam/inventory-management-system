import mongoose, { Schema, model, models } from 'mongoose';

// We define the schema explicitly every time to force a refresh
const TransactionSchema = new Schema({
  billId: { type: String, required: true },
  customerName: { type: String, default: "Walk-in Customer" },
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  timestamp: { type: Date, default: Date.now }
}, { 
  strict: false, // 👈 ADD THIS: It tells Mongoose "allow fields even if they aren't in the schema"
  timestamps: true 
});

// Delete the old model from cache if it exists, then recreate it
if (models.Transaction) {
  delete models.Transaction;
}

export const Transaction = model('Transaction', TransactionSchema);