"use client";

import { useState, useEffect, useRef } from "react";
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

export default function EditMedicineModal({ open, onClose, onSave, medicine }) {
  const [name, setName] = useState("");
  const [generic, setGeneric] = useState("");
  const [expiryDay, setExpiryDay] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [category, setCategory] = useState("General");
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Refs for inputs
  const genericRef = useRef(null);
  const expiryDayRef = useRef(null);
  const expiryMonthRef = useRef(null);
  const expiryYearRef = useRef(null);
  const quantityRef = useRef(null);
  const purchasePriceRef = useRef(null);
  const sellingPriceRef = useRef(null);
  const customCategoryRef = useRef(null);

  // ✅ Load medicine data when editing
  useEffect(() => {
    if (medicine) {
      setName(medicine.name || "");
      setGeneric(medicine.generic || "");

      if (medicine.expiry) {
        const date = new Date(medicine.expiry);
        setExpiryDay(date.getDate().toString());
        setExpiryMonth((date.getMonth() + 1).toString());
        setExpiryYear(date.getFullYear().toString());
      }
      setQuantity(medicine.quantity || "");
      setPurchasePrice(medicine.purchasePrice || "");
      setSellingPrice(medicine.sellingPrice || "");
      setCategory(medicine.category || "General");
    }
  }, [medicine]);

  // ✅ Handle Enter key to move to next input
  const handleEnterFocus = (e, nextRef) => {
    if (e.key === "Enter" && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

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
      !category
    ) {
      return alert("Please fill all fields");
    }
    if (isNaN(quantity) || isNaN(purchasePrice) || isNaN(sellingPrice)) {
      return alert("Quantity and prices must be numbers");
    }

    const expiry = new Date(`${expiryYear}-${expiryMonth}-${expiryDay}`).toISOString();
    const finalCategory = category === "Other" ? customCategory : category;

    setLoading(true);
    try {
      await onSave({
        id: medicine?._id,
        name,
        generic,
        expiry,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        category: finalCategory,
      });
      onClose();
    } catch (err) {
      console.error("Error updating medicine:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Medicine Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter medicine name"
              onKeyDown={(e) => handleEnterFocus(e, genericRef)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Generic</Label>
            <Input
              ref={genericRef}
              value={generic}
              onChange={(e) => setGeneric(e.target.value)}
              placeholder="Enter generic"
              onKeyDown={(e) => handleEnterFocus(e, expiryDayRef)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Expiry Date</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                ref={expiryDayRef}
                value={expiryDay}
                onChange={(e) => setExpiryDay(e.target.value)}
                placeholder="DD"
                className="w-16"
                onKeyDown={(e) => handleEnterFocus(e, expiryMonthRef)}
              />
              <Input
                type="number"
                ref={expiryMonthRef}
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                placeholder="MM"
                className="w-16"
                onKeyDown={(e) => handleEnterFocus(e, expiryYearRef)}
              />
              <Input
                type="number"
                ref={expiryYearRef}
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                placeholder="YYYY"
                className="w-24"
                onKeyDown={(e) =>
                  handleEnterFocus(
                    e,
                    category === "Other" ? customCategoryRef : quantityRef
                  )
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              ref={quantityRef}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              onKeyDown={(e) => handleEnterFocus(e, purchasePriceRef)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Purchase Price (₨)</Label>
            <Input
              type="number"
              ref={purchasePriceRef}
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Enter purchase price"
              onKeyDown={(e) => handleEnterFocus(e, sellingPriceRef)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Selling Price (₨)</Label>
            <Input
              type="number"
              ref={sellingPriceRef}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="Enter selling price"
              onKeyDown={(e) =>
                handleEnterFocus(
                  e,
                  category === "Other" ? customCategoryRef : null
                )
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded p-2"
            >
              <option value="General">General</option>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Other">Other</option>
            </select>
            {category === "Other" && (
              <Input
                ref={customCategoryRef}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category"
                onKeyDown={(e) => handleEnterFocus(e, quantityRef)}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
