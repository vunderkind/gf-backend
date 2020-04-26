const mongoose = require('mongoose');
const modelName = 'beneficiary';
const { Schema } = mongoose;
const schemaConfig = {
  firstName: String,
  lastName: String,
  phone: String,
  isWhatsApp: Boolean,
  isDeleted: Boolean,
  email: {
    type: String
  },
  context: String,
  bankName: String,
  bankCode: String,
  accountNumber: String,
  accountName: String,
  paymentLink: String,
  subaccount: {
    type: String,
    unique: true
  },
  location: String,
  bvn: String,
  verificationImage: String,
  socialMedia: {
    type: Schema.Types.Mixed //Mixed so we can store multiple
  },
  isVerified: Boolean,
  created_at: String,
  created_ts: Number,
  deleted_at: String,
  donationAmount: 0,
  donationCount: 0
};
const schemaObject = new Schema(schemaConfig);
module.exports = mongoose.model(modelName, schemaObject);
