// Conexión al servidor de Socket.IO en la dirección proporcionada
var socket = io.connect('https://chat-9buh.onrender.com:443/');
// Selección del elemento de lista de usuarios y obtención del nombre de usuario desde la URL
var list = document.querySelector('#lista-users');
var username = window.location.pathname.replace('/chat/', '');
// Arreglo para almacenar los clientes conectados
var clientes = [];

// Función para conectarse al chat
function conectarChat() {
  // Obtención del ID del socket y envío de solicitud de login al servidor
  var id = socket.id;
  console.log('id:', socket.id, 'useranme:', username);
  $.post('/login', {username: username, id: id}, function (data) {
    console.log(data);
    // Almacenamiento de los datos de clientes recibidos del servidor
    clientes = data;
    // Mostrar mensaje de carga mientras se procesa la lista de usuarios
    list.innerHTML += 'Cargando...';
    var html = '';
    // Generación de la lista de usuarios conectados
    clientes.forEach(function (cliente) {
      html += '<li>' + cliente.username + '</li>';
    });
    list.innerHTML = html;
    // Ocultar el indicador de carga una vez que se completa la operación
    $('.loader').hide();
  });
}

// Función para enviar mensajes al presionar Enter
function enviarMensaje(e) {
  if (e.which != 13) return;
  var msg = document.querySelector('#input').value;
  if (msg.length <= 0) return;
  // Envío del mensaje al servidor
  $.post('/send', {
    text: msg,
    username: username,
    id: socket.id
  }, function (data) {
    document.querySelector('#input').value = '';
  });
}

// Evento para recibir mensajes del servidor y mostrarlos en el chat
socket.on('mensaje', function (data) {
  // Sanitización de los datos recibidos para evitar posibles vulnerabilidades
  data.username = data.username.replace('</', '');
  var sanitized = data.msg.replace('</', '');
  sanitized = sanitized.replace('>', '');
  sanitized = sanitized.replace('<', '');
  // Comprobación y generación de mensaje local o remoto
  if (data.id == socket.id) {
    var msj = `
    <div class="local-message">
      <strong>${data.username}: </strong>
      <p>${sanitized}</p>
    </div>
    `;
    document.querySelector('.mensajes-container').innerHTML += msj;
  } else {
    var msj = `
    <div class="remote-message">
      <strong>${data.username}: </strong>
      <p>${sanitized}</p>
    </div>
    `;
    document.querySelector('.mensajes-container').innerHTML += msj;
  }
});

// Evento cuando un socket se desconecta
socket.on('socket_desconectado', function (data) {
  console.log(data);
  // Filtrar el cliente desconectado del arreglo de clientes
  clientes = clientes.filter(function (cliente) {
    console.log(cliente);
    return cliente.id != data.id;
  });
  // Mostrar mensaje de carga mientras se actualiza la lista de usuarios
  list.innerHTML += 'Cargando...';
  var html = '';
  // Actualizar la lista de usuarios conectados
  clientes.forEach(function (cliente) {
    html += '<li>' + cliente.username + '</li>';
  });
  list.innerHTML = html;
});

// Evento cuando un socket se conecta
socket.on('socket_conectado', function (data) {
  console.log(data);
  // Agregar el nuevo cliente al arreglo de clientes
  clientes.push(data);
  // Mostrar mensaje de carga mientras se actualiza la lista de usuarios
  list.innerHTML += 'Cargando...';
  var html = '';
  // Actualizar la lista de usuarios conectados
  clientes.forEach(function (cliente) {
    html += '<li>' + cliente.username + '</li>';
  });
  list.innerHTML = html;
});