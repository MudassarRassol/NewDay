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
import { Loader2 } from "lucide-react"; // spinner icon

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div className="p-2 space-y-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
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
      )}

      {/* Weekly Sales Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Weekly Sales</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex justify-center items-center">
          {loadingChart ? (
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
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
    </div>
  );
}
