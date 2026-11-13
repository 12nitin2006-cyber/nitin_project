const Claim = require('../models/Claim');
const Item = require('../models/Item');

// POST /api/claims  { itemId, proofMessage }  (protected)
const createClaim = async (req, res) => {
  const { itemId, proofMessage } = req.body;

  if (!itemId || !proofMessage) {
    return res.status(400).json({ message: 'Item and proof message are required' });
  }

  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  if (item.postedBy.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot claim your own post' });
  }
  if (item.status === 'claimed') {
    return res.status(400).json({ message: 'This item has already been claimed' });
  }

  const alreadyClaimed = await Claim.findOne({ item: itemId, claimedBy: req.user._id });
  if (alreadyClaimed) {
    return res.status(400).json({ message: 'You have already claimed this item' });
  }

  try {
    const claim = await Claim.create({ item: itemId, claimedBy: req.user._id, proofMessage });
    res.status(201).json(claim);
  } catch (error) {
    // 11000 = duplicate key from the unique { item, claimedBy } index (e.g. double click)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already claimed this item' });
    }
    throw error;
  }
};

// GET /api/claims/mine  (protected)
const getMyClaims = async (req, res) => {
  const claims = await Claim.find({ claimedBy: req.user._id })
    .populate('item', 'title type status imageUrl')
    .sort({ createdAt: -1 });
  res.json(claims);
};

// GET /api/claims?status=pending  (admin)
const getAllClaims = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const claims = await Claim.find(filter)
    .populate('item', 'title type status')
    .populate('claimedBy', 'name email')
    .sort({ createdAt: -1 });
  res.json(claims);
};

// PATCH /api/claims/:id  { status: 'approved' | 'rejected' }  (admin)
const updateClaimStatus = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ message: 'Claim not found' });
  if (claim.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending claims can be updated' });
  }

  if (status === 'approved') {
    const item = await Item.findById(claim.item);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // 1. mark the item as claimed
    item.status = 'claimed';
    await item.save();

    // 2. reject every other pending claim for the same item
    await Claim.updateMany(
      { item: claim.item, _id: { $ne: claim._id }, status: 'pending' },
      { status: 'rejected' }
    );
  }

  // 3. save this claim's new status
  claim.status = status;
  await claim.save();

  res.json(claim);
};

// GET /api/admin/stats  (admin)
const getStats = async (req, res) => {
  // Run all the counts at the same time
  const [totalItems, lost, found, claimed, pendingClaims] = await Promise.all([
    Item.countDocuments(),
    Item.countDocuments({ type: 'lost' }),
    Item.countDocuments({ type: 'found' }),
    Item.countDocuments({ status: 'claimed' }),
    Claim.countDocuments({ status: 'pending' }),
  ]);

  res.json({ totalItems, lost, found, claimed, pendingClaims });
};

module.exports = { createClaim, getMyClaims, getAllClaims, updateClaimStatus, getStats };
