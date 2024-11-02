const mongoose = require("mongoose");
const { v4: generateUUID } = require("uuid");

const ClientSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: generateUUID,
  },
  name: {
    type: String,
    required: true,
  },
  client_id: {
    type: String,
    required: true,
  },
  client_hash: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  createTime: {
    type: Date,
    required: true,
  },
  updateTime: {
    type: Date,
    required: true,
  },
});

const Client = mongoose.model("Client", ClientSchema);

module.exports = Client;
