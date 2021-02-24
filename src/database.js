const { Sequelize } = require("sequelize");
const { Parking } = require("./models/parking");

const loadDatabase = () => {
  const dbSettings =
    process.env.API_ENV === "TEST"
      ? { dialect: "sqlite", host: "../database.sqlite" }
      : {
          dialect: "postgres",
          host: process.env.DB_HOST,
          password: process.env.POSTGRES_PASSWORD,
          username: "postgres",
          port: 5432,
        };

  const db = new Sequelize({
    ...dbSettings,
    logging: false,
  });

  return db;
};

const db = loadDatabase();
const parking = Parking(db);

module.exports = {
  loadDatabase,
  db,
  parking,
};
