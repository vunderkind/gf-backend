const mongoose = require('mongoose');
const modelName = 'user';
const { Schema } = mongoose;
const schemaConfig = {
  firstName: String,
  lastName: String,
  phone: String,
  email: {
    type: String,
    unique: true
  },
  role: String,
  bio: String,
  status: String,
  created_at: String,
  created_ts: Number,
  last_login: Number,
  password: String,
  login_hash: String
};
const schemaObject = new Schema(schemaConfig);
module.exports = mongoose.model(modelName, schemaObject);
