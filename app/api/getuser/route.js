import connectdb from "../../../lib/connectdb"; 
import User from "../../../models/user";  

export async function GET(req) {
  try {
    await connectdb();

   
    const users = await User.find().select("-password");

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (err) {
    console.error("Get All Users Error:", err.message);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
