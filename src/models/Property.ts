import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IProperty extends Document {
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  features: string[];
  owner: mongoose.Types.ObjectId | IUser;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String, 
      required: true 
    },
    location: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    images: [{ 
      type: String 
    }],
    features: [{ 
      type: String 
    }],
    owner: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
