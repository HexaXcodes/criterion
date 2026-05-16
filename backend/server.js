const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const movieRoutes = require("./src/routes/movieRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const userRoutes = require("./src/routes/userRoutes");
const communityRoutes = require("./src/routes/communityRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const Message = require("./src/models/Message");
const jwt = require("jsonwebtoken");

dotenv.config();
connectDB();

// Backfill language for movies missing it — runs in background after DB connects
setTimeout(() => {
  require("./src/scripts/backfillLanguage").runBackfill().catch(() => {});
}, 3000);

const app = express();
const cors = require("cors");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/communities/:id/posts/:postId/comments", commentRoutes);
app.use("/api/communities/:communityId/chatrooms", chatRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Socket.io — Real time chat
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  // Join a chat room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.id} joined room ${roomId}`);
    socket.to(roomId).emit("userJoined", {
      userId: socket.user.id,
      message: "A user joined the chat"
    });
  });

  // Send message
  socket.on("sendMessage", async (data) => {
    try {
      const { roomId, content } = data;

      // Save message to DB
      const message = await Message.create({
        content,
        sender: socket.user.id,
        chatRoom: roomId
      });

      await message.populate("sender", "name");

      // Broadcast to everyone in the room
      io.to(roomId).emit("newMessage", {
        _id: message._id,
        content: message.content,
        sender: message.sender,
        chatRoom: roomId,
        createdAt: message.createdAt
      });

    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  // Leave room
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.user.id} left room ${roomId}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});