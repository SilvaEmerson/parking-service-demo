const { Sequelize } = require("sequelize");
const { Parking } = require("./models/parking");

const loadDatabase = () => {
  const db = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
    logging: false,
  });

  return db;
};

const db = loadDatabase()
const parking = Parking(db);

module.exports = {
  loadDatabase,
  db,
  parking,
};
