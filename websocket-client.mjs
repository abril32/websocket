import WebSocket from "ws";
import readline from "readline";

// Establecer la conexión con el servidor WebSocket
const socket = new WebSocket("ws://localhost:8080");

// Interfaz de línea de comandos para escribir mensajes
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ", // Cambio de prompt para que se vea más claro
});

// Mostrar un mensaje cuando la conexión se haya abierto
socket.on("open", () => {
  console.log("Conectado al servidor WebSocket.");
  rl.prompt(); // Muestra el prompt para que el usuario ingrese su mensaje
});

// Manejar los mensajes recibidos del servidor
socket.on("message", (data) => {
  console.log(`Mensaje recibido del servidor: ${data}`);
  rl.prompt(); // Volver a mostrar el prompt después de recibir el mensaje
});

// Manejar la salida y envío de mensajes del cliente
rl.on("line", (input) => {
  if (input.trim() === "/salir") {
    console.log("Saliendo del chat...");
    socket.close(); // Cerrar la conexión cuando el usuario ingresa "/salir"
    rl.close(); // Cerrar la interfaz de línea de comandos
    process.exit(0); // Terminar el proceso
  }

  // Enviar el mensaje al servidor WebSocket
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(input);
    console.log(`Mensaje enviado: ${input}`);
  } else {
    console.log("No se puede enviar el mensaje. La conexión no está abierta.");
  }

  rl.prompt(); // Volver a mostrar el prompt para que el usuario ingrese el siguiente mensaje
});
