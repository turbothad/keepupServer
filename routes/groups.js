const router = require('express').Router();
const Group = require('../models/Group');
const auth = require('../middleware/auth');

// Get all groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('createdBy', 'username profilePicture')
      .populate('members.user', 'username profilePicture');

    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, coverImage, isPrivate } = req.body;

    const newGroup = new Group({
      name,
      description,
      coverImage,
      isPrivate,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }],
    });

    const group = await newGroup.save();

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get group by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'username profilePicture')
      .populate('members.user', 'username profilePicture')
      .populate({
        path: 'posts',
        populate: { path: 'user', select: 'username profilePicture' },
      });

    if (!group) return res.status(404).json({ message: 'Group not found' });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Group found' });
});

// Update group
router.put('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if user is an admin
    const member = group.members.find(
      (m) => m.user.toString() === req.user.id && m.role === 'admin'
    );

    if (!member) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { name, description, coverImage, isPrivate } = req.body;

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (coverImage !== undefined) group.coverImage = coverImage;
    if (isPrivate !== undefined) group.isPrivate = isPrivate;

    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Group updated' });
});

// Join a group
router.put('/join/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if user is already a member
    if (
      group.members.some((member) => member.user.toString() === req.user.id)
    ) {
      return res
        .status(400)
        .json({ message: 'Already a member of this group' });
    }

    group.members.push({ user: req.user.id, role: 'member' });

    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Joined the group successfully' });
});

// Leave a group
router.put('/leave/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if user is a member
    if (
      !group.members.some((member) => member.user.toString() === req.user.id)
    ) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }

    // Remove the user from members
    group.members = group.members.filter(
      (member) => member.user.toString() !== req.user.id
    );

    await group.save();

    res.json({ message: 'Left the group successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: 'Left the group successfully' });
});

module.exports = router;
