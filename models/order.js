'use strict';
const { Sequelize, Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static models;

    static associate(models) {
      console.log("Order.associate");
      Order.models = models;

      Order.hasMany(models.OrderProduct, {foreignKey: 'order_id'});
      models.OrderProduct.belongsTo(Order, {foreignKey: 'order_id'});
      Order.belongsTo(models.Address, {foreignKey: 'address_id'});
    }
  }

  Order.init({
    order_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    address_id: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn('now')
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn('now')
    },
  }, {
    sequelize,
    modelName: 'Order',
    indexes: [
      { fields: ['status'] },
      { fields: ['created_at'] },
      { fields: ['updated_at'] }
    ]
  });

  return Order;
};