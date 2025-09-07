"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  HistoryIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import Image from "next/image";
import logo from "../app/assests/logo.png";
const menuItems = [
  { name: "Dashboard", href: "/pages/owner", icon: LayoutDashboard },
  { name: "Inventory", href: "/pages/owner/inventory", icon: Package },
  { name: "Sell History", href: "/pages/owner/orders", icon: HistoryIcon },
  { name: "Users", href: "/pages/owner/users", icon: Users },
];
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 w-full z-50 flex items-center  justify-between bg-white border-b p-3 shadow-sm">
        <div className="flex items-center gap-3" >
          <Image
            src={logo}
            alt="Logo"
            width={40}
            height={40}
            className="dark:invert"
          />
          <span className=" text-2xl font-extrabold">New Day</span>
        </div>
        <button onClick={() => setIsOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white z-50 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex md:w-64
          flex flex-col border-r border-gray-200
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <div className="flex items-center gap-2">
            <span className=" text-2xl"></span>
            <h1 className="text-lg font-bold text-gray-800">New Day</h1>
          </div>
          <button onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo for desktop */}
        <div className="hidden md:flex items-center gap-4 px-4 py-4 border-b">
          <Image
          src={logo}
          alt="Logo"
          width={40}
          height={40}
          className="dark:invert"
          />
          <h1 className="text-lg font-bold text-gray-800">New Day</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1  px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  active
                    ? " bg-primary text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsOpen(false)} // Close sidebar on mobile
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Owner Info */}
        <div className="border-t p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Owner</p>
          </div>
          <Button variant={"ghost"} onClick={handleLogout} >
            <LogOut className="h-5 w-5 text-red-600" />
          </Button>
        </div>
      </aside>
    </>
  );
}
