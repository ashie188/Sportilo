import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { createUser, findUserByEmail } from "../models/userModel.js";
import generateToken from "../Jwt_utils/generateToken.js";
import { sendEmail } from "../services/emailService.js";
import { welcomeEmail } from "../services/templates/welcomeEmail.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check existing user
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await createUser(name, email, hashedPassword, "local");

    //welcome email
    sendEmail({
      to: user.email,
      subject: "Welcome to Sportilo!",
      html: welcomeEmail(user.name),
    }).catch((err) => {
      console.log("Welcome email failed at registeruser in authcontroller");
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.provider === "google") {
      return res.status(401).json({
        message:
          "This account was created using Google. Please continue with Google.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    // create token
    const token = generateToken(user);

    const { password: _, ...safeUser } = user;
    res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//OAUTH GOOGLE

export const googleLogin = async (req, res) => {
  try {
    const { token: googleToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    const existingUser = await findUserByEmail(email);

    let user = existingUser;

    if (!user) {
      user = await createUser(name, email, null, "google");
    
      //welcome email
      sendEmail({
      to: user.email,
      subject: "Welcome to Sportilo!",
      html: welcomeEmail(user.name),
    }).catch((err) => {
      console.log("Welcome email failed in googlelogin in authcontroller");
    });
    }

    const token = generateToken(user);

    const { password, ...safeUser } = user;

    return res.status(200).json({
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};
