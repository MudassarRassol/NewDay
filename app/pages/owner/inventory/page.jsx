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
  const [selectedItems, setSelectedItems] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0); // 👉 Track row focus

  // ✅ Fetch medicines
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



  
    // ✅ Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.generic.toLowerCase().includes(search.toLowerCase());

    if (!expiringSoon) return matchesSearch;

    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const expiryDate = new Date(item.expiry);
    return (
      matchesSearch && expiryDate <= threeMonthsLater && expiryDate >= today
    );
  });// ✅ Shortcuts + Navigation
  useEffect(() => {

      if (isAddModalOpen || isEditModalOpen) return; // 🚫 Disable when modal is open


    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        document.getElementById("search-box")?.focus();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedItems.length > 0) deleteSelected();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setExpiringSoon((prev) => !prev);
      }

      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAddModalOpen(true);
      }

      // 👇 Arrow navigation
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredInventory.length - 1 ? prev + 1 : prev
        );
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }

      // 👇 Enter = select/deselect medicine
      if (e.key === "Enter") {
        e.preventDefault();
        const current = filteredInventory[focusedIndex];
        if (current) toggleSelect(current._id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen, isEditModalOpen,selectedItems, filteredInventory, focusedIndex]);

  // ✅ Toggle single select
  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async (updated) => { try { const res = await axios.put("/api/medicines", updated); setInventory((prev) => prev.map((item) => (item._id === updated.id ? res.data : item)) ); } catch (err) { console.error("Update failed", err); } };


  const handleAdd = async (newMedicine) => { try { const res = await axios.post("/api/medicines", newMedicine); setInventory((prev) => [res.data, ...prev]); } catch (err) { console.error("Add failed", err); } };

  // ✅ Toggle all
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map((item) => item._id));
    }
  };

  // ✅ Bulk delete
  const deleteSelected = async () => {
    try {
      await axios.delete("/api/medicines", { data: { ids: selectedItems } });
      setInventory((prev) =>
        prev.filter((item) => !selectedItems.includes(item._id))
      );
      setSelectedItems([]);
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  // ✅ Highlight search
  const highlightText = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };



  return (
    <div className="p-4">
      {/* Search & Actions */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Medicines Inventory</h1>
        <div className="flex gap-3 flex-wrap">
          <Input
            id="search-box"
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Medicine
            </Button>
            <Button
              onClick={() => setExpiringSoon((p) => !p)}
              variant={expiringSoon ? "destructive" : "default"}
            >
              {expiringSoon ? "Showing Expiring Soon" : "Expiring Soon"}
            </Button>
            {selectedItems.length > 0 && (
              <Button
                onClick={deleteSelected}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete Selected (
                {selectedItems.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border p-2 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length === filteredInventory.length &&
                    filteredInventory.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-red-950">No</TableHead>
              <TableHead className="text-blue-600">Medicine Name</TableHead>
              <TableHead className="text-primary">(Generic)</TableHead>
              <TableHead className="text-primary">Category</TableHead>
              <TableHead className="text-green-500">Quantity</TableHead>
              <TableHead>TP</TableHead>
              <TableHead className="text-primary">MRP</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-primary text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6">
                  Loading medicines...
                </TableCell>
              </TableRow>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No medicines found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item, index) => (
                <TableRow
                  key={item._id}
                  className={
                    index === focusedIndex
                      ? "bg-gray-100 border-l-4 border-blue-500"
                      : ""
                  }
                >
                  <TableCell className='border' >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => toggleSelect(item._id)}
                    />
                  </TableCell>
                  <TableCell className="text-red-950 border">{index + 1}</TableCell>
                  <TableCell className="text-blue-600 border">
                    {highlightText(item.name, search)}
                  </TableCell>
                  <TableCell className="text-primary border">
                    {highlightText(item.generic, search)}
                  </TableCell>
                  <TableCell className="text-primary border">
                    {item.category ? highlightText(item.category, search) : "None"}
                  </TableCell>
                  <TableCell className="text-green-500 border">
                    {item.quantity}
                  </TableCell>
                  <TableCell>₨ {item.purchasePrice}</TableCell>
                  <TableCell className="text-primary border">
                    ₨ {item.sellingPrice}
                  </TableCell>
                  <TableCell
                    className={
                      new Date(item.expiry) < new Date()
                        ? "text-red-500 font-semibold border" 
                        : ""
                    }
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
                      <Edit className="h-4 w-4 text-blue-500 border" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteSelected(item._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500 border" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <EditMedicineModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        medicine={editingMedicine}
        onSave={handleSave}
      />
      <AddMedicineModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
      />
    </div>
  );
}
