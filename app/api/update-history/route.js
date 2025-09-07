import { NextResponse } from "next/server";
import connectDB from "../../../lib/connectdb";
import HistoryModel from "../../../models/history";
export async function PUT(req) {
  await connectDB();
  try {
    const { id } = req.json();
    const body = await req.json();

    const updated = await HistoryModel.findByIdAndUpdate(id, body, {
      new: true, // return updated document
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "History not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /history/:id error:", err);
    return NextResponse.json(
      { error: "Failed to update history" },
      { status: 500 }
    );
  }
}

// ✅ Delete history entry (if needed)
export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { id } = params;
    const deleted = await HistoryModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "History not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /history/:id error:", err);
    return NextResponse.json(
      { error: "Failed to delete history" },
      { status: 500 }
    );
  }
}
