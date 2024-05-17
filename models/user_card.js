'use strict';
const { Sequelize, Model, Op} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class UserCard extends Model {
    static models;

    static associate(models) {
      console.log("UserCard.associate");
      UserCard.models = models;

      models.User.belongsToMany(models.Card, {
        through: { model: UserCard, unique: true },
        foreignKey: "user_id"
      });
      models.Card.belongsToMany(models.User, {
        through: { model: UserCard, unique: true },
        foreignKey: "card_id"
      });
    }

    /**
     * Добавление карточки/чек юзеру
     * @param user_id   ID юзера
     * @param card_id   ID карточки
     * @param cnt       Кол-во карточек
     * @returns {Promise<UserCard>}
     */
    static async addCard(user_id, card_id, cnt = 1) {
      console.log(`UserCard.addCard user_id:${user_id} card_id:${card_id} cnt:${cnt}`);
      let row = await UserCard.findOne({
        where: {
          [Op.and]: [
            { user_id: user_id },
            { card_id: card_id }
          ]
        }
      });
      if (row) {
        await row.update(
        { cnt: row.cnt + cnt },
      { where: { rel_id: row.rel_id } }
        );
      } else {
        row = await UserCard.create({
          user_id: user_id,
          card_id: card_id,
          cnt: cnt
        });
      }
      return row;
    }

  }

  UserCard.init({
    rel_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    card_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    cnt: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Кол-во карточек данного типа у юзера"
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn('now'),
      comment: "Дата добавления",
    }
  }, {
    sequelize,
    modelName: 'UserCard',
    indexes: []
  });

  return UserCard;
};