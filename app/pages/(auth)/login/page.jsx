"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import logo from "../../../assests/logo.png";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/login", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      console.log(res.data.role)

      if (res.status == 200 && res.data.role == "admin") {
        localStorage.setItem("login","true")
        localStorage.setItem("role",res.data.role)
        localStorage.setItem("status",res.data.status)
        router.push("/pages/owner");
      }

      if (res.status == 200 && res.data.role == "employee") {
         localStorage.setItem("login","true")
          localStorage.setItem("role",res.data.role)
        localStorage.setItem("status",res.data.status)
        router.push("/pages/staff");
      }

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen  w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 ">
            <Image
              src={logo}
              alt="Logo"
              width={60}
              height={60}
              className="dark:invert"
            />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold tracking-tight">
            New Day
          </CardTitle>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            Access your inventory dashboard
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="w-full">
              <Label htmlFor="role" className="mb-2">
                Login as
              </Label>
              <Select onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="admin">admin</SelectItem>
                  <SelectItem value="employee">employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit */}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Not a member?{" "}
            <Link href="/pages/signup" className="font-semibold ">
              Create Account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
