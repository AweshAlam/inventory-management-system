import mongoose, { Schema, model, models } from 'mongoose';

// const ProductSchema = new Schema({
//   name: { type: String, required: true },
//   sku: { type: String, required: true, unique: true },
//   quantity: { type: Number, default: 0 },
//   price: { type: Number, default: 0 }, // New Price Field
//   category: String,
//   status: { type: String, enum: ['NOMINAL', 'LOW_STOCK', 'OUT'], default: 'NOMINAL' }
// }, { timestamps: true });
const ProductSchema = new Schema({
  name: String,
  sku: String,
  quantity: Number,
  price: Number,
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true } // 👈 NEW
});

export const Product = models.Product || model('Product', ProductSchema);