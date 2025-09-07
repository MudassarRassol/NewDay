import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
