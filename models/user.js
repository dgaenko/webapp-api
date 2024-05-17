'use strict';
const config = require("config");
const bcrypt = require("bcrypt");
const { Sequelize, Model } = require('sequelize');
const jwt    = require("../components/jwt.js");


module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static models;
    static saltRounds = 10;

    static associate(models) {
      console.log("User.associate");
      User.models = models;

      User.hasMany(models.UserCard, {foreignKey: 'user_id'});
      models.UserCard.belongsTo(User, {foreignKey: 'user_id'});

      User.hasMany(models.Order, {foreignKey: 'user_id'});
      User.hasMany(models.Address, {foreignKey: 'user_id'});
      User.belongsTo(models.Address, {foreignKey: 'address_id'});
    }

    static async createIfNotExists(tg_chat_id, user_name, full_name, hash, ip) {
      let user = await this.findOne({
        where: {
          tg_chat_id: tg_chat_id
        },
      });
      if (!user) {
        user = await this.create({
          user_name: user_name,
          full_name: full_name,
          hash: hash,
          tg_chat_id: tg_chat_id,
          ip: ip,
          last_login_dt: new Date()
        });
      }
      return user;
    }

    static createPasswordHash(passwd) {
      const salt = bcrypt.genSaltSync(this.saltRounds);
      return bcrypt.hashSync(passwd.toString(), salt);
    }

    static async checkPassword(password, passwordHash) {
      return await bcrypt.compare(password, passwordHash);
    }

    /**
     * Генерация токена доступа и токена обновления
     * @param user_id   ID юзера
     * @param hash      hash юзера
     * @returns {{access: (*), refresh: (*)}}
     */
    static generateTokens(user_id, hash) {
      const payload = {
        user_id: user_id,
        hash: hash
      };
      return {
        access: jwt.getToken(payload, config.get("jwt.ttl_access_token")),
        refresh: jwt.getToken(payload, config.get("jwt.ttl_refresh_token"))
      }
    }

    async addPoints(point) {
      this.points += point;
      await this.save();
    }

  }

  User.init({
    user_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_name: {
      allowNull: true,
      type: DataTypes.STRING(100),
      comment: "Nick в телеграм"
    },
    full_name: {
      type: DataTypes.STRING(255),
      defaultValue: null,
      comment: "Полное имя"
    },
    address_id: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      comment: "Адрес по умолчанию"
    },
    phone: {
      type: DataTypes.STRING(20),
      defaultValue: null
    },
    email: {
      type: DataTypes.STRING(100),
      defaultValue: null
    },
    password: {
      type: DataTypes.STRING(100),
      defaultValue: null
    },
    tg_chat_id: {
      type: DataTypes.BIGINT,
      defaultValue: null
    },
    vk_id: {
      type: DataTypes.STRING(128),
      defaultValue: null
    },
    spoti_id: {
      type: DataTypes.STRING(128),
      defaultValue: null
    },
    ya_id: {
      type: DataTypes.STRING(128),
      defaultValue: null
    },
    points_coins: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    points_gems: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    comment: {
      allowNull: true,
      type: DataTypes.STRING(1024)
    },
    active: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    hash: {
      type: DataTypes.STRING(50),
      defaultValue: null
    },
    ip: {
      type: DataTypes.STRING(256),
      defaultValue: null
    },
    last_login_dt: {
      type: DataTypes.DATE,
      defaultValue: null,
      comment: "Дата последнего входа"
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
    modelName: 'User',
    indexes: [
      { fields: ['user_name'] },
      { fields: ['phone'], unique: true },
      { fields: ['email'], unique: true },
      { fields: ['tg_chat_id'], unique: true },
      { fields: ['active'] },
      { fields: ['hash'], unique: true },
      { fields: ['last_login_dt'] },
      { fields: ['created_at'] },
      { fields: ['updated_at'] }
    ]
  });

  return User;
};