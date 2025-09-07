import connectDB from "../../../lib/connectdb";
import UserModel from "../../../models/user";


export async function POST(req) {
  await connectDB();

  const { id } = await req.json();
  const user = await UserModel.findById(id);
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  user.status = user.status === "active" ? "inactive" : "active";
  await user.save();

  return new Response(JSON.stringify({ message: "Status toggled", status: user.status }), { status: 200 });
}
