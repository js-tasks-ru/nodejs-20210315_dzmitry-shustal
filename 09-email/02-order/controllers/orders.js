const Order = require('../models/Order');
const Product = require('../models/Product');
const sendMail = require('../libs/sendMail');
const mapOrder = require('../mappers/order');

module.exports.checkout = async function checkout(ctx, next) {
  const {product: productId, phone, address} = ctx.request.body;
  const order = new Order({user: ctx.user, product: productId, phone, address});
  const product = await Product.findOne({_id: productId});
  const err = order.validateSync();

  if (err) throw err;

  await order.save();
  await sendMail({
    template: 'order-confirmation',
    locals: {
      id: order.id,
      product,
    },
    to: ctx.user.email,
    subject: 'Подтвердите товар',
  });

  ctx.body = {order: order.id};
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const orders = await Order.find({user: ctx.user.id}).populate('product');

  ctx.body = {orders: orders.map(mapOrder)};
};
