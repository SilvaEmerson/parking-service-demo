var express = require("express");
const {
  getHistory,
  createTicket,
  closeTicket,
  payTicket,
} = require("../controllers/parking");
var router = express.Router();

router.get("/", async (req, res) => {
  res.status(400);
  res.json({ error: "Placa não fornecida" }).end();
});

router.get("/:plate", getHistory);

router.post("/", createTicket);

router.put("/:id/out", closeTicket);

router.put("/:id/pay", payTicket);

module.exports = router;
