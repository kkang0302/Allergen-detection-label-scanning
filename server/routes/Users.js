const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  // Check if username already exists
  const existingUser = await Users.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).json({ error: "Username already exists" });
  }
  bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
    });
    res.json("SUCCESS");
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username: username } });
  if (!user) {
    return res.json({ error: "User not found" });
  }
  bcrypt.compare(password, user.password).then((match) => {
    if (!match) {
      return res.json({ error: "Wrong username and password combination" });
    }
    const accessToken = sign(
      { username: user.username, id: user.id },
      "importantsecret"
    );
    res.json({ token: accessToken, username: username, id: user.id });
  });
});

router.get("/auth", validateToken, (req, res) => {
  res.json(req.user);
});

router.get("/basicinfo/:id", async (req, res) => {
  const { id } = req.params;
  const basicInfo = await Users.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (!basicInfo) {
    return res.json({ error: "User not found" });
  }
  res.json(basicInfo);
});

router.put("/changepassword", validateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await Users.findOne({ where: { username: req.user.username } });
  bcrypt.compare(oldPassword, user.password).then((match) => {
    if (!match) {
      return res.json({ error: "Wrong password" });
    }
    bcrypt.hash(newPassword, 10).then((hash) => {
      Users.update(
        { password: hash },
        { where: { username: req.user.username } }
      );
      res.json("SUCCESS");
    });
  });
});

router.post("/save-scan", validateToken, async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ accessToken
    const { labelText, detectedAllergens } = req.body;

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentHistory = Array.isArray(user.scannedLabels)
      ? user.scannedLabels
      : [];

    const newItem = {
      time: new Date().toISOString(),
      labelText: labelText || "",
      detectedAllergens: Array.isArray(detectedAllergens)
        ? detectedAllergens
        : [],
    };

    const updatedHistory = [...currentHistory, newItem];

    await user.update({ scannedLabels: updatedHistory });

    res.json({ message: "Saved", history: updatedHistory });
  } catch (err) {
    console.error("Error saving scan history", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
