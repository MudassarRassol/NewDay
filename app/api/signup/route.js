import connectDB from "../../../lib/connectdb";
import UserModel from "../../../models/user";
import bcrypt from "bcrypt";

export async function POST(req) {
  await connectDB();

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({
    name,
    email,
    role: role || "employee",
    password: hashedPassword,
  });

  await newUser.save();
  return new Response(JSON.stringify({ message: "User created", user: newUser }), {
    status: 201,
  });
}
