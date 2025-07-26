const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push'],
    required: true
  },
  category: {
    type: String,
    enum: ['rental', 'swap', 'payment', 'reminder', 'marketing', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  // Email specific fields
  subject: {
    type: String,
    maxlength: 200
  },
  htmlContent: {
    type: String
  },
  // SMS specific fields
  phoneNumber: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'pending'
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  // Provider response
  providerId: String, // SendGrid message ID or Twilio SID
  providerResponse: mongoose.Schema.Types.Mixed,
  errorMessage: String,
  // Template information
  templateId: String,
  templateData: mongoose.Schema.Types.Mixed,
  // Related entities
  relatedEntityType: {
    type: String,
    enum: ['rental', 'swap', 'order', 'user']
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  // Scheduling
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  sentAt: Date,
  deliveredAt: Date,
  failedAt: Date,
  // Metadata
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });

// Update updatedAt on save
notificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update status timestamps
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'sent':
        if (!this.sentAt) this.sentAt = now;
        break;
      case 'delivered':
        if (!this.deliveredAt) this.deliveredAt = now;
        break;
      case 'failed':
        if (!this.failedAt) this.failedAt = now;
        break;
    }
  }
  
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);