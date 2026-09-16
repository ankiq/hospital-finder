const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "hospital_finder_secret_key_2026";

const formatUserOutput = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.fullName,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  role: user.role || "patient",
  age: user.age,
  gender: user.gender,
  bloodGroup: user.bloodGroup,
  address: user.address,
  emergencyContactName: user.emergencyContactName,
  emergencyContactPhone: user.emergencyContactPhone,
  allergies: user.allergies
});

exports.getProfile = async (req, res) => {
  try {
    const email = req.query.email || req.user?.email;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email query param required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: "User profile not found." });
    }

    res.json({
      success: true,
      user: formatUserOutput(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.patientLogin = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginId = (identifier || email || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, error: "Please provide both Email/Phone and Password." });
    }

    let user = await User.findOne({
      $or: [{ email: loginId.toLowerCase() }, { phone: loginId }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "No patient account registered with this Email/Phone. Please register first."
      });
    }

    // Secure Bcrypt Password Comparison
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Incorrect Password. Please verify your credentials and try again."
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role || "patient" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: formatUserOutput(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, age, gender, bloodGroup } = req.body;

    // if (!fullName || !email || !password) {
    //   return res.status(400).json({ success: false, error: "Full Name, Email, and Password are required." });
    // }

    if(
      [fullName,email,password].some((field) => field?.trim() === "")
    ){
      return res.status(400).json({success : false,error : "Full Name ,Email , and Password are required."});
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : "";

    let existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account already exists with this Email Address or Phone Number. Please sign in instead."
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      age: age || 25,
      gender: gender || "Male",
      bloodGroup: bloodGroup || "O+",
      role: "patient"
    });

    const token = jwt.sign({ id: user._id, role: user.role,email:user.email || "patient" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Account registered successfully!",
      token,
      user: formatUserOutput(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "An account with this Email or Phone Number is already registered. Please log in."
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { identifier, email, newPassword } = req.body;
    const targetEmail = identifier || email;
    console.log(req.body);
    let user = await User.findOne({ email: targetEmail?.toLowerCase() });
    if (user && newPassword) {
      user.password = newPassword;
      await user.save();
    }

    res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password."
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, fullName, phone, age, gender, bloodGroup, address, emergencyContactName, emergencyContactPhone, allergies, avatarUrl } = req.body;
    let user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      user = new User({ email: email?.toLowerCase(), fullName, password: "defaultPassword123" });
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (address) user.address = address;
    if (emergencyContactName) user.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone) user.emergencyContactPhone = emergencyContactPhone;
    if (allergies) user.allergies = allergies;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({
      success: true,
      message: "Profile and Picture synchronized with database successfully!",
      user: formatUserOutput(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.checkDuplicate = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPhone = phone ? phone.trim() : "";

    const user = await User.findOne({
      $or: [
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    });

    if (user) {
      return res.json({
        success: true,
        exists: true,
        message: "An account with this Email Address or Phone Number is already registered. Please log in instead."
      });
    }

    res.json({
      success: true,
      exists: false
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
