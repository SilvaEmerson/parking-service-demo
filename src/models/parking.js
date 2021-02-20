const { DataTypes } = require("sequelize");

const Parking = (sequelize) =>
  sequelize.define("parking", {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    plate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    left: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    leftAt: {
      type: DataTypes.DATE,
    },
    enteredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

module.exports = {
  Parking,
};
