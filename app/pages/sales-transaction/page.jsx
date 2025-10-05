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
  const [serviceprice, setserviceprice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const discountRef = useRef(null);
  const serviceRef = useRef(null);

  useEffect(() => {
    const handleShortcut = (e) => {
      // Ctrl + D → focus Discount
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        discountRef.current?.focus();
        setIsInputFocused(true);
      }

      // Ctrl + S → focus Service Price
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        serviceRef.current?.focus();
        setIsInputFocused(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

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

  // 🔑 Backspace = Go back to Medicines
  useEffect(() => {
    const handleBack = (e) => {
      if (e.key === "ArrowLeft") {
        // Agar input field pe focus nahi hai tohi chale
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
          e.preventDefault();
          handleGoBack();
        }
      }
    };

    window.addEventListener("keydown", handleBack);
    return () => window.removeEventListener("keydown", handleBack);
  }, [router]);

  // 🔑 Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;

      // If focused on input, only allow escape (to exit)
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault(); // prevent default behavior (number change or cursor move)
        }

        // Escape → exit input & return to row highlight
        if (e.key === "Escape") {
          e.preventDefault();
          document.activeElement?.blur();
          setIsInputFocused(false);
        }

        // Enter in input field → save and go to next row
        if (e.key === "Enter") {
          e.preventDefault();
          document.activeElement?.blur();
          setIsInputFocused(false);
          setHighlightedIndex((prev) =>
            prev < inventory.length - 1 ? prev + 1 : 0
          );
        }
        return; // don't handle navigation while inside input
      }

      // ✅ Row navigation (only when no input is focused)
      if (e.key === "ArrowUp" && !isInputFocused) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : inventory.length - 1
        );
      }

      if (e.key === "ArrowDown" && !isInputFocused) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < inventory.length - 1 ? prev + 1 : 0
        );
      }

      // Enter → focus quantity input
      if (e.key === "Enter" && !isInputFocused) {
        e.preventDefault();
        const currentMed = inventory[highlightedIndex];
        if (currentMed && qtyRefs.current[currentMed._id]) {
          qtyRefs.current[currentMed._id].focus();
          setIsInputFocused(true);
        }
      }

      // Tab → move to next row
      if (e.key === "Tab" && !isInputFocused) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < inventory.length - 1 ? prev + 1 : 0
        );
      }

      // ArrowRight → Print bill
      if (e.key === "ArrowRight" && !isInputFocused) {
        e.preventDefault();
        handlePrint();
      }

      // ArrowLeft → Go back to add medicines
      if (e.key === "ArrowLeft" && !isInputFocused) {
        e.preventDefault();
        handleGoBack();
      }

      // Number keys 1-9 → set quantity for highlighted item (only when not in input)
      if (!isInputFocused && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const currentMed = inventory[highlightedIndex];
        if (currentMed) {
          const newQty = parseInt(e.key);
          handleQuantityChange(currentMed._id, newQty);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inventory, highlightedIndex, isInputFocused]);

  // 🔑 Close transcript on Enter and redirect to staff page
  useEffect(() => {
    if (!showTranscript) return;

    const handleEnterClose = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setShowTranscript(false);
        localStorage.removeItem("cartItems"); // clear cart
        router.push("/pages/staff"); // redirect to staff page
      }
    };

    window.addEventListener("keydown", handleEnterClose);
    return () => window.removeEventListener("keydown", handleEnterClose);
  }, [showTranscript, router]);

  const handleQuantityChange = (id, qty) => {
    if (isNaN(qty) || qty < 1) return;

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

  const handleInputChange = (id, value) => {
    // Allow empty value for better UX when typing
    if (value === "") {
      setInventory((prev) =>
        prev.map((med) => (med._id === id ? { ...med, saleQuantity: "" } : med))
      );
      return;
    }

    const qty = parseInt(value);
    if (!isNaN(qty) && qty >= 1) {
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
    }
  };

  const handleDelete = (id) => {
    setInventory((prev) => {
      const newInventory = prev.filter((med) => med._id !== id);
      // Update localStorage
      localStorage.setItem("cartItems", JSON.stringify(newInventory));
      return newInventory;
    });

    // Adjust highlighted index if needed
    if (highlightedIndex >= inventory.length - 1) {
      setHighlightedIndex(Math.max(0, inventory.length - 2));
    }
  };

  const handleGoBack = () => {
    // Save current cart items to localStorage before going back
    localStorage.setItem("cartItems", JSON.stringify(inventory));
    router.push("/pages/staff");
  };

  const handleCancel = () => {
    localStorage.removeItem("cartItems");
    router.push("/pages/staff");
  };

  const subtotal = inventory.reduce(
    (acc, med) => acc + med.sellingPrice * (med.saleQuantity || 1),
    0
  );
  const discountAmount = Math.min(discount, subtotal);
  const discountPercent =
    subtotal > 0 ? ((discountAmount / subtotal) * 100).toFixed(2) : 0;
  const total = subtotal - discountAmount + serviceprice;
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
          quantity: med.saleQuantity || 1,
          sellingPrice: med.sellingPrice,
          totalAmount: med.sellingPrice * (med.saleQuantity || 1),
          profit:
            (med.sellingPrice - med.purchasePrice) * (med.saleQuantity || 1),
        })),
        discount: discountAmount,
        finalTotal: total,
        serviceprice: serviceprice,
      };
      console.log(payload);
      await axios.post("/api/history", payload);
      setShowTranscript(true);
    } catch (err) {
      console.error("Print failed:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = (index) => {
    setIsInputFocused(true);
    setHighlightedIndex(index);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    // Ensure all empty quantities are set to 1 when blurring
    setInventory((prev) =>
      prev.map((med) =>
        med.saleQuantity === "" || med.saleQuantity < 1
          ? { ...med, saleQuantity: 1 }
          : med
      )
    );
  };

  return (
    <div className="p-6 sm:p-10 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-700">
          💊 Sales Transaction
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="hover:bg-green-100 hover:text-green-600 border-green-300"
          >
            ← Add More Medicines
          </Button>
          <Link href="/pages/staff">
            <Button
              variant="outline"
              className="hover:bg-blue-100 hover:text-blue-600"
            >
              Open Medicines
            </Button>
          </Link>
        </div>
      </header>

      {/* Keyboard Shortcuts Help */}
      {/* <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">
            Keyboard Shortcuts:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>↑↓ : Navigate Rows</div>
            <div>Enter : Edit Quantity</div>
            <div>1-9 : Set Quantity</div>
            <div>Tab : Next Row</div>
            <div>→ : Print Bill</div>
            <div>← : Add More Meds</div>
            <div>Esc : Exit Input</div>
            <div>Enter in Input : Save & Next</div>
            <div>Enter in Receipt : Close & Go Back</div>
          </div>
        </div> */}

      <div className="flex items-center justify-center w-[100%]">
        <div className="p-2 md:w-[70%] flex items-center justify-center">
          <div className="flex flex-col lg:w-[60%] gap-6">
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
                        index === highlightedIndex && !isInputFocused
                          ? "bg-blue-100 font-semibold ring-2 ring-blue-300"
                          : index === highlightedIndex && isInputFocused
                          ? "bg-blue-50 font-semibold"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={med.saleQuantity}
                          className="w-20 text-center no-spinner bg-white"
                          min="1"
                          max={med.quantity}
                          ref={(el) => (qtyRefs.current[med._id] = el)}
                          onChange={(e) =>
                            handleInputChange(med._id, e.target.value)
                          }
                          onFocus={() => handleInputFocus(index)}
                          onBlur={handleInputBlur}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.target.blur();
                            }
                          }}
                        />
                        <p className="text-xs text-gray-500">
                          Stock: {med.quantity}
                        </p>
                      </TableCell>
                      <TableCell>₨ {med.sellingPrice}</TableCell>
                      <TableCell>
                        ₨ {med.sellingPrice * (med.saleQuantity || 1)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(med._id)}
                          className="hover:bg-red-600"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {inventory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No medicines added to cart.</p>
                  <Button
                    onClick={handleGoBack}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ← Go Add Medicines
                  </Button>
                </div>
              )}
            </div>

            {/* Checkout Card */}
            <div className="rounded-xl border bg-white shadow-lg p-6 backdrop-blur">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Checkout Summary
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Discount (₨)
                </label>
                <Input
                  ref={discountRef}
                  type="number"
                  value={discount === 0 ? "" : discount}
                  min={0}
                  max={subtotal}
                  onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                  className="mb-2"
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={handleInputBlur}
                />

                <p className="text-xs text-gray-500">
                  {discountAmount} Rs ({discountPercent}%)
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Service (₨)
                </label>
                <Input
                  ref={serviceRef}
                  type="number"
                  value={serviceprice === 0 ? "" : serviceprice}
                  min={0}
                  max={subtotal}
                  onChange={(e) =>
                    setserviceprice(parseInt(e.target.value) || 0)
                  }
                  className="mb-2"
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={handleInputBlur}
                />
              </div>

              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>₨ {subtotal}</p>
                </div>
                <div className="flex justify-between">
                  <p>Service</p>
                  <p>₨ {serviceprice}</p>
                </div>
                <div className="flex justify-between">
                  <p>Discount</p>
                  <p>₨ {discountAmount}</p>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <p>Total Price</p>
                  <p>₨ {total}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  onClick={handlePrint}
                  disabled={loading || inventory.length === 0}
                >
                  {loading ? "Processing..." : "🖨️ Print Bill (→)"}
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  onClick={handleGoBack}
                  disabled={loading}
                >
                  ← Add More (←)
                </Button>
                <Button
                  className="w-24 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  ✖ Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <Dialog
        open={showTranscript}
        onOpenChange={(open) => {
          setShowTranscript(open);
          if (!open) {
            localStorage.removeItem("cartItems");
            router.push("/pages/staff");
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
                    <TableCell>{item.saleQuantity || 1}</TableCell>
                    <TableCell>
                      ₨ {item.sellingPrice * (item.saleQuantity || 1)}
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
            <div className="mt-4 text-center">
              <Button
                onClick={() => {
                  setShowTranscript(false);
                  localStorage.removeItem("cartItems");
                  router.push("/pages/staff");
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Close (Enter)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
