const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const portArduino = new SerialPort({
  path: "COM5",
  baudRate: 9600,
});
const parser = portArduino.pipe(new ReadlineParser({ delimiter: "\n" }));

portArduino.on("open", () => {
  console.log("Serial Port открыт");
});

parser.on("data", (data) => {
  console.log("Arduino:", data.trim());
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Клиент подключен");

  socket.on("command", (data) => {
    console.log("Команда от клиента:", data);
    portArduino.write(data + "\n");
  });

  socket.on("disconnect", () => {
    console.log("Клиент отключился");
  });
});

server.listen(3000, () => {
  console.log("Сервер запущен на http://localhost:3000");
});
