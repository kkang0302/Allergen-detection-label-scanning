const express = require('express');
const router = express.Router();
const { Allergens } = require('../models');

// Lấy danh sách tất cả allergens
router.get('/', async (req, res) => {
  try {
    const allergens = await Allergens.findAll();
    res.json(allergens);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Thêm allergen mới
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const allergen = await Allergens.create({ name, description });
    res.status(201).json(allergen);
  } catch (err) {
    res.status(400).json({ error: 'Không thể tạo allergen' });
  }
});

// Xóa allergen
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Allergens.destroy({ where: { id } });
    if (deleted) return res.json({ message: 'Đã xóa' });
    res.status(404).json({ error: 'Không tìm thấy allergen' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Cập nhật allergen
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    const [updated] = await Allergens.update({ name, description }, { where: { id } });
    if (updated) return res.json({ message: 'Đã cập nhật' });
    res.status(404).json({ error: 'Không tìm thấy allergen' });
  } catch (err) {
    res.status(400).json({ error: 'Không thể cập nhật allergen' });
  }
});

module.exports = router;
