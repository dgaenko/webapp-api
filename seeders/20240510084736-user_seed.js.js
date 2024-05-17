'use strict';

const table = 'Users';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(table, [
      {
        user_name: "tester17",
        tg_chat_id: "723743159",
        hash: "3b03d858ba85b1478acbc019a2b27dd5",
      },
      {
        user_name: "user",
        tg_chat_id: "11111111",
        hash: "3b03d858ba85b1478acbc019a2b27dd1",
      },
    ], {});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete(table, null, {});
  }
};
