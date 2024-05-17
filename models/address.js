'use strict';
const { Sequelize, Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static models;

    static associate(models) {
      console.log("Address.associate");
      Address.models = models;
    }
  }

  Address.init({
    address_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    phone: {
      type: DataTypes.STRING(20),
      defaultValue: null
    },
    address: {
      type: DataTypes.STRING(512),
      defaultValue: null
    },
    city: {
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    region: {
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    country: {
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    zip: {
      type: DataTypes.STRING(10),
      defaultValue: null
    },
    comment: {
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
      defaultValue: Sequelize.fn('now')
    },
  }, {
    sequelize,
    modelName: 'Address',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['created_at'] },
      { fields: ['updated_at'] }
    ]
  });

  return Address;
};