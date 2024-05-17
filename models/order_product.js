'use strict';
const { Sequelize, Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class OrderProduct extends Model {
    static models;

    static associate(models) {
      console.log("OrderProduct.associate");
      OrderProduct.models = models;

      models.Order.belongsToMany(models.Product, {
        through: { model: OrderProduct, unique: true },
        foreignKey: "order_id"
      });
      models.Product.belongsToMany(models.Order, {
        through: { model: OrderProduct, unique: true },
        foreignKey: "product_id"
      });
    }

  }

  OrderProduct.init({
    rel_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    order_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    product_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    price: {
      allowNull: false,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    dt: {
      comment: "Дата добавления",
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn('now')
    }
  }, {
    sequelize,
    modelName: 'OrderProduct',
    indexes: []
  });

  return OrderProduct;
};