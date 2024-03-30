const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Config/DB");
const UserRoutes = require("./Routes/UserRoutes");
const ChatRoutes = require("./Routes/ChatRoutes");
const MessageRoutes = require("./Routes/MessageRoutes");
const { notFound, errorHandler } = require("./middleware/ErrorMiddleware");
const cors = require('cors');
const http = require('http'); // Import the HTTP module
const { Server } = require('socket.io');
const { Socket } = require("dgram");

const app = express();
const server = http.createServer(app);
const io = new Server(server); 

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

dotenv.config();
connectDB();

app.use(express.json());

app.get("/", (req,res)=> {
  res.send("API is running");
});

app.use('/user',UserRoutes);
app.use('/chats',ChatRoutes);
app.use('/message',MessageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('A user connected',socket.id);
});
