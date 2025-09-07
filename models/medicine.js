import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    generic: { type: String, required: true },
    expiry: { type: Date, required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true }
}, { timestamps: true });

const MedicineModel = mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);

export default MedicineModel;
