import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IProperty } from './Property';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId | IUser;
  property?: mongoose.Types.ObjectId | IProperty;
  type: 'property_pending' | 'property_approved' | 'property_rejected';
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    property: { 
      type: Schema.Types.ObjectId, 
      ref: 'Property'
    },
    type: { 
      type: String, 
      enum: ['property_pending', 'property_approved', 'property_rejected'],
      required: true
    },
    message: { 
      type: String, 
      required: true 
    },
    isRead: { 
      type: Boolean, 
      default: false,
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
