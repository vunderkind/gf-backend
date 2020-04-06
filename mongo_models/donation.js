const mongoose = require('mongoose');
const modelName = 'donation';
const { Schema } = mongoose;
const schemaConfig = {
  donor: String,
  amount: Number,
  reference: String,
  beneficiary_ids: [ String ],
  source: {
    type: String,
    enum: ['FLUTTERWAVE', 'BANK_TRANSFER']
  },
  status: {
    type: String,
    enum: ['INITIATED', 'FAILED', 'SUCCESS', 'DISBURSED']
  },
  created_at: String,
  created_ts: Number,
  deleted_at: String,
};
const schemaObject = new Schema(schemaConfig);
module.exports = mongoose.model(modelName, schemaObject);
