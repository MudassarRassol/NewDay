// app/signup/page.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import Image from "next/image";
import logo from "../../../assests/logo.png";
export default function SignupPage() {
  const [role, setRole] = useState("pharmacist");

  return (
    <div className="flex h-screen w-full items-center justify-center ">
      <Card className="w-full max-w-md shadow-2xl">
        {/* Header */}
        <CardHeader className="text-center">
          <div className="mx-auto flex  w-12 items-center justify-center rounded-full ">
            <Image
              src={logo}
              alt="Logo"
              width={60}
              height={60}
              className="dark:invert"
            />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold ">
            Create your  <br/> New Day Account
          </CardTitle>
        </CardHeader>

        {/* Form */}
        <CardContent>
          <form className="space-y-6">
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
                />
              </div>
            </div>


            {/* Submit */}
            <Button className="w-full ">
              Register
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <a
              href="/pages/login"
              className="font-semibold "
            >
              Login here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
