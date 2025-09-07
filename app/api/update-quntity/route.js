import { NextResponse } from "next/server";
import connectDB from "../../../lib/connectdb";
import HistoryModel from "../../../models/history";
import MedicineModel from "../../../models/medicine";

export async function PUT(req) {
  await connectDB();

  try {
    const { historyId, itemId, newQuantity } = await req.json();

    if (!historyId || !itemId || newQuantity === undefined) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // 1️⃣ Get the history record
    const history = await HistoryModel.findById(historyId);
    if (!history) {
      return NextResponse.json(
        { error: "History record not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Find the item to update
    const itemIndex = history.items.findIndex(
      (i) => i._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item not found in history" },
        { status: 404 }
      );
    }

    const item = history.items[itemIndex];
    const quantityDiff = newQuantity - item.quantity;

    // 3️⃣ Update item quantity and totalAmount
    history.items[itemIndex].quantity = newQuantity;
    history.items[itemIndex].totalAmount = newQuantity * item.sellingPrice;

    // 4️⃣ Recalculate final total
    const newFinalTotal = history.items.reduce(
      (sum, i) => sum + i.totalAmount,
      0
    );
    history.finalTotal = newFinalTotal;

    await history.save();

    if (!item.medicineId) {
      return NextResponse.json(
        { error: "Medicine ID missing in history item" },
        { status: 400 }
      );
    }

    await MedicineModel.findByIdAndUpdate(item.medicineId, {
      $inc: { quantity: -quantityDiff },
    });

    return NextResponse.json({ history }, { status: 200 });
  } catch (err) {
    console.error("Update history & medicine error:", err);
    return NextResponse.json(
      { error: "Failed to update history and medicine" },
      { status: 500 }
    );
  }
}
