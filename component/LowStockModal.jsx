"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Loader2, AlertTriangle } from "lucide-react";

export default function LowStockModal({ open, onClose }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchLowStock = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/medmanage/low-stock");
        const data = await res.json();

        if (data.success) {
          setMedicines(data.data);
        } else {
          setError("Failed to fetch low stock medicines");
        }
      } catch (err) {
        console.error("Error fetching low stock medicines:", err);
        setError("Error fetching low stock medicines");
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <DialogTitle>Low Stock Medicines Alert</DialogTitle>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-600">{error}</div>
        ) : medicines.length === 0 ? (
          <div className="text-center py-6 text-green-600">
            ✓ All medicines have sufficient stock!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Generic</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead>RAG Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((medicine) => (
                  <TableRow key={medicine._id} className="hover:bg-orange-50">
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.generic}</TableCell>
                    <TableCell>{medicine.category}</TableCell>
                    <TableCell className="text-right">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold">
                        {medicine.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">₨{medicine.purchasePrice}</TableCell>
                    <TableCell className="text-right">₨{medicine.sellingPrice}</TableCell>
                    <TableCell>{medicine.rag}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
