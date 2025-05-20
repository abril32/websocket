import { WebSocketServer } from "ws";
import chalk from "chalk";
import readline from "readline";

// Crear un servidor WebSocket
const server = new WebSocketServer({ port: 8080 });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.green("> "), // Cambia el prompt a color verde
});

console.log("Servidor WebSocket ejecutándose en ws://localhost:8080");

// Manejar nuevas conexiones
server.on("connection", (socket) => {
  console.log("Cliente conectado.", 'background: #222; color: #bada55');
  socket.send(
    "[Servidor] Bienvenido al chat. Por favor, ingresa tu nombre de usuario:" ,'background: #222; color: #bada55'
  );

  let clientName = null;

  // Escuchar mensajes del cliente
  socket.on("message", (message) => {
    const texto = message.toString();

    if (!clientName) {
      // Primer mensaje: asumimos que es el nombre
      clientName = texto;
      console.log(`Nombre del cliente recibido: ${clientName}`);
      socket.send(`[Servidor] El usuario "${clientName}" se ha unido al chat!`, 'background: #222; color: #bada55');
    } else {
      console.log(`[Servidor] Mensaje de ${clientName}: ${texto}`, 'background: #222; color: #bada55');
      socket.send(`[Servidor] ${clientName}: "${texto}"`, 'background: #222; color: #bada55' );
    }
  });

  socket.on("close", () => {
    console.log(`[Servidor] El usuario "${clientName}" ha salido del chat.` , 'background: #222; color: #bada55');
  });

  // Interfaz de línea de comandos para el servidor
  rl.on("line", (input) => {
    if (input.trim() === "/salir") {
      console.log(
        chalk.yellow("Saliendo del chat...", "background: #222; color: #bada55")
      );
      socket.close(); // Cierra la conexión WebSocket
      rl.close(); // Cierra la interfaz de línea de comandos
      process.exit(0); // Termina el proceso
    }

    // Enviar el mensaje al cliente conectado
    socket.send(input);
    rl.prompt(); // Muestra de nuevo el prompt
  });

  rl.prompt(); // Muestra el prompt para el servidor
});
