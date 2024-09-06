const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  profileImage: { type: Buffer, default: null },
  imageType: { type: String, default: null },
  favoriteArtist: { type: String, default: '' },
  age: { type: Number, default: null },
  dob: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female'], default: null },
  address: { type: String, default: '' },
  socialMediaLink: { type: String, default: '' },
  isPremium: { type: Boolean, default: false },
  premiumPlan: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: null },
  premiumExpiresAt: { type: Date, default: null },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: [] }],
  notifications: [
    {
      notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
      read: { type: Boolean, default: false }
      
    }
  ]
}, { timestamps: true });

userSchema.virtual('profileImageURL').get(function() {
  if (this.profileImage != null && this.imageType != null) {
    return `data:${this.imageType};base64,${this.profileImage.toString('base64')}`;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
