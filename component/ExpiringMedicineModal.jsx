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
import { Loader2, AlertCircle } from "lucide-react";

export default function ExpiringMedicineModal({ open, onClose }) {
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [expiredMedicines, setExpiredMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchExpiringMedicines = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/medmanage/expiring");
        const data = await res.json();

        if (data.success) {
          setExpiringMedicines(data.expiring.data);
          setExpiredMedicines(data.expired.data);
        } else {
          setError("Failed to fetch expiring medicines");
        }
      } catch (err) {
        console.error("Error fetching expiring medicines:", err);
        setError("Error fetching expiring medicines");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringMedicines();
  }, [open]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <DialogTitle>Expiring Medicines Alert</DialogTitle>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-600">{error}</div>
        ) : (
          <div className="space-y-6">
            {/* Expiring Soon Section */}
            <div>
              <h3 className="text-lg font-semibold text-orange-600 mb-3">
                Expiring Within 30 Days ({expiringMedicines.length})
              </h3>
              {expiringMedicines.length === 0 ? (
                <p className="text-gray-600">No medicines expiring soon</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine Name</TableHead>
                        <TableHead>Generic</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead className="text-right">Selling Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringMedicines.map((medicine) => (
                        <TableRow key={medicine._id} className="hover:bg-orange-50">
                          <TableCell className="font-medium">{medicine.name}</TableCell>
                          <TableCell>{medicine.generic}</TableCell>
                          <TableCell>{medicine.category}</TableCell>
                          <TableCell className="text-right">{medicine.quantity}</TableCell>
                          <TableCell className="text-orange-600 font-semibold">
                            {formatDate(medicine.expiry)}
                          </TableCell>
                          <TableCell className="text-right">₨{medicine.sellingPrice}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Already Expired Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-red-600 mb-3">
                Already Expired ({expiredMedicines.length})
              </h3>
              {expiredMedicines.length === 0 ? (
                <p className="text-gray-600 text-green-600">✓ No expired medicines</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine Name</TableHead>
                        <TableHead>Generic</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead className="text-right">Selling Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiredMedicines.map((medicine) => (
                        <TableRow key={medicine._id} className="hover:bg-red-50">
                          <TableCell className="font-medium">{medicine.name}</TableCell>
                          <TableCell>{medicine.generic}</TableCell>
                          <TableCell>{medicine.category}</TableCell>
                          <TableCell className="text-right">{medicine.quantity}</TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            {formatDate(medicine.expiry)}
                          </TableCell>
                          <TableCell className="text-right">₨{medicine.sellingPrice}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
