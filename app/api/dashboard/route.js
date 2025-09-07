import connectDB from "../../../lib/connectdb";
import MedicineModel from "../../../models/medicine";
import HistoryModel from "../../../models/history";

export async function GET(req) {
  await connectDB();

  try {
    // Total medicines
    const totalMedicines = await MedicineModel.countDocuments();

    // Low stock (example: quantity <= 10)
    const lowStock = await MedicineModel.countDocuments({ quantity: { $lte: 10 } });

    // Expiring medicines (expiry today or past)
    const today = new Date();
    const expiringMedicines = await MedicineModel.countDocuments({
      expiry: { $lte: today },
    });

    // Today sales & profit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySales = await HistoryModel.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const totalSales = todaySales.reduce((sum, record) => sum + record.finalTotal, 0);
    const totalProfit = todaySales.reduce(
      (sum, record) => sum + record.items.reduce((s, i) => s + i.profit, 0),
      0
    );

    
    // ✅ Return Response
    return new Response(
      JSON.stringify({
        totalMedicines,
        lowStock,
        expiringMedicines,
        todaySales: totalSales,
        todayProfit: totalProfit,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
