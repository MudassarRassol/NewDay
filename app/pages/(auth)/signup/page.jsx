"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import logo from "../../../assests/logo.png";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/signup", formData); // your POST route
      if (res.status === 201) {
        router.push("/pages/login"); // redirect after success
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex w-12 items-center justify-center rounded-full">
            <Image src={logo} alt="Logo" width={60} height={60} className="dark:invert" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">
            Create your <br /> New Day Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  👤
                </span>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="pl-9"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ✉️
                </span>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="pl-9"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-9"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/pages/login" className="font-semibold">
              Login here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
