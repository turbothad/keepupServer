const router = require('express').Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username profilePicture' },
      });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const { content, mediaUrl, group } = req.body;

    const newPost = new Post({
      user: req.user.id,
      content,
      mediaUrl,
      group,
    });

    const post = await newPost.save();

    // eslint-disable-next-line no-underscore-dangle
    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'username profilePicture'
    );

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get post by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username profilePicture' },
      });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(201).json({ message: 'Post created' });
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { content, mediaUrl } = req.body;

    post.content = content || post.content;
    if (mediaUrl !== undefined) post.mediaUrl = mediaUrl;

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Post updated' });
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Post.deleteOne({ _id: req.params.id });

    res.json({ message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Post removed' });
});

// Like/unlike a post
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if the post has already been liked by this user
    if (post.likes.some((like) => like.toString() === req.user.id)) {
      // Unlike
      post.likes = post.likes.filter((like) => like.toString() !== req.user.id);
    } else {
      // Like
      post.likes.unshift(req.user.id);
    }

    await post.save();

    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Liked/unliked post' });
});

module.exports = router;
