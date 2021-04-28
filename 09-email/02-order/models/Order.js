const mongoose = require('mongoose');
const connection = require('../libs/connection');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: (str) => /\+?\d{6,14}/.test(str),
      message: 'Неверный формат номера телефона.',
    },
  },
  address: {
    type: String,
    required: true,
  },
});

module.exports = connection.model('Order', orderSchema);
