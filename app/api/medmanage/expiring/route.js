import connectDB from "../../../../lib/connectdb";
import MedicineModel from "../../../../models/medicine";

export async function GET(req) {
  await connectDB();
  try {
    // Get current date
    const currentDate = new Date();
    
    // Calculate date 30 days from now (or adjust as needed)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Find medicines expiring within the next 30 days or already expired
    const expiringMedicines = await MedicineModel.find({
      expiry: { 
        $lte: thirtyDaysFromNow,
        $gte: currentDate 
      }
    }).sort({ expiry: 1 });

    // Find already expired medicines
    const expiredMedicines = await MedicineModel.find({
      expiry: { $lt: currentDate }
    }).sort({ expiry: 1 });

    return Response.json(
      {
        success: true,
        expiring: {
          data: expiringMedicines,
          count: expiringMedicines.length,
          message: "Medicines expiring within 30 days"
        },
        expired: {
          data: expiredMedicines,
          count: expiredMedicines.length,
          message: "Already expired medicines"
        }
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error fetching expiring medicines:", err);
    return Response.json(
      { error: "Failed to fetch expiring medicines" },
      { status: 500 }
    );
  }
}

// Optional: POST to get medicines expiring within custom days
export async function POST(req) {
  await connectDB();
  try {
    const { days } = await req.json();

    if (!days || days < 0) {
      return Response.json(
        { error: "Invalid days value" },
        { status: 400 }
      );
    }

    // Get current date
    const currentDate = new Date();
    
    // Calculate date X days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    // Find medicines expiring within the specified days
    const expiringMedicines = await MedicineModel.find({
      expiry: { 
        $lte: futureDate,
        $gte: currentDate 
      }
    }).sort({ expiry: 1 });

    // Find already expired medicines
    const expiredMedicines = await MedicineModel.find({
      expiry: { $lt: currentDate }
    }).sort({ expiry: 1 });

    return Response.json(
      {
        success: true,
        days: days,
        expiring: {
          data: expiringMedicines,
          count: expiringMedicines.length,
          message: `Medicines expiring within ${days} days`
        },
        expired: {
          data: expiredMedicines,
          count: expiredMedicines.length,
          message: "Already expired medicines"
        }
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error fetching expiring medicines:", err);
    return Response.json(
      { error: "Failed to fetch expiring medicines" },
      { status: 500 }
    );
  }
}
