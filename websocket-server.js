import { WebSocketServer } from "ws";
import chalk from "chalk";
import readline from "readline";

// Crear el servidor WebSocket
const server = new WebSocketServer({ port: 8080 });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.green("> "), // Cambia el prompt a color verde
});

console.log("Servidor WebSocket ejecutándose en ws://localhost:8080");

// Lista de clientes conectados
const clients = [];

server.on("connection", (socket) => {
  console.log("Cliente conectado.");

  // Almacenar la conexión en el array de clientes
  clients.push(socket);

  // Enviar a todos los clientes la lista de clientes conectados
  sendClientsListToAll();

  // Enviar mensaje de bienvenida al cliente
  socket.send(
    "[Servidor] Bienvenido al chat. Por favor, ingresa tu nombre de usuario:"
  );
  // Función para enviar la lista de clientes conectados a todos
  function sendClientsListToAll() {
    const clientNames = clients
      .filter((client) => client.readyState === WebSocket.OPEN)
      .map((client) => client.name || "nadie");
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          `[Servidor] Usuarios conectados: ${clientNames.join(", ")}`
        );
      }
    });
  }

  let clientName = null;

  // Escuchar mensajes del cliente
  socket.on("message", (message) => {
    const texto = message.toString();

    if (!clientName) {
      // Primer mensaje: asumimos que es el nombre
      clientName = texto;
      console.log(`Nombre del cliente recibido: ${clientName}`);
      if (clientName) {
        socket.send(
          `[Servidor] El usuario "${clientName}" se ha unido al chat!`
        );
      }

      // Informar a los demás clientes sobre el nuevo usuario
      notifyClientsAboutNewUser(clientName);
    } else {
      console.log(`[Servidor] Mensaje de ${clientName}: ${texto}`);
      // Reenviar el mensaje a todos los demás clientes
      clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(`[${clientName}] ${texto}`);
        }
      });
    }
  });

  socket.on("close", () => {
    console.log(`[Servidor] El usuario "${clientName}" ha salido del chat.`);
    // Eliminar la conexión del cliente del array
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1);
    }
    // Informar a los demás clientes sobre la desconexión
    notifyClientsAboutUserExit(clientName);
    // Enviar la lista actualizada de clientes conectados a todos
    sendClientsListToAll();
  });

  // Interfaz de línea de comandos para el servidor
  rl.on("line", (input) => {
    if (input.trim() === "/salir") {
      console.log(chalk.yellow("Saliendo del chat..."));
      socket.close(); // Cierra la conexión WebSocket
      rl.close(); // Cierra la interfaz de línea de comandos
      process.exit(0); // Termina el proceso
    }

    // Enviar el mensaje a todos los clientes conectados
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(input);
      }
    });
    rl.prompt(); // Muestra de nuevo el prompt
  });

  rl.prompt(); // Muestra el prompt para el servidor
});

// Función para notificar a todos los clientes sobre un nuevo usuario
function notifyClientsAboutNewUser(clientName, newClientSocket) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== newClientSocket) {
      client.send(`[Servidor] El usuario "${clientName}" se ha unido al chat.`);
    }
  });
}

// Función para notificar a todos los clientes sobre la salida de un usuario
function notifyClientsAboutUserExit(clientName) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(`[Servidor] El usuario "${clientName}" ha salido del chat.`);
    }
  });
}
