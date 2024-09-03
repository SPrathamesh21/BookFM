const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');


const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "You already have an account. You can log in now." });
    }

    const otp = generateOtp();
    const currentISTTime = moment.tz('Asia/Kolkata');
    const expiresAt = currentISTTime.add(2, 'minutes').toDate();

    const otpDoc = new Otp({ email, otp, expiresAt });
    await otpDoc.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    await Otp.deleteMany({ email });

    const currentISTTime = moment.tz('Asia/Kolkata');
    const otp = generateOtp();
    const expiresAt = currentISTTime.add(2, 'minutes').toDate();

    const otpDoc = new Otp({ email, otp, expiresAt });
    await otpDoc.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your New OTP Code',
      text: `Your new OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'New OTP sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


exports.verifyOtpAndSignup = async (req, res) => {
  const { fullName, email, phone, password, otp } = req.body;

  try {
    const otpDoc = await Otp.findOne({ email });

    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const currentISTTime = moment.tz('Asia/Kolkata');

    // Compare the actual moment objects instead of formatted strings
    if (otpDoc.otp !== otp || currentISTTime.isAfter(moment(otpDoc.expiresAt, 'Do MMM YYYY hh:mm A'))) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "You already have an account. You can log in now." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });
    await newUser.save();

    await Otp.deleteOne({ email });

    const token = jwt.sign(
      {
        fullName: newUser.fullName,
        userId: newUser._id,
        email: newUser.email,
        phone: newUser.phone,
        isPremium: newUser.isPremium,
        premiumPlan: newUser.premiumPlan,
      },
      process.env.JWT_SECRET,
      { expiresIn: '180d' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months
    });

    res.status(201).json({
      message: "You've successfully registered!",
      user: {
        email: newUser.email,
        fullName: newUser.fullName,
        phoneNumber: newUser.phone,
        isPremium: newUser.isPremium,
        premiumPlan: newUser.premiumPlan,
        userId: newUser._id,

      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, fullName:user.fullName, phone:user.phone, isPremium:user.isPremium, premiumPlan:user.premiumPlan, premiumExpiresAt:user.premiumExpiresAt },
      process.env.JWT_SECRET,
      { expiresIn: '180d' } 
    );

    // Set the token as an HttpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  
      sameSite: 'strict',  
      domain: 'localhost',  
      path: '/',
      maxAge: 6 * 30 * 24 * 60 * 60 * 1000
    });

    // Return user details along with the token
    res.status(200).json({
      message: "Login successful",
      user: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        isPremium: user.isPremium,
        premiumPlan: user.premiumPlan,
        premiumExpiresAt: user.premiumExpiresAt
      },
    });
  } catch (error) {
    console.error('Log in controller error: ',error);
    res.status(500).json({ error: error.message });
  }
};

