const { app } = require("./app");
const { db } = require("./database");

const PORT = process.env.API_PORT || 3000;

const start = async () => {
  await db.authenticate();
  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
  });
};

start();
