
const express=require('express');
const jwt=require('jsonwebtoken');
const http=require('http');
const path=require ('path');
const { Server } = require('socket.io');

const app=express();
const server=http.createServer(app);
const io=new Server(server);
const JWT_SECRET='alsfi1010';

const users={};
const roomUsers={};

io.use((socket,next)=>{
    const token=socket.handshake.query.token;
    if(!token){
        return next(new Error('token missing'))
    }
    jwt.verify(token,JWT_SECRET,(err,decoded)=>{
        if(err){
            return next(new Error('authentication errror'));
        
        }
        socket.user=decoded.user;
        next();
    });
});

io.on('connection', (socket)=>{
    console.log(`A user connected: ${socket.id}`);

    socket.on('join-room', ({room,user})=>{
        //one to one chat
    if(!roomUsers[room]){
        roomUsers[room]=new Set();
    }
    if(roomUsers[room].size>=2){
        socket.emit('room-full',room);
        return;
    }
        socket.join(room);
        //new line added
        users[socket.id]={room,user};
        roomUsers[room].add(socket.id);
        console.log(`User ${user} joined room: ${room}`);

        //notify others
        socket.to(room).emit('message',{
            user:'New-user join',text:`${user}`
        });
    });
    
    socket.on("user-message" ,({user,text,room})=>{
        io.to(room).emit('message',{user,text});

    });
    socket.on('disconnect', ()=>{
    const userData=users[socket.id];
    if(userData){
        const {room,user}=userData;
        socket.to(room).emit('message',{
            user:'User left',
            text:`${user}`
        });
        delete users[socket.id];
        if(roomUsers[room].size===0){
            delete roomUsers[room]
        }
    }
    console.log(`user disconnected : ${socket.id}`);
})
});



app.use(express.static(path.resolve('./public')));


app.get("/",(req,res)=>{
    return res.sendFile('/public/index.html')
});




server.listen(3000,()=>{
    console.log('server is running on port 3000')
})


