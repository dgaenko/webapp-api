'use strict';

const table = 'Cards';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(table, [
      {
        color: 'red',
        title: 'title1',
        description: 'description1',
        rarity_id: '2',
        image: 'image1',
      },
      {
        color: 'blue',
        title: 'title2',
        description: 'description2',
        rarity_id: '1',
        image: 'image2',
      },
      {
        color: 'green',
        title: 'title3',
        description: 'description3',
        rarity_id: '3',
        image: 'image3',
      },
      {
        color: 'yellow',
        title: 'title4',
        description: 'description4',
        rarity_id: '2',
        image: 'image4',
      },
    ], {});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete(table, null, {});
  }
};
