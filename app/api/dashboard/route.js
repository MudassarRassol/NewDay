import connectDB from "../../../lib/connectdb";
import MedicineModel from "../../../models/medicine";
import HistoryModel from "../../../models/history";

export async function GET(req) {
  await connectDB();

  try {
    // ✅ Total medicines count
    const totalMedicines = await MedicineModel.countDocuments();

    // ✅ Low stock (quantity <= 10)
    const lowStock = await MedicineModel.countDocuments({
      quantity: { $lte: 10 },
    });

    // ✅ Expiring medicines (expiry today or past)
    const today = new Date();
    const expiringMedicines = await MedicineModel.countDocuments({
      expiry: { $lte: today },
    });

    // ✅ Total TP (Quantity * PurchasePrice)
    const medicines = await MedicineModel.find(
      {},
      "quantity sellingPrice purchasePrice"
    );

    const totalTP = medicines.reduce(
      (sum, med) => sum + (med.quantity || 0) * (med.purchasePrice || 0),
      0
    );

    const roundedTPP = Math.floor(totalTP); // ✅ safe rounding

    // ✅ Today sales & profit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);



    // ✅ Today sales & profit
    const todaySales = await HistoryModel.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate("items.medicineId", "purchasePrice"); // 👈 populate purchasePrice

    // ✅ Total Sales = sum of finalTotal
    const totalSales = todaySales.reduce(
      (sum, record) => sum + (record.finalTotal || 0),
      0
    );

    // ✅ Total Profit = (selling - purchase) × quantity
    const totalProfit = todaySales.reduce((sum, record) => {
      return (
        sum +
        record.items.reduce((s, i) => {
          const selling = Number(i.sellingPrice || 0);
          const purchase = Number(i.medicineId?.purchasePrice || 0);
          const qty = Number(i.quantity || 0);
          return s + (selling - purchase) * qty;
        }, 0)
      );
    }, 0);

    // ✅ Round values
    const roundedSales = Math.floor(totalSales);
    const roundedProfit = Math.floor(totalProfit);
    const roundedTP = Math.floor(totalTP);

    // ✅ Return Response
    return new Response(
      JSON.stringify({
        totalMedicines,
        lowStock,
        expiringMedicines,
        todaySales: roundedSales,
        todayProfit: roundedProfit,
        totalTP: roundedTPP, // 👈 Added TP
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
