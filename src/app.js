const express = require("express");
const bodyParser = require("body-parser");
const { parking } = require("./database");
const { parseISO, parse, formatDistanceToNow, parseJSON } = require("date-fns");

const app = express();

app.use(bodyParser.json());

app.get("/parking", async (req, res) => {
  res.status(400);
  res.json({ error: "Placa não fornecida" });
});

app.get("/parking/:plate", async (req, res) => {
  const params = req.params;
  const plate = params.plate;

  const matchs = plate.match(/^\w{3}-\d{4}$/gi, plate);
  if (!matchs) {
    res.status(400);
    res.json({ error: "Placa inválida" });
    return;
  }

  const result = await parking.findAll({ where: { plate: params.plate } });

  if (result.length === 0) {
    res.status(404);
    res.json({ error: "Placa não encontrada" });
    return;
  }

  res.status(200);
  res.json(result);
});

app.post("/parking", async (req, res) => {
  const bodyHavePlateProp = Object.keys(req.body).includes("plate");
  if (!bodyHavePlateProp) {
    res.status(400);
    res.json({ error: "Propriedade `plate` não está presente" });
    return;
  }

  const plate = req.body.plate;
  const matchs = plate.match(/^\w{3}-\d{4}$/gi, plate);

  if (!matchs) {
    res.status(400);
    res.json({ error: "Placa inválida" });
  } else {
    const result = await parking.create({ plate: plate.toUpperCase() });
    res.status(201);
    res.json({ ticket_number: result.id });
  }
});

app.put("/parking/:id/out", async (req, res) => {
  const id = req.params.id;

  const ticket = await parking.findOne({ where: { paid: true, id } });

  if (!ticket) {
    res.status(409);
    res.json({ error: "Ticket não pode ser fechado porque não foi pago" });
    return;
  }

  const now = new Date();

  const parsed = formatDistanceToNow(parseJSON(ticket.enteredAt))

  const [rowsAffected] = await parking.update(
    { left: true, leftAt: now, time:  parsed },
    { where: { id } }
  );

  if (rowsAffected === 0) {
    res.status(404);
    res.json({ error: "Ticket não encontrado" });
    return;
  }

  res.status(200).end();
});

app.put("/parking/:id/pay", async (req, res) => {
  const id = req.params.id;
  const [rowsAffected] = await parking.update(
    { paid: true, paidAt: new Date() },
    { where: { id } }
  );
  if (rowsAffected === 0) {
    res.status(404);
    res.json({ error: "Ticket não encontrado" });
    return;
  }
  res.status(200).end();
});

module.exports = {
  app,
};
