'use strict';
const { Sequelize, Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Rarity extends Model {
    static models;

    static associate(models) {
      console.log("Rarity.associate");
      Rarity.models = models;
    }
  }

  Rarity.init({
    rarity_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(20)
    },
    weight: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    price_buy: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Цена покупки карточки"
    },
    price_sale: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Цена продажи карточки"
    }
  }, {
    sequelize,
    modelName: 'Rarity',
    indexes: []
  });

  return Rarity;
};