'use strict';
const { Sequelize, Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Card extends Model {
    static models;

    static associate(models) {
      console.log("Card.associate");
      Card.models = models;

      Card.hasMany(models.UserCard);
      models.UserCard.belongsTo(Card, { foreignKey: 'card_id' });

      Card.belongsTo(models.Rarity, { foreignKey: 'rarity_id' });
    }

    /**
     * Получение случайной карточки
     * @returns {Promise<Card>}
     */
    static async getRandom() {
      const cards = await this.findAll({
        include: [{
          model: Card.models.Rarity
        }]
      });
      const totalWeight = cards.reduce((acc, card) => {
        return acc + card.Rarity.weight;
      }, 0);
      const randomNum = Math.random() * totalWeight;
      console.log("totalWeight", totalWeight, "randomNum", randomNum);
      let sum = 0;
      for (const card of cards) {
        sum += card.Rarity.weight;
        if (randomNum < sum) {
          return card;
        }
      }
    }
  }

  Card.init({
    card_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    color: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    title: {
      allowNull: true,
      type: DataTypes.STRING(1024)
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING(2048)
    },
    rarity_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
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
    modelName: 'Card',
    indexes: [
      { fields: ['active'] },
      { fields: ['created_at'] },
      { fields: ['updated_at'] }
    ]
  });

  return Card;
};