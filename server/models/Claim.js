const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    proofMessage: {
      type: String,
      required: [true, 'Proof message is required'],
      maxlength: [500, 'Proof message can be at most 500 characters'],
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

// One user can claim the same item only once
claimSchema.index({ item: 1, claimedBy: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);
