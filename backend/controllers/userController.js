const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ReturnDocument } = require("mongodb");
const { set } = require("mongoose");
require("dotenv").config();
var ObjectId = require("mongodb").ObjectId;

const uri = process.env.MONGODB_URI;

let client; //global variable to use mongodb
async function connectClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
}

const signup = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    await connectClient();
    const db = client.db("GithubClone"); //database name if not exits then create too
    const userCollection = db.collection("users"); //collection users if not exits then create too

    const user = await userCollection.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepo: [],
    };
    const result = await userCollection.insertOne(newUser);
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECERT_KEY,
      { expiresIn: "1h" },
    );
    res.json({ token, userId :result.insertId });
  } catch (err) {
    console.error("Error during signUp", err.message);
    res.status(500).send("Server error");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    await connectClient();
    const db = client.db("GithubClone"); //database name if not exits then create too
    const userCollection = db.collection("users"); //collection users if not exits then create too

    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credential!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credential!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECERT_KEY, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Error during login: ", err.message);
    res.status(500).send("Server error");
  }
};

const getAllUser = async (req, res) => {
  try {
    await connectClient();
    const db = client.db("GithubClone");
    const userCollection = db.collection("users");

    const users = await userCollection.find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error("Error during Fetching: ", err.message);
    res.status(500).send("Server error");
  }
};

const getUserProfile = async (req, res) => {
  const currentID = req.params.id;
  try {
    await connectClient();
    const db = client.db("GithubClone");
    const userCollection = db.collection("users");

    const user = await userCollection.findOne({
      _id: new ObjectId(currentID),
    });

    if (!user) {
      return res.status(404).json({ message: "User not Found!" });
    }
    res.send(user);
  } catch (err) {
    console.error("Error during Fetching by ID: ", err.message);
    res.status(500).send("Server error");
  }
};

//6a625f17a8e6ce170574bbc4
const updateUserProfile = async (req, res) => {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("GithubClone");
    const userCollection = db.collection("users");

    let updateFields = {};

    if (email) {
      updateFields.email = email;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }
    const result = await userCollection.findOneAndUpdate(
      {
        _id: new ObjectId(currentID),
      },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    if (!result) {
      return res.status(404).json({ message: "User not Found!" });
    }
    return res.status(200).json({
      message: "Profile updated successfully",
      user: result,
    });
  } catch (err) {
    console.error("Error during Updating by ID: ", err.message);
    res.status(500).send("Server error");
  }
};

const deleteUserProfile = async (req, res) => {
  const currentID = req.params;

  try {
    await connectClient();
    const db = client.db("GithubClone");
    const userCollection = db.collection("users");

    const result = await userCollection.deleteOne({
      _id: new ObjectId(currentID),
    });
    if (result.deleteCount == 0) {
      return res.status(404).json({ message: "User not Found!" });
    }
    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error during Updating by ID: ", err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  getAllUser,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
