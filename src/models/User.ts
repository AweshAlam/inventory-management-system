import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  shopName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  shopLogo: { type: String }, 
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);