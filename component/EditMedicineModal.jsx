"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function EditMedicineModal({ open, onClose, onSave, medicine }) {
  const [name, setName] = useState("");
  const [generic, setGeneric] = useState("");
  const [expiry, setExpiry] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Load medicine data when editing
  useEffect(() => {
    if (medicine) {
      setName(medicine.name || "");
      setGeneric(medicine.generic || "");
      setExpiry(medicine.expiry ? new Date(medicine.expiry) : null);
      setQuantity(medicine.quantity || "");
      setPurchasePrice(medicine.purchasePrice || "");
      setSellingPrice(medicine.sellingPrice || "");
    }
  }, [medicine]);

  const handleSubmit = async () => {
    if (!name || !generic || !expiry || !quantity || !purchasePrice || !sellingPrice) {
      return alert("Please fill all fields");
    }
    if (isNaN(quantity) || isNaN(purchasePrice) || isNaN(sellingPrice)) {
      return alert("Quantity and prices must be numbers");
    }

    setLoading(true);
    try {
      await onSave({
        id: medicine?._id, // ✅ Important for PUT
        name,
        generic,
        expiry: expiry.toISOString(),
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
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
            <Label htmlFor="name">Medicine Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter medicine name" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="generic">Generic</Label>
            <Input value={generic} onChange={(e) => setGeneric(e.target.value)} placeholder="Enter generic" />
          </div>

          <div className="grid gap-2">
            <Label>Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!expiry && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiry ? format(expiry, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0">
                <Calendar mode="single" selected={expiry || undefined} onSelect={setExpiry} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter quantity" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="purchasePrice">Purchase Price (₨)</Label>
            <Input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="Enter purchase price" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sellingPrice">Selling Price (₨)</Label>
            <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="Enter selling price" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
