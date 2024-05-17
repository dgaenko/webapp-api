'use strict';

const table = 'Products';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(table, [
      {
        title: 'Продукт 1',
        description: 'Описание продукта 1',
        article: '122333',
        variant: 'желтый',
        price: 100,
        quantity: 10
      },
      {
        title: 'Продукт 2',
        description: 'Описание продукта 2',
        article: '122330',
        variant: 'синий',
        price: 120,
        quantity: 15
      },
      {
        title: 'Продукт 3',
        description: 'Описание продукта 3',
        article: '122331',
        variant: 'зеленый',
        price: 130,
        quantity: 5
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete(table, null, {});
  }
};
