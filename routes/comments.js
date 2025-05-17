const router = require('express').Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Add a comment to a post
router.post('/:postId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = new Comment({
      user: req.user.id,
      post: postId,
      content,
      parentComment: req.body.parentComment,
    });

    const comment = await newComment.save();

    // Add comment to post's comments array
    // eslint-disable-next-line no-underscore-dangle
    post.comments.push(comment._id);
    await post.save();

    // If this is a reply, add to parent comment's replies
    if (req.body.parentComment) {
      const parentComment = await Comment.findById(req.body.parentComment);
      if (parentComment) {
        // eslint-disable-next-line no-underscore-dangle
        parentComment.replies.push(comment._id);
        await parentComment.save();
      }
    }

    // eslint-disable-next-line no-underscore-dangle
    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'username profilePicture'
    );

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(201).json({ message: 'Comment added' });
});

// Get all comments for a post
router.get('/post/:postId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate('user', 'username profilePicture')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'username profilePicture' },
      });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a comment
router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { content } = req.body;

    comment.content = content;

    await comment.save();

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Comment updated' });
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Remove comment from post's comments array
    await Post.updateOne(
      { _id: comment.post },
      // eslint-disable-next-line no-underscore-dangle
      { $pull: { comments: comment._id } }
    );

    // If it has a parent comment, remove from parent's replies
    if (comment.parentComment) {
      await Comment.updateOne(
        { _id: comment.parentComment },
        // eslint-disable-next-line no-underscore-dangle
        { $pull: { replies: comment._id } }
      );
    }

    await Comment.deleteOne({ _id: req.params.id });

    res.json({ message: 'Comment removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Comment removed' });
});

// Like/unlike a comment
router.put('/like/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if the comment has already been liked by this user
    if (comment.likes.some((like) => like.toString() === req.user.id)) {
      // Unlike
      comment.likes = comment.likes.filter(
        (like) => like.toString() !== req.user.id
      );
    } else {
      // Like
      comment.likes.unshift(req.user.id);
    }

    await comment.save();

    res.json(comment.likes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Liked/unliked comment' });
});

module.exports = router;
