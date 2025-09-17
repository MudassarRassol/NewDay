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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function SalesTransactionPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
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


  // ✅ Keyboard Shortcuts (Ctrl+P = Print, Ctrl+C = Cancel)
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inventory, discount]);


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

  // ✅ baki tumhara pura UI jaisa hai waisa hi chalega...
  return (
   <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Sales Transaction</h1>
        <nav className="flex gap-3">
          <Link href="/pages/staff">
            <Button variant="outline">Open Medicines</Button>
          </Link>
        </nav>
      </header>

      {/* Search Box */}

      <div className="flex flex-col gap-4 items-center  justify-center ">
        {/* Medicines Table */}
        <div className="overflow-x-auto md:w-[40%] rounded-lg border bg-white shadow-sm p-2">

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
                              m._id === med._id ? { ...m, saleQuantity: 0 } : m
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

                  <TableCell>₨ {med.sellingPrice * med.saleQuantity}</TableCell>

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


        {/* Checkout Box */}
        <div className="rounded-lg md:w-[40%] border bg-white p-4 sm:p-6 shadow-sm">
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
          <div className="mt-4 flex items-center gap-2 sm:gap-3">
            <Button
              className="w-[80%] bg-blue-500 hover:bg-blue-600"
              onClick={handlePrint}
              disabled={loading}
            >
              {loading ? "Processing..." : "Print"}
            </Button>
            <Button
              className="w-[20%] bg-red-500 hover:bg-red-600"
              onClick={handleCancel} // ✅ اب Cancel صحیح
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sales Transcript</DialogTitle>
          </DialogHeader>

          {/* Receipt */}
          <div
            id="receipt"
            className="bg-white p-6 flex flex-col text-sm border rounded-md shadow-sm"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">NewDay Pharmacy</h1>
              <p>03006914479 | 03126906640</p>
              <hr className="my-2 border-gray-400" />
            </div>

            <div className="flex-grow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item, index) => (
                    <TableRow key={item._id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.saleQuantity}</TableCell>
                      <TableCell>₨ {item.sellingPrice}</TableCell>
                      <TableCell>
                        ₨ {item.sellingPrice * item.saleQuantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 border-t pt-4 space-y-1">
              <div className="flex flex-row items-center justify-between">
                <p>Gross Total : ₨ {subtotal}</p>
                 <p>Discount : ₨ {discountAmount} </p>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 items-end  ">
                <p>Net Total : ₨ {total}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                const printContents =
                  document.getElementById("receipt")?.innerHTML;
                if (printContents) {
                  const newWin = window.open("", "_blank");
                  newWin.document.write(`
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: #fff; }
              .receipt { 
                max-width: 380px;  
                margin: auto; 
                border: 1px solid #ddd; 
                border-radius: 6px; 
                padding: 16px; 
                font-size: 13px;
                 text-align: center; 
              }
              h1 { font-size: 20px; margin: 0;text-align: center;  }
              .header { text-align: center; margin-bottom: 10px; }
              .header p { margin: 0; font-size: 12px; }
              hr { margin: 8px 0; border: 1px dashed #ccc; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th, td { border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 12px; }
              th { background: #f5f5f5; }
              .totals { margin-top: 10px; padding-top: 6px; border-top: 1px solid #ccc; }
              .totals div { display: flex; justify-content: space-between; margin: 4px 0; }
              .totals div:last-child { font-weight: bold; font-size: 14px; }
              .footer { text-align: center; margin-top: 12px; font-size: 11px; color: #555; }
            </style>
          </head>
          <body>
            <div class="receipt">
              ${printContents}
              <div class="footer">
                Thank you for choosing <b>NewDay Pharmacy</b><br/>
                Get well soon! 🌿
              </div>
            </div>
          </body>
        </html>
      `);
                  newWin.document.close();
                  newWin.focus();
                  newWin.print();
                  newWin.close();
                }
              }}
            >
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
