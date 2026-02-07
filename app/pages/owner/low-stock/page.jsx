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
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";

export default function LowStockPage() {
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [threshold, setThreshold] = useState(10);
  const [thresholdInput, setThresholdInput] = useState("10");

  useEffect(() => {
    fetchLowStock();
  }, [threshold]);

  const fetchLowStock = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/medmanage/low-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold }),
      });
      const data = await res.json();

      if (data.success) {
        setMedicines(data.data);
        setFilteredMedicines(data.data);
      } else {
        setError("Failed to fetch low stock medicines");
      }
    } catch (err) {
      console.error("Error fetching low stock medicines:", err);
      setError("Error fetching low stock medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMedicines(medicines);
    } else {
      const filtered = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(query.toLowerCase()) ||
        medicine.generic.toLowerCase().includes(query.toLowerCase()) ||
        medicine.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
  };

  const handleThresholdChange = () => {
    const newThreshold = parseInt(thresholdInput) || 10;
    if (newThreshold < 0) {
      setThresholdInput("0");
      setThreshold(0);
    } else {
      setThreshold(newThreshold);
    }
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
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h1 className="text-3xl font-bold">Low Stock Medicines Alert</h1>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold text-orange-600">{filteredMedicines.length}</p>
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

        {/* Threshold Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stock Threshold</label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              placeholder="Enter threshold"
              className="flex-1"
            />
            <Button
              onClick={handleThresholdChange}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Set
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Current threshold: {threshold}
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
      ) : filteredMedicines.length === 0 ? (
        <div className="rounded-lg bg-green-50 p-6 text-center text-green-600">
          {searchQuery
            ? "No medicines found matching your search"
            : "✓ All medicines have sufficient stock!"}
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Medicine Name</TableHead>
                <TableHead>Generic</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Purchase Price</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead>RAG Status</TableHead>
                <TableHead className="text-right">Stock Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((medicine) => (
                <TableRow key={medicine._id} className="hover:bg-orange-50">
                  <TableCell className="font-medium text-gray-900">
                    {medicine.name}
                  </TableCell>
                  <TableCell className="text-gray-700">{medicine.generic}</TableCell>
                  <TableCell className="text-gray-700">{medicine.category}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-800 px-3 py-1 font-bold text-sm">
                      {medicine.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-gray-700">
                    ₨{medicine.purchasePrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-gray-700">
                    ₨{medicine.sellingPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      medicine.rag === "Green"
                        ? "bg-green-100 text-green-800"
                        : medicine.rag === "Amber"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {medicine.rag}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₨{(medicine.quantity * medicine.sellingPrice).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
