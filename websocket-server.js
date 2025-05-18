import { WebSocketServer } from "ws";
import chalk from "chalk";
import readline from "readline";

// Crear un servidor WebSocket
const server = new WebSocketServer({ port: 8080 });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.green("> ") // Cambia el prompt a color verde
});

console.log("Servidor WebSocket ejecutándose en ws://localhost:8080");

socket.on("message", (data) => {
  const msg = data.toString();

  if (msg.startsWith("[Servidor]:")) {
    console.log(chalk.blue.bold(msg)); // Mensaje del servidor en azul negrita
  } else {
    console.log(msg); // Mensajes normales
  }

  rl.prompt(); // Muestra de nuevo el prompt después de cada mensaje recibido
});

socket.on("close", () => {
  console.log(chalk.redBright("\n[Servidor]: Conexión cerrada."));
  rl.close();
  process.exit(0);
});

rl.on("line", (input) => {
  if (input.trim() === "/salir") {
    console.log(chalk.yellow("Saliendo del chat..."));
    socket.close();
    rl.close();
    process.exit(0);
  }

  socket.send(input);
  rl.prompt(); // muestra el prompt de nuevo después de enviar
});

// Manejar nuevas conexiones
server.on("connection", (socket) => {
  console.log("Cliente conectado.");
  socket.send("[Servidor] Bienvenido al chat. Por favor, ingresa tu nombre de usuario:");

  // Variable para almacenar el nombre del cliente
  let clientName = null;

  // Escuchar mensajes del cliente
  socket.on("message", (message) => {
    const texto = message.toString();

    if (!clientName) {
      // Primer mensaje: asumimos que es el nombre
      clientName = texto;
      console.log(`Nombre del cliente recibido: ${clientName}`);
      socket.send(`[Servidor] El usuario "${clientName}" se ha unido al chat!`);
    } 
    else {
      console.log(`[Servidor] Mensaje de ${clientName}: ${texto}`);
      socket.send(`[Servidor] ${clientName}: "${texto}"`);
    }
  });

  // Escuchar mensajes del cliente
  socket.on("message", (message) => {
    console.log(`Mensaje recibido del cliente: ${message}`);

    // Responder al cliente
    socket.send(`[Servidor]: ${message}`);
  });
  socket.on("close", () => {
    console.log(`[Servidor] El usuario "${clientName}" ha salido del chat.`);
  });
});
