"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../app/assests/logo.png";
import { Button } from "../components/ui/button";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login");
    const role = localStorage.getItem("role");

    if (isLoggedIn === "true") {
      if (role === "admin") {
        router.push("/pages/owner");
      } else if (role === "employee") {
        router.push("/pages/staff");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Hero Section */}
      <header className="flex flex-col items-center gap-4 mb-12 text-center">
        <Image src={logo} alt="Logo" width={80} height={80} className="dark:invert" />
        <h1 className="text-4xl sm:text-5xl font-bold text-primary">
          Welcome to New Day Pharmacy
        </h1>
        <p className="text-primary max-w-xl text-center">
          Your one-stop solution for managing medicines, sales, and inventory. 
          Fast, simple, and secure.
        </p>
      </header>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 mb-12">
        <Link href={"/pages/login"}>
          <Button>Login</Button>
        </Link>
      </div>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full text-center">
        <div className="bg-white p-6 rounded-lg shadow border border-green-100">
          <span className="text-4xl">📦</span>
          <h3 className="text-lg font-semibold mt-2">Manage Inventory</h3>
          <p className="text-primary mt-1 text-sm">Search and check all medicines easily.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-green-100">
          <span className="text-4xl">💰</span>
          <h3 className="text-lg font-semibold mt-2">Track Sales</h3>
          <p className="text-primary mt-1 text-sm">Sell medicines and update stock automatically.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-green-100">
          <span className="text-4xl">🧾</span>
          <h3 className="text-lg font-semibold mt-2">Reports</h3>
          <p className="text-primary mt-1 text-sm">Check your daily or total sales anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-primary text-sm">
        © {new Date().getFullYear()} New Day Pharmacy. All rights reserved.
      </footer>
    </div>
  );
}
