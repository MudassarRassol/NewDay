import connectDB from "../../../lib/connectdb";
import UserModel from "../../../models/user";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function POST(req) {
  await connectDB();

  const { email, password,role } = await req.json();
  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
  }
  
  console.log(email,password)

  const user = await UserModel.findOne({ email });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  if(user.role !== role){
    return new Response(JSON.stringify({ error: "User not found , Signup with correct role" }), { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return new Response(JSON.stringify({ error: "Password incorrect" }), { status: 401 });
  }

  // ✅ Create JWT with jose
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  // ✅ Save JWT in HttpOnly cookie
  // await(cookies()).set("authToken", token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   path: "/",
  //   maxAge: 60 * 60 * 24, // 1 day
  // });

  const cookieStore = await cookies();

cookieStore.set("authToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24, // 1 day
});


  return new Response(JSON.stringify({ message: "Login successful" , role : user.role , status : user.status }), { status: 200 });
}
