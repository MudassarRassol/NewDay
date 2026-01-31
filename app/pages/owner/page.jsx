"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // spinner & visibility icons

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);

  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!authorized) return;

    const fetchDashboard = async () => {
      setLoadingStats(true);
      try {
        const res = await axios.get("/api/dashboard");
        const data = res.data;

        setStats([
          { label: "Total Medicines", value: data.totalMedicines, color: "text-gray-900" },
          { label: "Low Stock Alerts", value: data.lowStock, color: "text-orange-500" },
          { label: "Expiring Medicines", value: data.expiringMedicines, color: "text-red-500" },
          { label: "Today's Sales", value: `₨${data.todaySales}`, color: "text-gray-900" },
          { label: "Total Profit", value: `₨${data.todayProfit}`, color: "text-green-600" },
          { label: "Total TP", value: `₨${data.totalTP}`, color: "text-blue-600" },
        ]);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchWeeklyProfit = async () => {
      setLoadingChart(true);
      try {
        const res = await axios.get("/api/profit-week");
        const data = res.data;

        const chartData = Object.keys(data).map((day) => ({
          day,
          sales: data[day],
        }));

        setSalesData(chartData);
      } catch (err) {
        console.error("Failed to fetch weekly profit", err);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchDashboard();
    fetchWeeklyProfit();
  }, [authorized]);

  const handleUnlock = () => {
    if (password === "9212zz") {
      setAuthorized(true);
      setDashboardOpen(true);
      setPassword("");
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  return (
    <div className="p-2 space-y-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Owner password lock */}
      <div className="max-w-md">
        {!authorized ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Enter the owner password to view the dashboard</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPasswordInput ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock(); }}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Owner password"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPasswordInput((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                >
                  {showPasswordInput ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                onClick={handleUnlock}
                className="rounded-md bg-blue-600 text-white px-3 py-2 hover:bg-blue-700"
              >
                Open
              </button>
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600">Dashboard unlocked</p>
            <button
              onClick={() => setDashboardOpen((s) => !s)}
              className="rounded-md bg-gray-200 px-3 py-2"
            >
              {dashboardOpen ? 'Close Dashboard' : 'Open Dashboard'}
            </button>
            <button
              onClick={() => { setAuthorized(false); setDashboardOpen(false); setPassword(''); }}
              className="rounded-md bg-red-500 text-white px-3 py-2"
            >
              Lock
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {authorized && dashboardOpen && (
        loadingStats ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )} 

      {/* Weekly Sales Graph */}
      {authorized && dashboardOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Weekly Sales</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex justify-center items-center">
            {loadingChart ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#2563eb" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
