import connectDB from "../../../lib/connectdb";
import MedicineModel from "../../../models/medicine"; 
export async function GET() {
  await connectDB();
  try {
    const medicines = await MedicineModel.find();
    return Response.json(medicines, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Failed to fetch medicines" }, { status: 500 });
  }
}

// ✅ POST - Add new medicine
export async function POST(req) {
  await connectDB();
  try {


    const { name, generic,category, expiry, quantity, purchasePrice, sellingPrice } = await req.json();


    const medicine = await MedicineModel.create({
      name,
      generic,
      expiry,
      quantity,
      category,
      purchasePrice,
      sellingPrice,
    });

    return Response.json(medicine, { status: 200 });
  } catch (err) {
    console.error("❌ Error adding medicine:", err);
    return Response.json({ error: "Failed to add medicine" }, { status: 400 });
  }
}

// ✅ PUT - Update medicine
export async function PUT(req) {
  await connectDB();
  try {

    const { id, name, generic,category, expiry, quantity, purchasePrice, sellingPrice } = await req.json();

    const medicine = await MedicineModel.findByIdAndUpdate(
      id,
      { name, generic, expiry, quantity, purchasePrice,category, sellingPrice },
      { new: true }
    );

    if (!medicine) {
      return Response.json({ error: "Medicine not found" }, { status: 404 });
    }

    return Response.json(medicine, { status: 200 });
  } catch (err) {
    console.error("Update error:", err);
    return Response.json({ error: "Failed to update medicine" }, { status: 400 });
  }
}


// ✅ DELETE - Delete medicine
export async function DELETE(req) {
  await connectDB();
  try {
    const { id } = await req.json();
    const medicine = await MedicineModel.findByIdAndDelete(id);
    if (!medicine) {
      return Response.json({ error: "Medicine not found" }, { status: 404 });
    }
    return Response.json({ message: "Medicine deleted" }, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Failed to delete medicine" }, { status: 400 });
  }
}
