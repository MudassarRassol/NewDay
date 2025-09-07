"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useRouter } from "next/navigation";
import StaffHeader from "../../../component/StaffHeader";
import { Loader2 } from "lucide-react";
import axios from "axios";

export default function StaffPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  // Get user status from localStorage
  useEffect(() => {
    const savedStatus = localStorage.getItem("status");
    setStatus(savedStatus);
  }, []);

  // Fetch inventory only if active
  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/medicines");
      setInventory(res.data);
    } catch (err) {
      console.error("Failed to fetch medicines", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "active") fetchMedicines();
  }, [status]);

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.generic.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedMedicines((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCheckout = () => {
    if (selectedMedicines.length === 0) {
      alert("No medicines selected!");
      return;
    }

    const soldItems = inventory.filter((item) =>
      selectedMedicines.includes(item._id)
    );

    localStorage.setItem("cartItems", JSON.stringify(soldItems));
    router.push("/pages/sales-transaction");
  };

  const highlightText = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // ✅ Show inactive message if status is inactive
  if (status === "inactive") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Your Account is NOT ACTIVE
        </h1>
        <p className="text-gray-700">
          Please contact admin to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div>
      <StaffHeader />
      <div className="p-8 relative">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary">Sell Medicines</h1>
          <Input
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>

        <div className="rounded-md border p-2 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-red-950">No</TableHead>
                <TableHead className="text-blue-600">Medicine Name</TableHead>
                <TableHead className="text-primary">(Generic)</TableHead>
                <TableHead className="text-green-500">Quantity</TableHead>
                <TableHead className="">Tp</TableHead>
                <TableHead className="text-primary">MRP</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-primary">Select</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="border">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    <Loader2 className="animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No medicines found!
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item, index) => (
                  <TableRow
                    key={item._id}
                    className={
                      item.quantity === 0
                        ? "bg-gray-100 opacity-50 pointer-events-none"
                        : ""
                    }
                  >
                    <TableCell className="border w-1 text-red-950">
                      {index + 1}
                    </TableCell>
                    <TableCell className="border text-blue-600">
                      {highlightText(item.name, search)}
                    </TableCell>
                    <TableCell className="border text-primary">
                      {highlightText(item.generic, search)}
                    </TableCell>
                    <TableCell className="border text-green-500">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="border ">₨ {item.purchasePrice}</TableCell>
                    <TableCell className="border text-primary">₨ {item.sellingPrice}</TableCell>
                    <TableCell
                      className={`border ${
                        new Date(item.expiry) < new Date()
                          ? "text-red-500 font-semibold"
                          : ""
                      }`}
                    >
                      {new Date(item.expiry).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center w-1 border">
                      <Checkbox
                        disabled={item.quantity === 0}
                        className="ml-3"
                        checked={selectedMedicines.includes(item._id)}
                        onCheckedChange={() => toggleSelect(item._id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="fixed bottom-4 right-4">
          <Button className="px-10 py-7" onClick={handleCheckout}>
            Cart ({selectedMedicines.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
