const { app } = require("./app");
const { db } = require("./database");

const start = async () => {
  const res = await db.authenticate();
  console.log(res);
  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
  });
};

start();
