"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../component/SideBar";

export default function OwnerLayout({ children }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null); // null = loading

  useEffect(() => {
    const role = localStorage.getItem("role");

    if ( role !== "admin") {
      // Not logged in as admin
      router.push("/pages/login"); // replace with your admin login route
    } else {
      setIsAdmin(true);
    }
  }, []);

  if (isAdmin === null) {
    // Loading or redirecting
    return <div className="flex items-center justify-center min-h-screen">Checking access...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fixed */}
      <Sidebar />
      {/* Main content */}
      <main className="flex-1 p-2 mt-16 md:mt-0 h-screen overflow-hidden overflow-y-scroll ">{children}</main>
    </div>
  );
}
