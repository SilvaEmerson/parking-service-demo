const { parking } = require("../database");
const { formatDistanceToNow, parseJSON } = require("date-fns");
const { Op } = require("sequelize");

const isPlateValid = (plate) => {
  const matches = plate.match(/^\w{3}-\d{4}$/gi, plate);
  return matches && matches.length !== 0;
};

const getHistory = async (req, res) => {
  const params = req.params;
  const plate = params.plate;

  if (!isPlateValid(plate)) {
    res.status(400);
    res.json({ error: "Placa inválida" }).end();
    return;
  }

  const result = await parking.findAll({ where: { plate: params.plate } });

  if (result.length === 0) {
    res.status(404);
    res.json({ error: "Placa não encontrada" }).end();
    return;
  }

  res.status(200);
  res.json(result).end();
};

const createTicket = async (req, res) => {
  const bodyHavePlateProp = Object.keys(req.body).includes("plate");
  if (!bodyHavePlateProp) {
    res.status(400);
    res.json({ error: "Propriedade `plate` não está presente" });
    return;
  }

  const plate = req.body.plate;

  if (!isPlateValid(plate)) {
    res.status(400);
    res.json({ error: "Placa inválida" }).end();
    return;
  }

  const ticket = await parking.findOne({
    where: {
      plate: plate.toUpperCase(),
      [Op.or]: [{ left: false }, { paid: false }],
    },
  });

  if (ticket) {
    res.status(409);
    res
      .json({
        error:
          "Reserva não pode ser aberta enquanto outra está em uso com a mesma placa",
      })
      .end();
    return;
  }

  const result = await parking.create({ plate: plate.toUpperCase() });
  res.status(201);
  res.json({ ticket_number: result.id }).end();
};

const closeTicket = async (req, res) => {
  const id = req.params.id;

  const ticket = await parking.findOne({ where: { id } });

  if (!ticket) {
    res.status(404);
    res.json({ error: "Ticket não encontrado" }).end();
    return;
  }

  if (!ticket.paid) {
    res.status(409);
    res
      .json({ error: "Ticket não pode ser fechado porque não foi pago" })
      .end();
    return;
  }

  const now = new Date();

  const timeFormated = formatDistanceToNow(parseJSON(ticket.enteredAt));

  await parking.update(
    { left: true, leftAt: now, time: timeFormated },
    { where: { id } }
  );

  res.status(200).end();
};

const payTicket = async (req, res) => {
  const id = req.params.id;
  const [rowsAffected] = await parking.update(
    { paid: true, paidAt: new Date() },
    { where: { id } }
  );
  if (rowsAffected === 0) {
    res.status(404);
    res.json({ error: "Ticket não encontrado" }).end();
    return;
  }
  res.status(200).end();
};

module.exports = {
  getHistory,
  createTicket,
  closeTicket,
  payTicket,
};
