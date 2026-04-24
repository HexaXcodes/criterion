const Community = require("../models/Community");
const Post = require("../models/Post");

// Create community
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, genre, rules, isPrivate } = req.body;

    const exists = await Community.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Community name already taken" });
    }

    const community = await Community.create({
      name,
      description,
      genre,
      rules: rules || [],
      isPrivate: isPrivate || false,
      createdBy: req.user.id,
      members: [req.user.id],
      admins: [req.user.id],
      memberCount: 1
    });

    res.status(201).json({ message: "Community created", community });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all communities
exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .sort({ memberCount: -1 })
      .populate("createdBy", "name");

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single community
exports.getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("members", "name")
      .populate("admins", "name");

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join community
exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    community.members.push(req.user.id);
    community.memberCount += 1;
    await community.save();

    res.json({ message: "Joined community" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave community
exports.leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.createdBy.toString() === req.user.id) {
      return res.status(400).json({ message: "Creator cannot leave community" });
    }

    community.members = community.members.filter(
      id => id.toString() !== req.user.id
    );
    community.admins = community.admins.filter(
      id => id.toString() !== req.user.id
    );
    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();

    res.json({ message: "Left community" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Promote member to admin (admin only)
exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const community = req.community;

    if (!community.members.includes(userId)) {
      return res.status(400).json({ message: "User is not a member" });
    }

    if (community.admins.includes(userId)) {
      return res.status(400).json({ message: "User is already an admin" });
    }

    community.admins.push(userId);
    await community.save();

    res.json({ message: "User promoted to admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove member (admin only)
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const community = req.community;

    if (community.createdBy.toString() === userId) {
      return res.status(400).json({ message: "Cannot remove community creator" });
    }

    community.members = community.members.filter(
      id => id.toString() !== userId
    );
    community.admins = community.admins.filter(
      id => id.toString() !== userId
    );
    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();

    res.json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update community rules (admin only)
exports.updateRules = async (req, res) => {
  try {
    const { rules } = req.body;
    const community = req.community;

    community.rules = rules;
    await community.save();

    res.json({ message: "Rules updated", rules: community.rules });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create post in community
exports.createPost = async (req, res) => {
  try {
    const { title, content, movieId } = req.body;
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!community.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Join community to post" });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      community: req.params.id,
      movie: movieId || null
    });

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by community
exports.getCommunityPosts = async (req, res) => {
  try {
    const posts = await Post.find({ community: req.params.id })
      .populate("author", "name")
      .populate("movie", "title posterUrl")
      .sort({ upvoteCount: -1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upvote post
exports.upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.upvotes.includes(req.user.id)) {
      post.upvotes = post.upvotes.filter(
        id => id.toString() !== req.user.id
      );
      post.upvoteCount -= 1;
      await post.save();
      return res.json({ message: "Upvote removed", upvoteCount: post.upvoteCount });
    }

    post.upvotes.push(req.user.id);
    post.upvoteCount += 1;
    await post.save();

    res.json({ message: "Post upvoted", upvoteCount: post.upvoteCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post (admin only)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const community = req.community;
    const isAdmin = community.admins.some(
      id => id.toString() === req.user.id
    );
    const isAuthor = post.author.toString() === req.user.id;

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};