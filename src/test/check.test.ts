import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

jest.setTimeout(30000);

let token: string;
let mongo: MongoMemoryServer;

beforeAll(async () => {
  // Base de datos Mongo en memoria para aislar la suite
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);

  // Registrar usuario de prueba y obtener token sin depender de otro test
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "User Test", email: "check@test.com", password: "123456" });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
});

describe("Check In/Out", () => {
  it("should create a check-in record", async () => {
    const res = await request(app)
      .post("/api/check/in")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.userId).toBeDefined();
  });

  it("should create a check-out record", async () => {
    const res = await request(app)
      .post("/api/check/out")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.workedHours).toBeDefined();
  });
});

