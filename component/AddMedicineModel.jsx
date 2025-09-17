"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";

export default function AddMedicineModal({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [generic, setGeneric] = useState("");
  const [expiryDay, setExpiryDay] = useState("");   // expiry day
  const [expiryMonth, setExpiryMonth] = useState(""); // expiry month
  const [expiryYear, setExpiryYear] = useState(""); // expiry year
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [category, setCategory] = useState(""); // selected category
  const [customCategory, setCustomCategory] = useState(""); // for "Other"
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  if (
    !name ||
    !generic ||
    !expiryDay ||
    !expiryMonth ||
    !expiryYear ||
    !quantity ||
    !purchasePrice ||
    !sellingPrice ||
    (!category && !customCategory)
  ) {
    return alert("Please fill all the fields");
  }

  if (
    isNaN(quantity) ||
    isNaN(purchasePrice) ||
    isNaN(sellingPrice) ||
    isNaN(expiryDay) ||
    isNaN(expiryMonth) ||
    isNaN(expiryYear)
  ) {
    return alert("Please enter valid numbers");
  }

  const finalCategory = category === "Other" ? customCategory : category;

  // ✅ Convert DD/MM/YYYY to JS Date object
  const expiryDate = new Date(
    Number(expiryYear),
    Number(expiryMonth) - 1, // months 0-based
    Number(expiryDay)
  );

  setLoading(true);
  try {
    await onSave({
      name,
      generic,
      expiry: expiryDate, // send proper Date
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      category: finalCategory,
    });

    // Reset form
    setName("");
    setGeneric("");
    setExpiryDay("");
    setExpiryMonth("");
    setExpiryYear("");
    setQuantity("");
    setPurchasePrice("");
    setSellingPrice("");
    setCategory("");
    setCustomCategory("");

    onClose();
  } catch (err) {
    console.error("Error adding medicine:", err);
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Medicine</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">


          <div className="grid gap-2">
            <Label htmlFor="name">Medicine Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter medicine name"
            />
          </div>


          {/* Generic */}

          <div className="grid gap-2">
            <Label htmlFor="generic">Generic</Label>
            <Input
              id="generic"
              value={generic}
              onChange={(e) => setGeneric(e.target.value)}
              placeholder="Enter generic"
            />
          </div>

          {/* Expiry Date - Custom Day/Month/Year */}
          <div className="grid gap-2">
            <Label>Expiry Date</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="31"
                value={expiryDay}
                onChange={(e) => setExpiryDay(e.target.value)}
                placeholder="DD"
                className="w-1/3"
              />
              <Input
                type="number"
                min="1"
                max="12"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                placeholder="MM"
                className="w-1/3"
              />
              <Input
                type="number"
                min="2024"
                max="2100"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                placeholder="YYYY"
                className="w-1/3"
              />
            </div>
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-md p-2"
            >
              <option value="">Select category</option>
              <option value="Tablet">Tablet</option>
              <option value="Syrup">Syrup</option>
              <option value="Capsule">Capsule</option>
              <option value="Injection">Injection</option>
              <option value="Cream">Cream</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Custom Category Input if "Other" */}
          {category === "Other" && (
            <div className="grid gap-2">
              <Label htmlFor="customCategory">Custom Category</Label>
              <Input
                id="customCategory"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter your own category"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>


          <div className="grid gap-2">
            <Label htmlFor="purchasePrice">Purchase Price (₨)</Label>
            <Input
              type="number"
              id="purchasePrice"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Enter purchase price"
            />
          </div>


          <div className="grid gap-2">
            <Label htmlFor="sellingPrice">Selling Price (₨)</Label>
            <Input
              type="number"
              id="sellingPrice"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="Enter selling price"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
