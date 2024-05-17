'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Migration extends Model {}

    Migration.init({
        filename: {
            type: DataTypes.STRING(255),
            primaryKey: true
        },
        appliedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Migration',
        tableName: '_migrations'
    });

    return Migration;
};
