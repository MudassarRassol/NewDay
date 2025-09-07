// app/api/profit-week/route.js
import connectDB from "../../../lib/connectdb";
import HistoryModel from "../../../models/history";

export async function GET(req) {
  await connectDB();

  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const weekSales = await HistoryModel.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const dailyProfit = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    weekSales.forEach((record) => {
      const day = record.createdAt.getDay(); // 0-Sunday, 1-Monday...
      const profit = record.items.reduce((sum, i) => sum + i.profit, 0);

      switch (day) {
        case 0:
          dailyProfit.Sunday += profit;
          break;
        case 1:
          dailyProfit.Monday += profit;
          break;
        case 2:
          dailyProfit.Tuesday += profit;
          break;
        case 3:
          dailyProfit.Wednesday += profit;
          break;
        case 4:
          dailyProfit.Thursday += profit;
          break;
        case 5:
          dailyProfit.Friday += profit;
          break;
        case 6:
          dailyProfit.Saturday += profit;
          break;
      }
    });

    // ✅ Return as Response
    return new Response(JSON.stringify(dailyProfit), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
