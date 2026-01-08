const express = require('express');
const router = express.Router();
const { UserAllergens, Users, Allergens } = require('../models');

// Get the list of allergens a user is interested in
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userAllergens = await UserAllergens.findAll({
      where: { userId },
      include: [{ model: Allergens }]
    });
    res.json(userAllergens.map(ua => ua.Allergen));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add an allergen for a user
router.post('/', async (req, res) => {
  try {
    const { userId, allergenId } = req.body;
    const exists = await UserAllergens.findOne({ where: { userId, allergenId } });
    if (exists) return res.status(400).json({ error: 'Already exists' });
    const ua = await UserAllergens.create({ userId, allergenId });
    res.status(201).json(ua);
  } catch (err) {
    res.status(400).json({ error: 'Could not add allergen for user' });
  }
});

// Remove an allergen from a user
router.delete('/', async (req, res) => {
  try {
    const { userId, allergenId } = req.body;
    const deleted = await UserAllergens.destroy({ where: { userId, allergenId } });
    if (deleted) return res.json({ message: 'Deleted successfully' });
    res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
