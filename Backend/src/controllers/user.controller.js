const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const sessionModel = require("../models/session.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../services/email.service");
const { generateOtp, getOtpHtml } = require("../utils/utils");

async function registerUser(req, res) {
  try {
    const { firstname, lastname, email, password } = req.body;

    const isUserExist = await userModel.findOne({ email });

    if (isUserExist) {
      return res.status(409).json({
        success: false,
        message: "Email already exist",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      firstname,
      lastname,
      email,
      password: hash,
    });

    const otp = generateOtp();
    const html = getOtpHtml(otp);

    const otpHash = await bcrypt.hash(otp, 10);

    await otpModel.create({
      email,
      user: user._id,
      otpHash,
    });

    await sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html);

    const verifyToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      verifyToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.verified) {
      return res.status(401).json({
        success: false,
        message: "Email not verified",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        sessionId: session._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getMe(req, res) {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "user fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const session = await sessionModel.findOne({
      user: decoded.id,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const isMatch = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const accessToken = jwt.sign(
      {
        id: decoded.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const newRefreshToken = jwt.sign(
      {
        id: decoded.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired or invalid",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const userId = req.user.id;

    const session = await sessionModel.findOne({
      user: userId,
      revoked: false,
    });

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Session not found",
      });
    }

    const isMatch = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function verifyEmail(req, res) {
  const { otp, token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const otpDoc = await otpModel.findOne({
      user: decoded.id,
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const isValid = await bcrypt.compare(otp, otpDoc.otpHash);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      decoded.id,
      { verified: true },
      { new: true },
    );

    await otpModel.deleteMany({
      user: decoded.id,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        email: user.email,
        verified: user.verified,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;

    const { firstname, lastname, phone, address } = req.body;

    const updateData = {};

    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOtp();
    const html = getOtpHtml(otp);
    const otpHash = await bcrypt.hash(otp, 10);

    await otpModel.deleteMany({ user: user._id });

    await otpModel.create({
      email,
      user: user._id,
      otpHash,
    });

    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP code is ${otp}`,
      html,
    );

    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function verifyForgotOtp(req, res) {
  const { otp, token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const otpDoc = await otpModel.findOne({
      user: decoded.id,
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or invalid",
      });
    }

    const isValid = await bcrypt.compare(otp, otpDoc.otpHash);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await otpModel.deleteMany({
      user: decoded.id,
    });

    const passResetToken = jwt.sign(
      { id: decoded.id, purpose: "reset_password" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      passResetToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "reset_password") {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await userModel.findByIdAndUpdate(
      decoded.id,
      { password: hash },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function resendOtp(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      });
    }

    const { id, email } = decoded;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOtp();
    const html = getOtpHtml(otp);
    const otpHash = await bcrypt.hash(otp, 10);

    // Delete existing OTPs for this user
    await otpModel.deleteMany({ user: user._id });

    // Create new OTP
    await otpModel.create({
      email: user.email,
      user: user._id,
      otpHash,
    });

    await sendEmail(
      user.email,
      "Resend OTP Verification",
      `Your new OTP code is ${otp}`,
      html,
    );

    res.status(200).json({
      success: true,
      message: "OTP resent successfully to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function contactUs(req, res) {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const adminEmail = process.env.GOOGLE_USER;
    const emailSubject = `New Contact Inquiry: ${subject}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2F2421; border-bottom: 2px solid #e5b7b7; padding-bottom: 10px;">New Contact Form Submission</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 5px solid #2F2421; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
        <p style="font-size: 0.8rem; color: #777; text-align: center; margin-top: 30px;">Sent from Lumina Skincare Contact Form</p>
      </div>
    `;

    await sendEmail(adminEmail, emailSubject, message, html);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  logout,
  verifyEmail,
  updateProfile,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
  resendOtp,
  contactUs,
};
