import connectDB from "../../../lib/connectdb";
import UserModel from "../../../models/user";

export async function POST(req) {
  await connectDB();


  const { name, email,id } = await req.json();

  const user = await UserModel.findById(id);
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();
  return new Response(JSON.stringify({ message: "User updated", user }), { status: 200 });
}
