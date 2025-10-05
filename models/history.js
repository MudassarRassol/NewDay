import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    items: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true }, // ✅ new field
        name: {
          type: String,
          required: true,
          trim: true,
        },
        service:{
          type : Number,
          default : 0
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        sellingPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        profit: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    discount: {
      type: Number,
      default: 0, // in Rs
    },
    finalTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const HistoryModel =
  mongoose.models.History || mongoose.model("History", HistorySchema);

export default HistoryModel;
