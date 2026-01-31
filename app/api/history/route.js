  import { NextResponse } from "next/server";
  import connectDB from "../../../lib/connectdb";
  import HistoryModel from "../../../models/history";
  import MedicineModel from "../../../models/medicine"; // ✅ import medicine model

  // ✅ Create a new history (checkout)
export async function POST(req) {
  await connectDB();

  try {
    console.log('run')
    const body = await req.json();
    const { items, discount = 0, finalTotal ,serviceprice } = body;
    console.log(serviceprice , body)
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Total amount of all items
    const totalItemsAmount = items.reduce(
      (sum, i) => sum + (i.sellingPrice || 0) * (i.quantity || 0),
      0
    );

    // Map items and include medicineId
    const itemsWithProfit = items.map((item) => {
      const qty = item.quantity || 0;
      const sp = item.sellingPrice || 0;
      const pp = item.purchasePrice || 0;

      // proportional discount
      const itemDiscount =
        totalItemsAmount > 0 ? (sp * qty / totalItemsAmount) * discount : 0;

      const totalAmount = sp * qty - itemDiscount;
      const profit = totalAmount - pp * qty;

      return {
        medicineId: item.medicineId, // ✅ map medicineId correctly
        name: item.name,
        quantity: qty,
        sellingPrice: sp,
        totalAmount,
        profit: profit < 0 ? 0 : profit,
        // do not assign total service to each item here
      };
    });

    // Save history (store total service at the record level)
    const history = await HistoryModel.create({
      items: itemsWithProfit,
      discount,
      service: serviceprice || 0,
      finalTotal,
    });

    // Decrease medicine stock
    for (const item of itemsWithProfit) {
      await MedicineModel.findByIdAndUpdate(
        item.medicineId,
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
    }

    return NextResponse.json(history, { status: 201 });
  } catch (err) {
    console.error("POST /history error:", err);
    return NextResponse.json(
      { error: "Failed to create history entry" },
      { status: 500 }
    );
  }
}



  // ✅ Get all history entries
  export async function GET() {
    await connectDB();
    try {
      const history = await HistoryModel.find()
      .populate("items.medicineId", "purchasePrice sellingPrice") // 👈 sirf ye fields laa lo
      .sort({ createdAt: -1 });
      return NextResponse.json(history, { status: 200 });
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 }
      );
    }
  }


export async function DELETE(req) {
  await connectDB();
  try {
    const { ids } = await req.json();  // multiple IDs expect karega

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs are required" }, { status: 400 });
    }

    const deleted = await HistoryModel.deleteMany({ _id: { $in: ids } });

    if (deleted.deletedCount === 0) {
      return NextResponse.json({ error: "No history found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Deleted successfully", count: deleted.deletedCount },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete history" },
      { status: 500 }
    );
  }
}
