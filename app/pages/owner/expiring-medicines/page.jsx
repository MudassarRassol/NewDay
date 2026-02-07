"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

export default function ExpiringMedicinePage() {
  const router = useRouter();
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [expiredMedicines, setExpiredMedicines] = useState([]);
  const [filteredExpiring, setFilteredExpiring] = useState([]);
  const [filteredExpired, setFilteredExpired] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [days, setDays] = useState(30);
  const [daysInput, setDaysInput] = useState("30");

  useEffect(() => {
    fetchExpiringMedicines();
  }, [days]);

  const fetchExpiringMedicines = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/medmanage/expiring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      const data = await res.json();

      if (data.success) {
        setExpiringMedicines(data.expiring.data);
        setExpiredMedicines(data.expired.data);
        setFilteredExpiring(data.expiring.data);
        setFilteredExpired(data.expired.data);
      } else {
        setError("Failed to fetch expiring medicines");
      }
    } catch (err) {
      console.error("Error fetching expiring medicines:", err);
      setError("Error fetching expiring medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredExpiring(expiringMedicines);
      setFilteredExpired(expiredMedicines);
    } else {
      const filtered = expiringMedicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(query.toLowerCase()) ||
        medicine.generic.toLowerCase().includes(query.toLowerCase()) ||
        medicine.category.toLowerCase().includes(query.toLowerCase())
      );
      const filteredExp = expiredMedicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(query.toLowerCase()) ||
        medicine.generic.toLowerCase().includes(query.toLowerCase()) ||
        medicine.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredExpiring(filtered);
      setFilteredExpired(filteredExp);
    }
  };

  const handleDaysChange = () => {
    const newDays = parseInt(daysInput) || 30;
    if (newDays < 0) {
      setDaysInput("0");
      setDays(0);
    } else {
      setDays(newDays);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diff = expiry - today;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-md bg-gray-200 p-2 hover:bg-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h1 className="text-3xl font-bold">Expiring Medicines Alert</h1>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold text-red-600">
            {filteredExpiring.length + filteredExpired.length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Search Medicine</label>
          <Input
            type="text"
            placeholder="Search by name, generic, or category..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Days Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Days Until Expiry</label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              value={daysInput}
              onChange={(e) => setDaysInput(e.target.value)}
              placeholder="Enter days"
              className="flex-1"
            />
            <Button
              onClick={handleDaysChange}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Set
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Showing medicines expiring within {days} days
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Expiring Soon Section */}
          <div>
            <h2 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                {filteredExpiring.length}
              </span>
              Expiring Within {days} Days
            </h2>
            {filteredExpiring.length === 0 ? (
              <div className="rounded-lg bg-green-50 p-6 text-center text-green-600">
                {searchQuery
                  ? "No expiring medicines found matching your search"
                  : "✓ No medicines expiring soon"}
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-50">
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Generic</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Days Left</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead className="text-right">Stock Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpiring.map((medicine) => {
                      const daysLeft = getDaysUntilExpiry(medicine.expiry);
                      return (
                        <TableRow key={medicine._id} className="hover:bg-orange-50">
                          <TableCell className="font-medium text-gray-900">
                            {medicine.name}
                          </TableCell>
                          <TableCell className="text-gray-700">{medicine.generic}</TableCell>
                          <TableCell className="text-gray-700">{medicine.category}</TableCell>
                          <TableCell className="text-right">{medicine.quantity}</TableCell>
                          <TableCell className="text-orange-600 font-semibold">
                            {formatDate(medicine.expiry)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex items-center justify-center rounded px-2 py-1 font-bold text-sm ${
                              daysLeft <= 7
                                ? "bg-red-100 text-red-700"
                                : daysLeft <= 14
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {daysLeft} days
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-700">
                            ₨{medicine.sellingPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₨{(medicine.quantity * medicine.sellingPrice).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Already Expired Section */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                {filteredExpired.length}
              </span>
              Already Expired
            </h2>
            {filteredExpired.length === 0 ? (
              <div className="rounded-lg bg-green-50 p-6 text-center text-green-600">
                {searchQuery
                  ? "No expired medicines found matching your search"
                  : "✓ No expired medicines"}
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-red-50">
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Generic</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Days Since Expiry</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead className="text-right">Stock Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpired.map((medicine) => {
                      const daysExpired = Math.abs(getDaysUntilExpiry(medicine.expiry));
                      return (
                        <TableRow key={medicine._id} className="hover:bg-red-50">
                          <TableCell className="font-medium text-gray-900">
                            {medicine.name}
                          </TableCell>
                          <TableCell className="text-gray-700">{medicine.generic}</TableCell>
                          <TableCell className="text-gray-700">{medicine.category}</TableCell>
                          <TableCell className="text-right">{medicine.quantity}</TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            {formatDate(medicine.expiry)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center justify-center rounded px-2 py-1 font-bold text-sm bg-red-100 text-red-700">
                              {daysExpired} days ago
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-700">
                            ₨{medicine.sellingPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₨{(medicine.quantity * medicine.sellingPrice).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
