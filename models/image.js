'use strict';
const { Sequelize, Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static models;

    static associate(models) {
      console.log("Image.associate");
      Image.models = models;
    }
  }

  Image.init({
    image_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    product_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    title: {
      allowNull: true,
      type: DataTypes.STRING(1024)
    },
    url: {
      allowNull: true,
      type: DataTypes.STRING(2048)
    },
    main: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Главная картинка продукта"
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
    modelName: 'Image',
    indexes: [
      { fields: ['active'] },
      { fields: ['created_at'] },
      { fields: ['updated_at'] }
    ]
  });

  return Image;
};