const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  subscription: {
    planType: {
      type: String,
      enum: ["monthly", "yearly"],
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    flutterwaveReference: String,
    lastPaymentDate: Date,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

schoolSchema.methods.checkSubscriptionStatus = function () {
  if (!this.subscription.expiryDate) {
    this.subscription.isActive = false;
    return false;
  }

  const now = new Date();
  const isActive = now <= this.subscription.expiryDate;
  this.subscription.isActive = isActive;

  return isActive;
};

schoolSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("School", schoolSchema);
