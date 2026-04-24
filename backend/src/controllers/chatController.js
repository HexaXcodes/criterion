const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

// Create chat room for a community
exports.createChatRoom = async (req, res) => {
  try {
    const { name, description } = req.body;

    const chatRoom = await ChatRoom.create({
      name,
      description,
      community: req.params.communityId,
      members: [req.user.id]
    });

    res.status(201).json({ message: "Chat room created", chatRoom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all chat rooms for a community
exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      community: req.params.communityId
    });

    res.json(chatRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get message history for a chat room
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chatRoom: req.params.roomId
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};