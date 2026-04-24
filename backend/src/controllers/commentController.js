const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Community = require("../models/Community");

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      content,
      author: req.user.id,
      post: req.params.postId
    });

    await comment.populate("author", "name");

    res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all comments on a post
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name")
      .sort({ upvoteCount: -1, createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upvote comment
exports.upvoteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.upvotes.includes(req.user.id)) {
      comment.upvotes = comment.upvotes.filter(
        id => id.toString() !== req.user.id
      );
      comment.upvoteCount -= 1;
      await comment.save();
      return res.json({ message: "Upvote removed", upvoteCount: comment.upvoteCount });
    }

    comment.upvotes.push(req.user.id);
    comment.upvoteCount += 1;
    await comment.save();

    res.json({ message: "Comment upvoted", upvoteCount: comment.upvoteCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isAuthor = comment.author.toString() === req.user.id;

    // Check if user is community admin
    const post = await Post.findById(req.params.postId);
    const community = await Community.findById(post.community);
    const isAdmin = community.admins.some(
      id => id.toString() === req.user.id
    );

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};