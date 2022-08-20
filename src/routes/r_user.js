import auth from "../auth";
import connect from "../db.js";

//Register new user
let register = async (req, res) => {
  let user = req.body;
  let id;

  try {
    id = await auth.registerUser(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
    return;
  }
  res.json({ id: id });
};

//Get user data from db
let getData = async (req, res) => {
  let query = String(req.query.username);
  try {
    let db = await connect();
    let user = await db.collection("users").findOne({ username: query });
    let userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      admin: user.admin,
      profile: user.profile,
    };
    res.json({ userData });
    return;
  } catch (e) {
    res.status(500).json({ error: e.message });
    return;
  }
};

//Change user email
let changeEmail = async (req, res) => {
  let changes = req.body;
  let newToken = req.jwt;
  let username = changes.username;
  if (changes) {
    let result = await auth.changeUserEmail(username, changes.email);
    if (result) {
      console.log("Email changed successfully");
      let userData = changes;
      userData.token = newToken;
      res.json(userData);
      return;
    } else {
      res.status(500).json({ error: "Cannot change email!" });
      return;
    }
  } else {
    res.status(400).json({ error: "Wrong query!" });
    return;
  }
};

//Change user password
let changePassword = async (req, res) => {
  let changes = req.body;

  if (changes.username && changes.new_password && changes.old_password) {
    let result = await auth.changeUserPassword(
      changes.username,
      changes.old_password,
      changes.new_password
    );

    if (result) {
      res.status(201).send();
      return;
    } else {
      res.status(500).json({ error: "Cannot change password!" });
      return;
    }
  } else {
    res.status(400).json({ error: "Wrong query!" });
    return;
  }
};

export default {
  register,
  changeEmail,
  changePassword,
  getData,
};