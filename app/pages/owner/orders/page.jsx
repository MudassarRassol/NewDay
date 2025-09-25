"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Date filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Fetch history
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/history");
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ✅ Toggle single select
  const toggleSelect = (id) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Delete single
  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await axios.delete("/api/history", { data: { ids: [id] } });
      setHistory((prev) => prev.filter((record) => record._id !== id));
      setSelectedRecords((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ✅ Delete multiple
  const handleDeleteSelected = async () => {
    if (selectedRecords.length === 0) return;
    if (!confirm("Delete selected records?")) return;

    try {
      await axios.delete("/api/history", { data: { ids: selectedRecords } });
      setHistory((prev) =>
        prev.filter((record) => !selectedRecords.includes(record._id))
      );
      setSelectedRecords([]);
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  // ✅ Filter history
  const filteredHistory = history
    .filter((record) =>
      record.items.some((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((record) => {
      if (!startDate && !endDate) return true;
      const recordDate = new Date(record.createdAt).setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      if (start && recordDate < start) return false;
      if (end && recordDate > end) return false;
      return true;
    });

  // ✅ Handle navigation with keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingItem) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredHistory.length - 1 ? prev + 1 : prev
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const current = filteredHistory[focusedIndex];
        if (current) toggleSelect(current._id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredHistory, focusedIndex, editingItem]);

  // ✅ Open modal
  const openEditModal = (record, item) => {
    setEditingRecord(record);
    setEditingItem(item);
    setNewQuantity(item.quantity);
  };

  // ✅ Update quantity
  const handleUpdateQuantity = async () => {
    if (!editingRecord || !editingItem) return;
    try {
      await axios.put("/api/update-quntity", {
        historyId: editingRecord._id,
        itemId: editingItem._id,
        newQuantity: newQuantity,
      });

      const updatedItems = editingRecord.items.map((item) =>
        item._id === editingItem._id
          ? {
              ...item,
              quantity: newQuantity,
              totalAmount: newQuantity * item.sellingPrice,
            }
          : item
      );
      const updatedFinalTotal = updatedItems.reduce(
        (sum, i) => sum + i.totalAmount,
        0
      );

      setHistory((prev) =>
        prev.map((record) =>
          record._id === editingRecord._id
            ? { ...record, items: updatedItems, finalTotal: updatedFinalTotal }
            : record
        )
      );

      setEditingItem(null);
      setEditingRecord(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // ✅ Calculate total profit
  const totalProfit = filteredHistory.reduce((sum, record) => {
    return (
      sum +
      record.items.reduce((itemSum, item) => {
        const selling = Number(item.sellingPrice || 0);
        const purchase = Number(item.medicineId?.purchasePrice ?? 0);
        const qty = Number(item.quantity || 0);
        return itemSum + (selling - purchase) * qty;
      }, 0)
    );
  }, 0);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-primary">Sales History</h1>

      {/* 🔹 Search + Date Filters */}
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search by medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {selectedRecords.length > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedRecords.length})
          </Button>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-md border border-gray-400 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>No</TableHead>
              <TableHead>Medicine</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price/Unit (₨)</TableHead>
              <TableHead className="text-right">Total (₨)</TableHead>
              <TableHead className="text-right">Profit (₨)</TableHead>
              <TableHead className="text-right">Discount (₨)</TableHead>
              <TableHead className="text-right">Final Total (₨)</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-6">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.flatMap((record, idx) =>
                record.items.map((item, itemIdx) => {
                  const profit =
                    (Number(item.sellingPrice || 0) -
                      Number(item.medicineId?.purchasePrice ?? 0)) *
                    Number(item.quantity || 0);

                  return (
                    <TableRow
                      key={`${record._id}-${itemIdx}`}
                      className={`border-b border-gray-200 ${
                        idx === focusedIndex ? "bg-blue-100" : ""
                      }`}
                    >
                      {itemIdx === 0 && (
                        <>
                          <TableCell rowSpan={record.items.length}>
                            <input
                              className="ml-4"
                              type="checkbox"
                              checked={selectedRecords.includes(record._id)}
                              onChange={() => toggleSelect(record._id)}
                            />
                          </TableCell>
                          <TableCell rowSpan={record.items.length}>
                            {idx + 1}
                          </TableCell>
                        </>
                      )}
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ₨ {item.sellingPrice}{" "}
                        {item.medicineId?.purchasePrice
                          ? `(Cost: ₨ ${item.medicineId.purchasePrice})`
                          : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        ₨ {item.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ₨ {profit.toFixed(2)}
                      </TableCell>
                      {itemIdx === 0 && (
                        <>
                          <TableCell
                            rowSpan={record.items.length}
                            className="text-right"
                          >
                            ₨ {record.discount}
                          </TableCell>
                          <TableCell
                            rowSpan={record.items.length}
                            className="text-right"
                          >
                            ₨ {record.finalTotal.toFixed(2)}
                          </TableCell>
                          <TableCell rowSpan={record.items.length}>
                            {new Date(record.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell
                            rowSpan={record.items.length}
                            className="text-right gap-2"
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditModal(record, item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(record._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })
              )
            )}

            {/* 🔹 Total Profit Row */}
            {filteredHistory.length > 0 && (
              <TableRow className="bg-gray-100 font-bold">
                <TableCell colSpan={6} className="text-right">
                  Total Profit:
                </TableCell>
                <TableCell colSpan={5} className="text-left">
                  ₨ {totalProfit.toFixed(2)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Quantity Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quantity</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <p>
              <strong>Medicine:</strong> {editingItem?.name}
            </p>
            <Input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              min={0}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateQuantity}>Update Quantity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
