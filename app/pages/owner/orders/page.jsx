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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      console.log(id)
      await axios.delete("/api/history", { data: { id } });
      setHistory((prev) => prev.filter((record) => record._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredHistory = history.filter((record) =>
    record.items.some((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  );

  const openEditModal = (record, item) => {
    setEditingRecord(record);
    setEditingItem(item);
    setNewQuantity(item.quantity);
  };

const handleUpdateQuantity = async () => {
  if (!editingRecord || !editingItem) return;

  try {
    await axios.put("/api/update-quntity", {
      historyId: editingRecord._id,
      itemId: editingItem._id,
      newQuantity: newQuantity,
    });

    // Update local state immediately
    const updatedItems = editingRecord.items.map((item) =>
      item._id === editingItem._id
        ? { ...item, quantity: newQuantity, totalAmount: newQuantity * item.sellingPrice }
        : item
    );
    const updatedFinalTotal = updatedItems.reduce((sum, i) => sum + i.totalAmount, 0);

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



  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-primary">Sales History</h1>

      <Input
        placeholder="Search by medicine..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-64"
      />

      <div className="overflow-x-auto bg-white rounded-md border border-gray-400 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-300">
              <TableHead className="border border-gray-300 text-primary">No</TableHead>
              <TableHead className="border border-gray-300 text-primary">Medicine</TableHead>
              <TableHead className="border border-gray-300 text-primary text-right">Quantity</TableHead>
              <TableHead className="border border-gray-300 text-primary text-right">Price/Unit (₨)</TableHead>
              <TableHead className="border border-gray-300 text-primary text-right">Total (₨)</TableHead>
              <TableHead className="border border-gray-300 text-primary text-right">Discount (₨)</TableHead>
              <TableHead className="border border-gray-300 text-primary text-right">Final Total (₨)</TableHead>
              <TableHead className="border border-gray-300 text-primary">Date</TableHead>
              <TableHead className="border border-gray-300 text-primary text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.flatMap((record, idx) =>
                record.items.map((item, itemIdx) => (
                  <TableRow key={`${record._id}-${itemIdx}`} className="border-b border-gray-200">
                    {itemIdx === 0 && (
                      <TableCell rowSpan={record.items.length} className="border border-gray-300">{idx + 1}</TableCell>
                    )}
                    <TableCell className="border border-gray-300">{item.name}</TableCell>
                    <TableCell className="border border-gray-300 text-right">{item.quantity}</TableCell>
                    <TableCell className="border border-gray-300 text-right">₨ {item.sellingPrice}</TableCell>
                    <TableCell className="border border-gray-300 text-right">₨ {item.totalAmount}</TableCell>
                    {itemIdx === 0 && (
                      <>
                        <TableCell rowSpan={record.items.length} className="border border-gray-300 text-right">₨ {record.discount}</TableCell>
                        <TableCell rowSpan={record.items.length} className="border border-gray-300 text-right">₨ {record.finalTotal}</TableCell>
                        <TableCell rowSpan={record.items.length} className="border border-gray-300">{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell rowSpan={record.items.length} className="border border-gray-300 text-right  gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEditModal(record, item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(record._id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )
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
            <p><strong>Medicine:</strong> {editingItem?.name}</p>
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
