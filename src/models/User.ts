import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'property_owner' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    password: { 
      type: String, 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['property_owner', 'admin'],
      required: true,
      default: 'property_owner'
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
