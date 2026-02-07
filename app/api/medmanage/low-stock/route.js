import connectDB from "../../../../lib/connectdb";
import MedicineModel from "../../../../models/medicine";

export async function GET(req) {
  await connectDB();
  try {
    // Define low stock threshold (e.g., quantity <= 10)
    const LOW_STOCK_THRESHOLD = 10;

    const lowStockMedicines = await MedicineModel.find({
      quantity: { $lte: LOW_STOCK_THRESHOLD }
    }).sort({ quantity: 1 });

    return Response.json(
      {
        success: true,
        data: lowStockMedicines,
        count: lowStockMedicines.length,
        threshold: LOW_STOCK_THRESHOLD
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error fetching low stock medicines:", err);
    return Response.json(
      { error: "Failed to fetch low stock medicines" },
      { status: 500 }
    );
  }
}

// Optional: POST to set custom threshold
export async function POST(req) {
  await connectDB();
  try {
    const { threshold } = await req.json();

    if (!threshold || threshold < 0) {
      return Response.json(
        { error: "Invalid threshold value" },
        { status: 400 }
      );
    }

    const lowStockMedicines = await MedicineModel.find({
      quantity: { $lte: threshold }
    }).sort({ quantity: 1 });

    return Response.json(
      {
        success: true,
        data: lowStockMedicines,
        count: lowStockMedicines.length,
        threshold: threshold
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error fetching low stock medicines:", err);
    return Response.json(
      { error: "Failed to fetch low stock medicines" },
      { status: 500 }
    );
  }
}
