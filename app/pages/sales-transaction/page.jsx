"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SalesTransactionPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false); // ✅ loading state
  const router = useRouter();

  useEffect(() => {
    const savedItems = localStorage.getItem("cartItems");
    if (savedItems) {
      const parsed = JSON.parse(savedItems).map((item) => ({
        ...item,
        saleQuantity: item.saleQuantity || 1,
      }));
      setInventory(parsed);
    }
  }, []);

  const filteredInventory = inventory.filter((med) =>
    med.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuantityChange = (id, qty) => {
    setInventory((prev) =>
      prev.map((med) => {
        if (med._id === id) {
          const availableStock = med.quantity;
          const newQuantity = Math.min(Math.max(1, qty), availableStock);
          return { ...med, saleQuantity: newQuantity };
        }
        return med;
      })
    );
  };

  const handleDelete = (id) => {
    setInventory((prev) => prev.filter((med) => med._id !== id));
  };

  const subtotal = inventory.reduce(
    (acc, med) => acc + med.sellingPrice * med.saleQuantity,
    0
  );
  const discountAmount = Math.min(discount, subtotal);
  const discountPercent =
    subtotal > 0 ? ((discountAmount / subtotal) * 100).toFixed(2) : 0;
  const total = subtotal - discountAmount;
  const profit = total * 0.4;

  const handleCheckout = async () => {
    if (inventory.length === 0) {
      alert("No medicines in cart!");
      return;
    }

    setLoading(true); // ✅ start loading

    try {
      const payload = {
        items: inventory.map((med) => ({
          medicineId: med._id || med.id, // ✅ fallback if _id missing
          name: med.name,
          quantity: med.saleQuantity,
          sellingPrice: med.sellingPrice,
          totalAmount: med.sellingPrice * med.saleQuantity,
          profit: (med.sellingPrice - med.purchasePrice) * med.saleQuantity,
        })),
        discount: discountAmount,
        finalTotal: total,
      };
      console.log(payload)
      await axios.post("/api/history", payload);

      localStorage.removeItem("cartItems");
      setInventory([]);
      setDiscount(0);

      // alert("Checkout successful!");
      router.push("/pages/staff");
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed. Try again!");
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Sales Transaction
      </h1>

      {/* Search Box */}
      <div className="mb-4 sm:mb-6 max-w-md">
        <Input
          placeholder="Search for medicines"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicines Table */}
        <div className="lg:col-span-2 overflow-x-auto rounded-lg border bg-white shadow-sm p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((med) => (
                <TableRow key={med._id}>
                  <TableCell>{med.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={med.saleQuantity === 0 ? "" : med.saleQuantity}
                      className="w-20"
                      min="1"
                      max={med.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setInventory((prev) =>
                            prev.map((m) =>
                              m._id === med._id
                                ? { ...m, saleQuantity: 0 }
                                : m
                            )
                          );
                          return;
                        }
                        const qty = parseInt(value, 10);
                        if (!isNaN(qty)) {
                          handleQuantityChange(med._id, qty);
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!value || value < 1) {
                          handleQuantityChange(med._id, 1);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      Stock: {med.quantity}
                    </p>
                  </TableCell>
                  <TableCell>₨ {med.sellingPrice}</TableCell>
                  <TableCell>
                    ₨ {med.sellingPrice * med.saleQuantity}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(med._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Discount (₨)
            </label>
            <Input
              type="number"
              value={discount === 0 ? "" : discount}
              min={0}
              max={subtotal}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setDiscount(0);
                } else {
                  const discountValue = parseInt(value, 10);
                  if (!isNaN(discountValue)) {
                    setDiscount(Math.max(0, discountValue));
                  }
                }
              }}
              onBlur={(e) => {
                if (!e.target.value || parseInt(e.target.value, 10) < 0) {
                  setDiscount(0);
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              {discountAmount} Rs ({discountPercent}%)
            </p>
          </div>
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm">
              <p>Subtotal</p>
              <p>₨ {subtotal}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Discount</p>
              <p>₨ {discountAmount}</p>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
              <p>Total Price</p>
              <p>₨ {total}</p>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <p>Total Profit</p>
              <p>₨ {profit}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:gap-3">
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={handleCheckout}
              disabled={loading} // ✅ disable while loading
            >
              {loading ? "Processing..." : "Checkout"}
            </Button>
            <Link href="/pages/staff">
              <Button className="w-full" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
