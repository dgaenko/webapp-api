'use strict';
const { Sequelize, Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static models;

    static associate(models) {
      console.log("Product.associate");
      Product.models = models;
      Product.hasMany(models.Image, {foreignKey: 'product_id'});

      Product.hasMany(models.OrderProduct, {foreignKey: 'product_id'});
      models.OrderProduct.belongsTo(Product, {foreignKey: 'product_id'});
    }

  }

  Product.init({
    product_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      allowNull: true,
      type: DataTypes.STRING(1024)
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING(2048)
    },
    article: {
      allowNull: true,
      type: DataTypes.STRING(20)
    },
    variant: {
      allowNull: true,
      type: DataTypes.STRING(20)
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
    reserved: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
/*
    available: {
      type: DataTypes.INTEGER,
      get() {
        return this.getDataValue('quantity') - this.getDataValue('reserved');
      },
    },
 */
    image: {
      allowNull: true,
      type: DataTypes.STRING(1024)
    },
    active: {
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
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()'),
    },
  }, {
    sequelize,
    modelName: 'Product',
    indexes: [
      { fields: ['active'] },
      { fields: ['article'] },
      { fields: ['created_at'] },
      { fields: ['updated_at'] }
    ]
  });

  return Product;
};