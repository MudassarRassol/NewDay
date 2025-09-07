"use client";

import { LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import logo from "../app/assests/logo.png";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function StaffHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // ✅ Call API to clear cookie
      await axios.post("/api/logout");

      // ✅ Clear localStorage
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      // ✅ Redirect to login
      router.push("/pages/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="w-full bg-white shadow-md flex items-center justify-between px-6 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          src={logo}
          alt="Logo"
          width={40}
          height={40}
          className="dark:invert"
        />
        <h1 className="text-xl font-bold text-gray-800">New Day Pharmacy</h1>
      </div>

      {/* Staff Info + Logout */}
      <div className="flex items-center gap-4">
        <p className="text-gray-700 font-medium"></p>
        <Button variant="ghost" className="p-2" onClick={handleLogout}>
          <LogOut className="h-5 w-5 text-red-600" />
        </Button>
      </div>
    </header>
  );
}
