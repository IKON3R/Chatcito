// Importación de módulos necesarios
const express = require('express');
const bodyParser = require('body-parser');

// Creación de la aplicación Express
var app = require('express')();
// Creación del servidor HTTPS con Express
var server = require('https').Server(app);
// Inicialización de Socket.IO en el servidor
var io = require('socket.io')(server);

// Arreglo para almacenar los clientes conectados
var clientes = [];

// Configuración de la aplicación Express
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Configuración del servidor para escuchar en el puerto 443
server.listen(443, '0.0.0.0', () => console.log('Servidor iniciado en 443'));

// Ruta para la página principal
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
// Ruta para la página de chat con un nombre de usuario específico
app.get('/chat/:username', function (req, res) {
  res.sendFile(__dirname + '/public/chat.html');
});

// Endpoint para el inicio de sesión en el chat
app.post('/login', function (req, res) {
  let username = req.body.username;
  let id = req.body.id;
  // Almacenamiento del usuario conectado en el arreglo de clientes
  clientes.push({ id: id, username: username });
  // Emisión de evento 'socket_conectado' a todos los clientes conectados
  io.emit('socket_conectado', { id: id, username: username });
  // Devolución de la lista actualizada de clientes al cliente que inició sesión
  return res.json(clientes);
});

// Endpoint para enviar mensajes en el chat
app.post('/send', function (req, res) {
  let username = req.body.username;
  let id = req.body.id;
  let msg = req.body.text;
  // Emisión de evento 'mensaje' a todos los clientes con el mensaje y el remitente
  io.emit('mensaje', { id: id, msg: msg, username: username });
  // Confirmación de que el mensaje fue enviado correctamente
  return res.json({ text: 'Mensaje enviado.' });
});

// Manejador de eventos cuando se establece una conexión con Socket.IO
io.on('connection', socket => {
  console.log('Socket conectado', socket.id);
  // Manejador de evento cuando un cliente se desconecta
  socket.on('disconnect', () => {
    // Filtrar y eliminar al cliente que se desconectó del arreglo de clientes
    clientes = clientes.filter(cliente => cliente.id != socket.id);
    // Emisión de evento 'socket_desconectado' a todos los clientes
    io.emit('socket_desconectado', { texto: 'Socket desconectado.', id: socket.id });
  });
});