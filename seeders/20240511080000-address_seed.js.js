'use strict';

const table = 'Addresses';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(table, [
      {
        user_id: 1,
        address: 'ул. Ленина 1',
        city: 'Москва',
        region: 'Московская обл.',
        country: 'Россия',
        zip: 100001,
      },
      {
        user_id: 2,
        address: 'ул. Пионерская 10',
        city: 'Тула',
        region: 'Тульская обл.',
        country: 'Россия',
        zip: 100201,
      },
    ], {});

    // устанавливаем юзеру 1 адрес по умолчанию
    await queryInterface.bulkUpdate(
        "Users",
        { address_id: 1 },
        Sequelize.literal("user_id = 1")
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete(table, null, {});
  }
};
