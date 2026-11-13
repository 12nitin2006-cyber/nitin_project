const express = require('express');
const {
  getItems,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getItems);
// "/mine" must come BEFORE "/:id", otherwise Express would treat "mine" as an id
router.get('/mine', protect, getMyItems);
router.get('/:id', getItemById);

// upload.single('image') reads one file from the form field called "image"
router.post('/', protect, upload.single('image'), createItem);
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
