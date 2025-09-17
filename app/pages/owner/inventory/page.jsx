"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Input } from "../../../../components/ui/input";
import { Edit, Trash2, Plus } from "lucide-react";
import EditMedicineModal from "../../../../component/EditMedicineModal";
import AddMedicineModal from "../../../../component/AddMedicineModel";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expiringSoon, setExpiringSoon] = useState(false);

  // ✅ Fetch all medicines
  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/medicines");
      setInventory(res.data);
    } catch (err) {
      console.error("Failed to fetch medicines", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // ✅ Delete medicine
  const deleteItem = async (id) => {
    try {
      await axios.delete("/api/medicines", { data: { id } });
      setInventory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ✅ Edit medicine
  const handleSave = async (updated) => {
    try {
      const res = await axios.put("/api/medicines", updated);
      setInventory((prev) =>
        prev.map((item) => (item._id === updated.id ? res.data : item))
      );
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // ✅ Add new medicine
  const handleAdd = async (newMedicine) => {
    try {
      const res = await axios.post("/api/medicines", newMedicine);
      setInventory((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  const highlightText = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi"); // case-insensitive
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // ✅ Filter inventory by search & Expiring Soon
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.generic.toLowerCase().includes(search.toLowerCase());

    if (!expiringSoon) return matchesSearch;

    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const expiryDate = new Date(item.expiry);
    const isExpiringSoon =
      expiryDate <= threeMonthsLater && expiryDate >= today;

    return matchesSearch && isExpiringSoon;
  });

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Medicines Inventory</h1>
        <div className="flex   gap-3 flex-wrap ">
          <Input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="flex items-center gap-3" >
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Medicine
            </Button>
            <Button
              onClick={() => setExpiringSoon((prev) => !prev)}
              variant={expiringSoon ? "destructive" : "default"}
            >
              {expiringSoon ? "Showing Expiring Soon" : "Expiring Soon"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-2 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-red-950">No</TableHead>
              <TableHead className="text-blue-600">Medicine Name</TableHead>
              <TableHead className="text-primary">(Generic)</TableHead>
              <TableHead className="text-primary">Category</TableHead>
              <TableHead className="text-green-500">Quantity</TableHead>
              <TableHead className="">TP</TableHead>
              <TableHead className="text-primary">MRP</TableHead>
              <TableHead className="">Expiry Date</TableHead>
              <TableHead className="text-primary text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Loading medicines...
                </TableCell>
              </TableRow>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No medicines found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell className="border w-1 text-red-950">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border text-blue-600">
                    {highlightText(item.name, search)}
                  </TableCell>
                  <TableCell className="border text-primary">
                    {highlightText(item.generic, search)}
                  </TableCell>
                      <TableCell className="border text-primary">
                    
                    {
                      item.category ?  highlightText(item.category, search)  : 'None'
                    }
                    
                  </TableCell>
                  <TableCell className="border text-green-500">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="border ">
                    ₨ {item.purchasePrice}
                  </TableCell>
                  <TableCell className="border text-primary">
                    ₨ {item.sellingPrice}
                  </TableCell>
                  <TableCell
                    className={`border ${
                      new Date(item.expiry) < new Date()
                        ? "text-red-500 font-semibold"
                        : ""
                    }`}
                  >
                    {new Date(item.expiry).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end border">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingMedicine(item);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteItem(item._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <EditMedicineModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        medicine={editingMedicine}
        onSave={handleSave}
      />

      {/* Add Modal */}
      <AddMedicineModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
      />
    </div>
  );
}
