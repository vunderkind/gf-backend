const mongoose = require('mongoose');
const modelName = 'beneficiary';
const { Schema } = mongoose;
const schemaConfig = {
  firstName: String,
  lastName: String,
  phone: String,
  isWhatsApp: String,
  isDeleted: Number,
  email: {
    type: String
  },
  context: String,
  bankName: String,
  accountNumber: String,
  accountName: String,
  paymentLink: String,
  location: String,
  socialMedia: {
    type: Schema.Types.Mixed //Mixed so we can store multiple
  },
  isVerified: String,
  created_at: String,
  created_ts: Number,
  deleted_at: String,
  donationAmount: 0,
  donationCount: 0
};
const schemaObject = new Schema(schemaConfig);
module.exports = mongoose.model(modelName, schemaObject);
