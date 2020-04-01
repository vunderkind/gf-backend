const mongoose = require('mongoose');
const modelName = 'users';
const { Schema } = mongoose;
const schemaConfig = {
  firstName: String,
  lastName: String,
  phone: String,
  isWhatsapp: String,
  email: {
    type: String,
    unique: true
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
  isVerified: Boolean,
  created_at: Number,
  donationAmount: 0,
  donationCount: 0
};
const schemaObject = new Schema(schemaConfig);
module.exports = mongoose.model(modelName, schemaObject);
