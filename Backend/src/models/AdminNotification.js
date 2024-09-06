const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  files: [{ type: String }],
  dateAdded: { type: Date, default: Date.now },
  // This field will store read status per user
  readStatus: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      read: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model('Notification', NotificationSchema);
