"use client";

import { useState, useEffect, useRef } from "react";
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function SalesTransactionPage() {
  const [inventory, setInventory] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const router = useRouter();
  const qtyRefs = useRef({});

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

  // 🔑 Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlePrint();
      }
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        handleCancel();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : inventory.length - 1
        );
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < inventory.length - 1 ? prev + 1 : 0
        );
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const currentMed = inventory[highlightedIndex];
        if (currentMed && qtyRefs.current[currentMed._id]) {
          qtyRefs.current[currentMed._id].focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inventory, highlightedIndex]);

  // 🔑 Close transcript on Enter
useEffect(() => {
  if (!showTranscript) return;

  const handleEnterClose = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      router.push("/pages/staff");
      setShowTranscript(false); // close modal -> redirect handled automatically

    }
  };

  window.addEventListener("keydown", handleEnterClose);
  return () => window.removeEventListener("keydown", handleEnterClose);
}, [showTranscript]);


  const handleQuantityChange = (id, qty) => {
    setInventory((prev) =>
      prev.map((med) =>
        med._id === id
          ? {
              ...med,
              saleQuantity: Math.min(Math.max(1, qty), med.quantity),
            }
          : med
      )
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

  const handlePrint = async () => {
    if (inventory.length === 0) {
      alert("No medicines in cart!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: inventory.map((med) => ({
          medicineId: med._id || med.id,
          name: med.name,
          quantity: med.saleQuantity,
          sellingPrice: med.sellingPrice,
          totalAmount: med.sellingPrice * med.saleQuantity,
          profit: (med.sellingPrice - med.purchasePrice) * med.saleQuantity,
        })),
        discount: discountAmount,
        finalTotal: total,
      };
      await axios.post("/api/history", payload);
      setShowTranscript(true);
    } catch (err) {
      console.error("Print failed:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("cartItems");
    router.push("/pages/staff");
  };

  return (
    <div className="p-6 sm:p-10 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-700">
          💊 Sales Transaction
        </h1>
        <nav>
          <Link href="/pages/staff">
            <Button
              variant="outline"
              className="hover:bg-blue-100 hover:text-blue-600"
            >
              Open Medicines
            </Button>
          </Link>
        </nav>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicines Table */}
        <div className="lg:col-span-2 overflow-x-auto rounded-xl border bg-white shadow-lg">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((med, index) => (
                <TableRow
                  key={med._id}
                  className={`transition-colors duration-200 ${
                    index === highlightedIndex
                      ? "bg-blue-100 font-semibold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{med.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={med.saleQuantity === 0 ? "" : med.saleQuantity}
                      className="w-20 text-center"
                      min="1"
                      max={med.quantity}
                      ref={(el) => (qtyRefs.current[med._id] = el)}
                      onChange={(e) =>
                        handleQuantityChange(med._id, parseInt(e.target.value))
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Stock: {med.quantity}
                    </p>
                  </TableCell>
                  <TableCell>₨ {med.sellingPrice}</TableCell>
                  <TableCell>₨ {med.sellingPrice * med.saleQuantity}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
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

        {/* Checkout Card */}
        <div className="rounded-xl border bg-white shadow-lg p-6 backdrop-blur">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Checkout Summary
          </h2>

          <label className="block text-sm font-medium text-gray-600 mb-1">
            Discount (₨)
          </label>
          <Input
            type="number"
            value={discount === 0 ? "" : discount}
            min={0}
            max={subtotal}
            onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
            className="mb-3"
          />
          <p className="text-xs text-gray-500 mb-4">
            {discountAmount} Rs ({discountPercent}%)
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p>₨ {subtotal}</p>
            </div>
            <div className="flex justify-between">
              <p>Discount</p>
              <p>₨ {discountAmount}</p>
            </div>
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <p>Total Price</p>
              <p>₨ {total}</p>
            </div>
            <div className="flex justify-between text-green-600">
              <p>Total Profit</p>
              <p>₨ {profit}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              onClick={handlePrint}
              disabled={loading}
            >
              {loading ? "Processing..." : "🖨️ Print"}
            </Button>
            <Button
              className="w-24 bg-gradient-to-r from-red-500 to-red-600 text-white"
              onClick={handleCancel}
              disabled={loading}
            >
              ✖ Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <Dialog
        open={showTranscript}
        onOpenChange={(open) => {
          setShowTranscript(open);
          if (!open) {
            localStorage.removeItem("cartItems"); // clear cart after print
            router.push("/pages/staff"); // go back to medicine page
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-700">
              🧾 Sales Receipt
            </DialogTitle>
          </DialogHeader>
          <div id="receipt" className="bg-white p-4 text-sm">
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold">NewDay Pharmacy</h1>
              <p className="text-gray-500 text-xs">03006914479 | 03126906640</p>
              <hr className="my-2 border-dashed" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item, index) => (
                  <TableRow key={item._id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.saleQuantity}</TableCell>
                    <TableCell>
                      ₨ {item.sellingPrice * item.saleQuantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 border-t pt-2 space-y-1 text-right">
              <p>Gross Total: ₨ {subtotal}</p>
              <p>Discount: ₨ {discountAmount}</p>
              <p className="font-bold text-lg">Net Total: ₨ {total}</p>
            </div>
            <p className="mt-4 text-center text-xs text-gray-500">
              Thank you for choosing NewDay Pharmacy 🌿
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
