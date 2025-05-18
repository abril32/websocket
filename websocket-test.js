import { WebSocketServer } from "ws";
import WebSocket from "ws";

describe("Servidor WebSocket", () => {
  let server;
  let client;

  beforeAll((done) => {
    server = new WebSocketServer({ port: 8080 });
    server.on("connection", (socket) => {
      socket.on("message", (message) => {
        socket.send(`Echo: ${message}`);
      });
    });
    client = new WebSocket("ws://localhost:8080");
    client.on("open", done);
  });

  afterAll(() => {
    server.close();
    client.close();
  });

  test("Debe responder con un mensaje de eco", (done) => {
    client.on("message", (message) => {
      expect(message).toBe("Echo: Test Message");
      done();
    });
    client.send("Test Message");
  });
});
