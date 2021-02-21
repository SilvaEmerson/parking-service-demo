const request = require("supertest");
const { app } = require("../src/app");
const { db } = require("../src/database");

beforeAll(async (done) => {
  await db.sync({ force: true });
  done();
});

describe("`/parking` POST tests", () => {
  afterEach(async (done) => {
    await db.truncate();
    done();
  });

  it("should status code be 201 and have a `reserve_number` property", async (done) => {
    const res = await request(app).post("/parking").send({
      plate: "ABC-1234",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("ticket_number");
    expect(res.body.ticket_number).toBeGreaterThan(0);
    done();
  });

  it("should status code be 201 and have a `reserve_number` property, even with plate letters in lowercase", async (done) => {
    const res = await request(app).post("/parking").send({
      plate: "abc-1234",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("ticket_number");
    expect(res.body.ticket_number).toBeGreaterThan(0);
    done();
  });

  it("should status code be 400 and have a `error` property, when both digits and letters number exceed the limit", async (done) => {
    const res = await request(app).post("/parking").send({
      plate: "AAAA-444444",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
    done();
  });

  it("should status code be 400 and have a `error` property, when letters number is bellow the limit", async (done) => {
    const res = await request(app).post("/parking").send({
      plate: "AA-444444",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
    done();
  });

  it("should status code be 400 and have a `error` property, when digits number is bellow the limit", async (done) => {
    const res = await request(app).post("/parking").send({
      plate: "AAA-444",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
    done();
  });

  it("should status code be 400 and have a `reserve_number` property", async (done) => {
    const res = await request(app).post("/parking").send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).not.toHaveProperty("ticket_number");
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Propriedade `plate` não está presente");
    done();
  });
});

describe("`/parking/:plate` GET tests", () => {
  afterEach(async (done) => {
    await db.truncate();
    done();
  });

  it("should status code be 200 and have a single one history instance", async (done) => {
    const plate = "ABC-1234";
    const res = await request(app).post("/parking").send({
      plate,
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("ticket_number");
    expect(res.body.ticket_number).toBeGreaterThan(0);

    const getRes = await request(app).get(`/parking/${plate}`);

    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body).toHaveLength(1);

    const firstInstance = getRes.body[0];
    expect(firstInstance.left).toBeFalsy();
    expect(firstInstance.paid).toBeFalsy();
    expect(firstInstance.leftAt).toBeNull();
    expect(firstInstance.enteredAt).not.toBeNull();

    done();
  });

  it("should status code be 404 and have a error message when the given plate was not registered", async (done) => {
    const plate = "ABC-1233";
    const getRes = await request(app).get(`/parking/${plate}`);

    expect(getRes.statusCode).toEqual(404);
    expect(getRes.body).toHaveProperty("error");
    expect(getRes.body.error).toBe("Placa não encontrada");

    done();
  });

  it("should status code be 400 and have a error message when the given a invalid plate", async (done) => {
    const plate = "ABC-12333";
    const getRes = await request(app).get(`/parking/${plate}`);

    expect(getRes.statusCode).toEqual(400);
    expect(getRes.body).toHaveProperty("error");
    expect(getRes.body.error).toBe("Placa inválida");

    done();
  });

  it("should status code be 400 and have a error message when was not given a plate", async (done) => {
    const getRes = await request(app).get(`/parking`);

    expect(getRes.statusCode).toEqual(400);
    expect(getRes.body).toHaveProperty("error");
    expect(getRes.body.error).toBe("Placa não fornecida");

    done();
  });
});

describe("`/parking/:id/pay` PUT tests", () => {
  afterEach(async (done) => {
    await db.truncate();
    done();
  });

  it("should status code be 200 when `left` is false", async (done) => {
    const plate = "ABC-1234";
    const res = await request(app).post("/parking").send({
      plate,
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("ticket_number");
    expect(res.body.ticket_number).toBeGreaterThan(0);

    const putRes = await request(app).put(
      `/parking/${res.body.ticket_number}/pay`
    );

    expect(putRes.statusCode).toEqual(200);

    const getRes = await request(app).get(`/parking/${plate}`);

    const firstInstance = getRes.body[0];
    expect(getRes.statusCode).toEqual(200);
    expect(firstInstance.paid).toBeTruthy();
    expect(firstInstance.paidAt).not.toBeNull();

    done();
  });

  it("should status code be 404 when ticket id was not found", async (done) => {
    const randomId = Math.floor(Math.random() * 10000);
    const putRes = await request(app).put(`/parking/${randomId}/pay`);

    expect(putRes.statusCode).toEqual(404);
    expect(putRes.body).toHaveProperty("error");
    expect(putRes.body.error).toBe("Ticket não encontrado");

    done();
  });
});

describe("`/parking/:id/out` PUT tests", () => {
  afterEach(async (done) => {
    await db.truncate();
    done();
  });

  it("should status code be 200 when `paid` is true", async (done) => {
    const plate = "ABC-1234";
    const res = await request(app).post("/parking").send({
      plate,
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("ticket_number");
    expect(res.body.ticket_number).toBeGreaterThan(0);

    const putRes = await request(app).put(
      `/parking/${res.body.ticket_number}/pay`
    );

    expect(putRes.statusCode).toEqual(200);

    const outRes = await request(app).put(
      `/parking/${res.body.ticket_number}/out`
    );

    expect(outRes.statusCode).toEqual(200);

    const getRes = await request(app).get(`/parking/${plate}`);

    const firstInstance = getRes.body[0];
    expect(getRes.statusCode).toEqual(200);
    expect(firstInstance.paid).toBeTruthy();
    expect(firstInstance.paidAt).not.toBeNull();
    expect(firstInstance.left).toBeTruthy();
    expect(firstInstance.leftAt).not.toBeNull();
    expect(firstInstance.time).not.toBeNull();

    done();
  });

  it("should status code be 409 when `paid` is false", async (done) => {
    const plate = "ABC-1234";
    const res = await request(app).post("/parking").send({
      plate,
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("ticket_number");
    expect(res.body.ticket_number).toBeGreaterThan(0);

    const outRes = await request(app).put(
      `/parking/${res.body.ticket_number}/out`
    );

    expect(outRes.statusCode).toEqual(409);
    expect(outRes.body).toHaveProperty("error");
    expect(outRes.body.error).toBe(
      "Ticket não pode ser fechado porque não foi pago"
    );

    const getRes = await request(app).get(`/parking/${plate}`);

    const firstInstance = getRes.body[0];
    expect(getRes.statusCode).toEqual(200);
    expect(firstInstance.paid).toBeFalsy();
    expect(firstInstance.paidAt).toBeUndefined();
    expect(firstInstance.left).toBeFalsy();
    expect(firstInstance.leftAt).toBeNull();
    expect(firstInstance.time).toBeNull();

    done();
  });

  it("should status code be 404 when ticket id is not found", async (done) => {
    const randomId = Math.floor(Math.random() * 10000);
    const outRes = await request(app).put(`/parking/${randomId}/out`);

    expect(outRes.statusCode).toEqual(404);
    expect(outRes.body).toHaveProperty("error");
    expect(outRes.body.error).toBe("Ticket não encontrado");

    done();
  });
});
