import connectDB from "../../../lib/connectdb";
import UserModel from "../../../models/user";
import bcrypt from "bcrypt";

export async function POST(req) {
  await connectDB();

  const { password , id} = await req.json();
  console.log(password,id)
  if (!password) return new Response(JSON.stringify({ error: "Password required" }), { status: 400 });

  const user = await UserModel.findById(id);
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  return new Response(JSON.stringify({ message: "Password changed successfully" }), { status: 200 });
}
