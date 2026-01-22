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
  const [RAG, setRAG] = useState("");
  const [expiryDay, setExpiryDay] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [category, setCategory] = useState("General");
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Refs
  const nameRef = useRef(null);
  const genericRef = useRef(null);
  const RAGRef = useRef(null);
  const expiryDayRef = useRef(null);
  const expiryMonthRef = useRef(null);
  const expiryYearRef = useRef(null);
  const categoryRef = useRef(null);
  const customCategoryRef = useRef(null);
  const quantityRef = useRef(null);
  const purchasePriceRef = useRef(null);
  const sellingPriceRef = useRef(null);

  useEffect(() => {
    if (medicine) {
      setName(medicine.name || "");
      setGeneric(medicine.generic || "");
      setRAG(medicine.rag || "");

      if (medicine.expiry) {
        const date = new Date(medicine.expiry);
        setExpiryDay(date.getDate().toString());
        setExpiryMonth((date.getMonth() + 1).toString());
        setExpiryYear(date.getFullYear().toString());
      }

      setQuantity(medicine.quantity || "");
      setPurchasePrice(medicine.purchasePrice || "");
      setSellingPrice(medicine.sellingPrice || "");

      const defaultCategories = ["General", "Tablet", "Capsule", "Syrup", "Injection"];
      if (defaultCategories.includes(medicine.category)) {
        setCategory(medicine.category);
        setCustomCategory("");
      } else {
        setCategory("Other");
        setCustomCategory(medicine.category || "");
      }
    }
  }, [medicine]);

  // helpers
  const onlyDigits = (val, maxLen = Infinity) =>
    (val || "").replace(/\D/g, "").slice(0, maxLen);

  const focusNext = (ref) => ref?.current && setTimeout(() => ref.current.focus(), 0);
  const focusPrev = (ref) => {
    if (ref?.current) {
      setTimeout(() => {
        ref.current.focus();
        try {
          const v = ref.current.value || "";
          ref.current.setSelectionRange(v.length, v.length);
        } catch {}
      }, 0);
    }
  };

  // same keyboard handler as AddMedicineModal
  const handleKeyDown = (e, prevRef, nextRef) => {
    const tag = e.target?.tagName?.toUpperCase() || "";
    if (tag === "SELECT" || tag === "TEXTAREA" || e.target.getAttribute?.("role") === "listbox") {
      return;
    }

    if (e.key === "Backspace") {
      try {
        const input = e.target;
        if ((input.value === "" || input.selectionStart === 0) && prevRef?.current) {
          e.preventDefault();
          focusPrev(prevRef);
          return;
        }
      } catch {}
    }

    if (["ArrowRight", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      if (nextRef?.current) focusNext(nextRef);
      return;
    }
    if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      if (prevRef?.current) focusPrev(prevRef);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (
        name && generic && RAG && expiryDay && expiryMonth && expiryYear &&
        quantity && purchasePrice && sellingPrice &&
        (category !== "Other" || customCategory)
      ) {
        handleSubmit();
      } else if (nextRef?.current) {
        focusNext(nextRef);
      }
    }
  };

const handleSubmit = async () => {
  if (
    !name || !generic || !RAG || !expiryDay || !expiryMonth || !expiryYear ||
    !quantity || !purchasePrice || !sellingPrice || !category
  ) {
    return alert("Please fill all fields");
  }
  if (isNaN(quantity) || isNaN(purchasePrice) || isNaN(sellingPrice)) {
    return alert("Quantity and prices must be numbers");
  }

  const expiry = new Date(
    Number(expiryYear),
    Number(expiryMonth) - 1,
    Number(expiryDay)
  ).toISOString();

  setLoading(true);
  try {
    await onSave({
      id: medicine?._id,
      name,
      generic,
      rag: RAG,
      expiry,
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      category,
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
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter medicine name"
              onKeyDown={(e) => handleKeyDown(e, null, genericRef)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Generic</Label>
            <Input
              ref={genericRef}
              value={generic}
              onChange={(e) => setGeneric(e.target.value)}
              placeholder="Enter generic"
              onKeyDown={(e) => handleKeyDown(e, nameRef, RAGRef)}
            />
          </div>

          <div className="grid gap-2">
            <Label>RAG</Label>
            <Input
              ref={RAGRef}
              value={RAG}
              onChange={(e) => setRAG(e.target.value)}
              placeholder="Enter RAG"
              onKeyDown={(e) => handleKeyDown(e, genericRef, expiryDayRef)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Expiry Date</Label>
            <div className="flex gap-2">
              <Input
                ref={expiryDayRef}
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="DD"
                className="w-16"
                value={expiryDay}
                onChange={(e) => setExpiryDay(onlyDigits(e.target.value, 2))}
                onKeyDown={(e) => handleKeyDown(e, genericRef, expiryMonthRef)}
              />
              <Input
                ref={expiryMonthRef}
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="MM"
                className="w-16"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(onlyDigits(e.target.value, 2))}
                onKeyDown={(e) => handleKeyDown(e, expiryDayRef, expiryYearRef)}
              />
              <Input
                ref={expiryYearRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="YYYY"
                className="w-24"
                value={expiryYear}
                onChange={(e) => setExpiryYear(onlyDigits(e.target.value, 4))}
                onKeyDown={(e) => handleKeyDown(e, expiryMonthRef, categoryRef)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Input
              id="category"
              ref={categoryRef}
              autoComplete="off"
              spellCheck={false}
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category (Tablet, Syrup, etc)"
              onKeyDown={(e) => handleKeyDown(e, expiryYearRef, quantityRef)}
            />

          </div>

          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              ref={quantityRef}
              type="text"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(onlyDigits(e.target.value))}
              placeholder="Enter quantity"
              onKeyDown={(e) => handleKeyDown(e, category === "Other" ? customCategoryRef : categoryRef, purchasePriceRef)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Purchase Price (₨)</Label>
            <Input
              ref={purchasePriceRef}
              type="text"
              inputMode="decimal"
              value={purchasePrice}
              onChange={(e) =>
                setPurchasePrice(e.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="Enter purchase price"
              onKeyDown={(e) => handleKeyDown(e, quantityRef, sellingPriceRef)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Selling Price (₨)</Label>
            <Input
              ref={sellingPriceRef}
              type="text"
              inputMode="decimal"
              value={sellingPrice}
              onChange={(e) =>
                setSellingPrice(e.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="Enter selling price"
              onKeyDown={(e) => handleKeyDown(e, purchasePriceRef, null)} // ✅ null = submit
            />
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
