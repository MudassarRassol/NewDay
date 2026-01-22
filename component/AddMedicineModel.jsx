"use client";

import { useState, useRef, useEffect } from "react";
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
  const [expiryDay, setExpiryDay] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [category, setCategory] = useState("");
  const [RAG, setRAG] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs (ordering = flow)
  const nameRef = useRef(null);
  const genericRef = useRef(null);
  const expiryDayRef = useRef(null);
  const expiryMonthRef = useRef(null);
  const expiryYearRef = useRef(null);
  const categoryRef = useRef(null);
  const customCategoryRef = useRef(null);
  const quantityRef = useRef(null);
  const purchasePriceRef = useRef(null);
  const RAGRef = useRef(null);
  const sellingPriceRef = useRef(null);

  useEffect(() => {
    // optional: focus first field when modal opens
    if (open) setTimeout(() => nameRef.current?.focus(), 0);
  }, [open]);

  const onlyDigits = (val, maxLen = Infinity) =>
    (val || "").replace(/\D/g, "").slice(0, maxLen);

  const focusNext = (ref) => {
    if (ref?.current) setTimeout(() => ref.current.focus(), 0);
  };

  const focusPrev = (ref) => {
    if (ref?.current)
      setTimeout(() => {
        ref.current.focus();
        // move caret to end if it's an input
        try {
          const v = ref.current.value || "";
          ref.current.setSelectionRange(v.length, v.length);
        } catch {}
      }, 0);
  };

  // main keyboard handler
  const handleKeyDown = (e, prevRef, nextRef) => {
    const tag =
      e.target && e.target.tagName ? e.target.tagName.toUpperCase() : "";
    if (
      tag === "SELECT" ||
      tag === "TEXTAREA" ||
      e.target.getAttribute?.("role") === "listbox"
    ) {
      return;
    }

    if (e.key === "Backspace") {
      try {
        const input = e.target;
        const caret = input.selectionStart;
        if ((input.value === "" || caret === 0) && prevRef?.current) {
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

    // ✅ ENTER key
    if (e.key === "Enter") {
      e.preventDefault();
      // if all fields filled -> submit directly
      if (
        name &&
        generic &&
        RAG &&
        expiryDay &&
        expiryMonth &&
        expiryYear &&
        category &&
        quantity &&
        purchasePrice &&
        sellingPrice 
      ) {
        handleSubmit();
      } else if (nextRef?.current) {
        // else move to next
        focusNext(nextRef);
      }
    }
  };

  // onBlur normalization for expiry fields (optional caps/clamp)
  const normalizeExpiry = () => {
    // clamp day 1-31, month 1-12, year reasonable
    const d = Number(expiryDay || 0);
    const m = Number(expiryMonth || 0);
    const y = Number(expiryYear || 0);

    if (d > 31) setExpiryDay("31");
    if (d === 0 && expiryDay.length > 0) setExpiryDay("1");
    if (m > 12) setExpiryMonth("12");
    if (m === 0 && expiryMonth.length > 0) setExpiryMonth("1");
    if (y < 1900 && expiryYear.length > 0)
      setExpiryYear(String(Math.max(1900, y)));
  };

  // helper function
const capitalizeWords = (str) =>
  str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());


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
      !category ||
      !RAG
    ) {
      return alert("Please fill all the fields");
    }

    if (
      isNaN(Number(quantity)) ||
      isNaN(Number(purchasePrice)) ||
      isNaN(Number(sellingPrice)) ||
      isNaN(Number(expiryDay)) ||
      isNaN(Number(expiryMonth)) ||
      isNaN(Number(expiryYear))
    ) {
      return alert("Please enter valid numbers");
    }

    const expiryDate = new Date(
      Number(expiryYear),
      Number(expiryMonth) - 1,
      Number(expiryDay)
    );

    setLoading(true);
    try {
      await onSave({
        name,
        generic,
        expiry: expiryDate,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        category,
        rag: RAG,
      });

      // reset
      setName("");
      setGeneric("");
      setExpiryDay("");
      setExpiryMonth("");
      setExpiryYear("");
      setQuantity("");
      setPurchasePrice("");
      setSellingPrice("");
      setCategory("");
      setRAG("");
      onClose();
    } catch (err) {
      console.error(err);
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
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Medicine Name</Label>
            <Input
              id="name"
              ref={nameRef}
              autoComplete="off"
              spellCheck={false}
              value={name}
              onChange={(e) => setName(capitalizeWords(e.target.value))}
              placeholder="Enter medicine name"
              onKeyDown={(e) => handleKeyDown(e, null, genericRef)}
            />
          </div>

          {/* Generic */}
          <div className="grid gap-2">
            <Label htmlFor="generic">Generic</Label>
            <Input
              id="generic"
              ref={genericRef}
              autoComplete="off"
              spellCheck={false}
              value={generic}
              onChange={(e) => setGeneric(capitalizeWords(e.target.value))}
              placeholder="Enter generic"
              onKeyDown={(e) => handleKeyDown(e, nameRef, RAGRef)}
            />
          </div>

          {/* RAG */}
          <div className="grid gap-2">
            <Label htmlFor="RAG">RAG</Label>
            <Input
              id="RAG"
              ref={RAGRef}
              autoComplete="off"
              spellCheck={false}
              value={RAG}
              onChange={(e) => setRAG(capitalizeWords(e.target.value))}
              placeholder="Enter RAG"
              onKeyDown={(e) => handleKeyDown(e, genericRef, expiryDayRef)}
            />
          </div>

          {/* Expiry */}
          <div className="grid gap-2">
            <Label>Expiry Date</Label>
            <div className="flex gap-2">
              <Input
                id="expiryDay"
                ref={expiryDayRef}
                type="text" // TEXT so arrow up/down don't change value
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="DD"
                className="w-1/3"
                value={expiryDay}
                onChange={(e) => {
                  const v = onlyDigits(e.target.value, 2);
                  setExpiryDay(v);
                  if (v.length >= 2) focusNext(expiryMonthRef);
                }}
                onKeyDown={(e) => handleKeyDown(e, genericRef, expiryMonthRef)}
              />

              <Input
                id="expiryMonth"
                ref={expiryMonthRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                placeholder="MM"
                className="w-1/3"
                value={expiryMonth}
                onChange={(e) => {
                  const v = onlyDigits(e.target.value, 2);
                  setExpiryMonth(v);
                  if (v.length >= 2) focusNext(expiryYearRef);
                }}
                onKeyDown={(e) => handleKeyDown(e, expiryDayRef, expiryYearRef)}
              />

              <Input
                id="expiryYear"
                ref={expiryYearRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="YYYY"
                className="w-1/3"
                value={expiryYear}
                onChange={(e) => {
                  const v = onlyDigits(e.target.value, 4);
                  setExpiryYear(v);
                  if (v.length >= 4) {
                    // if we have selected a category already, go to category; else just focus category
                    focusNext(categoryRef);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, expiryMonthRef, categoryRef)}
                onBlur={normalizeExpiry}
              />
            </div>
          </div>

          {/* Category */}
          {/* <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              ref={categoryRef}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-md p-2"
              onKeyDown={(e) => {
                // if user presses Enter on category, move to customCategory (if Other) or to quantity
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (categoryRef?.current) {
                    // after change, decide next target
                    const next =
                      category === "Other" ? customCategoryRef : quantityRef;
                    focusNext(next);
                  } else {
                    focusNext(quantityRef);
                  }
                }
              }}
            >
              <option value="">Select category</option>
              <option value="Tablet">Tablet</option>
              <option value="Syrup">Syrup</option>
              <option value="Capsule">Capsule</option>
              <option value="Injection">Injection</option>
              <option value="Cream">Cream</option>
              <option value="Other">Other</option>
            </select>
          </div> */}

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
 <Input
              id="category"
              ref={categoryRef}
              autoComplete="off"
              spellCheck={false}
              type="text"
              value={category}
              onChange={(e) => setCategory(capitalizeWords(e.target.value))}
              placeholder="Enter category (Tablet, Syrup, etc)"
              onKeyDown={(e) => handleKeyDown(e, expiryYearRef, quantityRef)}
            />
          </div>

          {/* Quantity */}
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              ref={quantityRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              onChange={(e) => setQuantity(onlyDigits(e.target.value))}
              placeholder="Enter quantity"
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  category === "Other" ? customCategoryRef : categoryRef,
                  purchasePriceRef
                )
              }
            />
          </div>

          {/* Purchase Price */}
          <div className="grid gap-2">
            <Label htmlFor="purchasePrice">Purchase Price (₨)</Label>
            <Input
              id="purchasePrice"
              ref={purchasePriceRef}
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              value={purchasePrice}
              onChange={(e) =>
                // allow digits and one dot for decimal if needed
                setPurchasePrice((prev) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, "");
                  // prevent more than one dot
                  const parts = raw.split(".");
                  return parts.length > 1
                    ? parts[0] + "." + parts.slice(1).join("")
                    : raw;
                })
              }
              placeholder="Enter purchase price"
              onKeyDown={(e) => handleKeyDown(e, quantityRef, sellingPriceRef)}
            />
          </div>

  <div className="grid gap-2">
            <Label htmlFor="purchasePrice">Selling Price (₨)</Label>
                      <Input
            id="sellingPrice"
            ref={sellingPriceRef}
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            value={sellingPrice}
            onChange={(e) =>
              setSellingPrice((prev) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "");
                const parts = raw.split(".");
                return parts.length > 1
                  ? parts[0] + "." + parts.slice(1).join("")
                  : raw;
              })
            }
            placeholder="Enter selling price"
            onKeyDown={(e) => handleKeyDown(e, purchasePriceRef, null)} // ✅ null = submit on Enter
          />
          </div>
        </div>

        {/* Actions */}
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
