import http from "http";
import express from "express";
import { Server, Socket } from "socket.io";

interface Room {
  id: string; 
  messages : any[]
}



let connectedUsers : string[] = []; 
let rooms : Room[] = [{ id: 'room1', messages: []}, { id: 'room2', messages: []}];

const app = express();
const server = http.createServer(app);

const io = new Server(server);


app.get("/", (_, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  //on connection user should no tify is connected
  socket.on('new_connection', (user) => {
    connectedUsers.push(user);
    io.emit('user_connected', connectedUsers); 
  }); 
  //msg { roomx , msg}
  //meter el mensaje en la room x
  socket.on("join_room", (room) => {
    socket.join(room); 
    console.log('user joined room : ' + room);
    socket.on("chat message", (msg) => {
        console.log(msg);  
        let roomMessages; 
        rooms.forEach(element => {
         if(element.id === room){
           element.messages.push(msg);
           roomMessages = element.messages; 
         } 
        });
        io.to(room).emit("chat message", roomMessages);
      });
    
  });

  socket.on('new_disconnection', (disconnected) => {
    connectedUsers = connectedUsers.filter((value) => value !== disconnected); 
    io.emit('user_disconnected', disconnected);
    socket.disconnect(); 
  } )

});

server.listen(4444, () => {
  console.log("Listening on port 4444");
});


