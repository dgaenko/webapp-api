'use strict';

const table = 'Rarities';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(table, [
      {
        name: 'Super',
        weight: 10,
        price_buy: 10,
        price_sale: 10
      },
      {
        name: 'Puper',
        weight: 20,
        price_buy: 20,
        price_sale: 20
      },
      {
        name: 'Mega',
        weight: 30,
        price_buy: 30,
        price_sale: 30
      },
      {
        name: 'Giga',
        weight: 40,
        price_buy: 40,
        price_sale: 40
      },
    ], {});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete(table, null, {});
  }
};
