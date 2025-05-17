const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    settings: {
      theme: { type: String, default: 'dark' },
      notifications: {
        newComments: { type: Boolean, default: true },
        friendRequests: { type: Boolean, default: true },
        groupInvites: { type: Boolean, default: true },
        dailyReminder: { type: Boolean, default: true },
      },
      privacy: {
        profileVisibility: { type: String, default: 'public' },
        allowFriendRequests: { type: Boolean, default: true },
      },
    },
    hasPostedToday: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

module.exports = mongoose.model('User', UserSchema);
