const { Sequelize } = require("sequelize");
const { Parking } = require("./models/parking");

const loadDatabase = () => {
  const db = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    password: process.env.POSTGRES_PASSWORD,
    username: "postgres",
    port: 5432,
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
