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
  TableFooter,
} from "../../../../components/ui/table";
import { Edit, Trash2, DollarSign, Percent, TrendingUp, Layers, ChevronUp, ChevronDown, Search, RefreshCw, FileText } from "lucide-react";
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
  const [barCollapsed, setBarCollapsed] = useState(false);

  // Date filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  // Export filtered results to CSV (only matched items when search is used)
  const exportCSV = () => {
    if (!filteredHistory || filteredHistory.length === 0) return;
    const rows = [
      ["Date","Order ID","Item","Quantity","Price/Unit","Total","Service","Discount","Final Total","Item Profit"],
    ];

    filteredHistory.forEach((rec) => {
      const date = new Date(rec.createdAt).toLocaleDateString();
      // Only include items that match the current search (if search empty, include all)
      const matchedItems = rec.items.filter((i) =>
        !search || i.name.toLowerCase().includes(search.toLowerCase())
      );
      if (matchedItems.length === 0) return;

      const service = Number(rec.service ?? rec.items[0]?.service ?? 0).toFixed(2);
      const discount = Number(rec.discount ?? 0).toFixed(2);
      const finalTotal = Number(rec.finalTotal ?? 0).toFixed(2);

      matchedItems.forEach((i) => {
        const qty = Number(i.quantity || 0);
        const unit = Number(i.sellingPrice || 0).toFixed(2);
        const total = Number(i.totalAmount || qty * Number(unit)).toFixed(2);
        const profit = (
          (Number(i.sellingPrice || 0) - Number(i.medicineId?.purchasePrice ?? 0)) * qty
        ).toFixed(2);

        rows.push([date, rec._id, i.name, qty, unit, total, service, discount, finalTotal, profit]);
      });
    });

    const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ✅ Fetch history
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/history");
      setHistory(res.data);
      console.log(res);
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

  // ✅ Total Quantity Sold
  const totalQuantity = filteredHistory.reduce((sum, record) => {
    return (
      sum +
      record.items.reduce(
        (itemSum, item) => itemSum + Number(item.quantity || 0),
        0
      )
    );
  }, 0);

  // ✅ Total Sales (Revenue)
  const totalSales = filteredHistory.reduce((sum, record) => {
    return (
      sum +
      record.items.reduce((itemSum, item) => {
        const selling = Number(item.sellingPrice || 0);
        const qty = Number(item.quantity || 0);
        return itemSum + selling * qty;
      }, 0)
    );
  }, 0);

  // ✅ Total Cost of All Items
  const totalCost = filteredHistory.reduce((sum, record) => {
    return (
      sum +
      record.items.reduce((itemSum, item) => {
        const purchase = Number(item.medicineId?.purchasePrice ?? 0);
        const qty = Number(item.quantity || 0);
        return itemSum + purchase * qty;
      }, 0)
    );
  }, 0);

  // ✅ Total Service Charges (SC)
  const totalService = filteredHistory.reduce((sum, record) => {
    // service may be stored on the record or on the first item
    const sc = Number(record.service ?? record.items[0]?.service ?? 0);
    return sum + sc;
  }, 0);

  // ✅ Total Discount
  const totalDiscount = filteredHistory.reduce((sum, record) => {
    return sum + Number(record.discount ?? 0);
  }, 0);

  // ✅ Total Final Amount (after discounts + service)
  const totalFinal = filteredHistory.reduce((sum, record) => {
    return sum + Number(record.finalTotal ?? 0);
  }, 0);

  // ✅ Total Profit = Final Total - Total Cost
  const totalProfit = totalFinal - totalCost;

  return (
    <div className="p-4 pb-32">
      <h1 className="text-3xl font-bold mb-4 text-primary">Sales History</h1>

      {/* 🔹 Search + Date Filters (card) */}
      <div className="flex items-center gap-4 mb-4 bg-white rounded-md shadow-sm border px-4 py-3">
        <div className="flex items-center gap-2 w-full max-w-md">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by medicine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
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
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={resetFilters} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </Button>

          <Button onClick={exportCSV} size="sm">
            <FileText className="w-4 h-4 mr-2" /> Export CSV
          </Button>

          {selectedRecords.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedRecords.length})
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-md border border-gray-400 shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-white">
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>No</TableHead>
              <TableHead>Medicine</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price/Unit (₨)</TableHead>
              <TableHead className="text-right">Total (₨)</TableHead>
              <TableHead className="text-right">SC (₨)</TableHead>
              <TableHead className="text-right">Discount (₨)</TableHead>
              <TableHead className="text-right">Final Total (₨)</TableHead>

              <TableHead>Date</TableHead>
              <TableHead className="text-right">Profit (₨)</TableHead>
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
                          <TableCell

                            className="border"
                            rowSpan={record.items.length}
                          >
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
                      <TableCell className="border">{item.name}</TableCell>
                      <TableCell className="text-right border">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right border">
                        ₨ {item.sellingPrice}{" "}
                        {item.medicineId?.purchasePrice
                          ? `(Cost: ₨ ${item.medicineId.purchasePrice})`
                          : ""}
                      </TableCell>
                      <TableCell className="text-right border">
                        ₨ {item.totalAmount.toFixed(2)}
                      </TableCell>
                      {itemIdx === 0 && (
                        <TableCell
                          rowSpan={record.items.length}
                          className="text-right border"
                        >
                          ₨ {typeof record.service !== 'undefined' ? record.service : (record.items[0]?.service ?? 0)}
                        </TableCell>
                      )}

                      {itemIdx === 0 && (
                        <>
                          <TableCell
                            rowSpan={record.items.length}
                            className="text-right border"
                          >
                            ₨ {record.discount}
                          </TableCell>
                          <TableCell
                            rowSpan={record.items.length}
                            className="text-right border"
                          >
                            ₨ {record.finalTotal.toFixed(2)}
                          </TableCell>
                          <TableCell
                            className="border"
                            rowSpan={record.items.length}
                          >
                            {new Date(record.createdAt).toLocaleDateString()}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-right border">
                        ₨ {profit.toFixed(2)}
                      </TableCell>
                      {itemIdx === 0 && (
                        <>
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


          </TableBody>

          {filteredHistory.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="border text-center">
                  <div className="text-xs text-gray-600">Total Quantity Sold</div>
                  <div className="font-bold text-lg">{totalQuantity}</div>
                </TableCell>

                <TableCell colSpan={3} className="border text-center">
                  <div className="text-xs text-gray-600">Total Sales</div>
                  <div className="font-bold text-lg">₨ {totalSales.toFixed(2)}</div>
                </TableCell>

                <TableCell className="border text-center">
                  <div className="text-xs text-gray-600">Total SC</div>
                  <div className="font-bold text-lg">₨ {totalService.toFixed(2)}</div>
                </TableCell>

                <TableCell className="border text-center">
                  <div className="text-xs text-gray-600">Discount</div>
                  <div className="font-bold text-lg">₨ {totalDiscount.toFixed(2)}</div>
                </TableCell>

                <TableCell colSpan={2} className="border text-center bg-yellow-50">
                  <div className="text-xs text-gray-600">Final Total</div>
                  <div className="font-bold text-lg text-yellow-700">₨ {totalFinal.toFixed(2)}</div>
                </TableCell>

                <TableCell colSpan={2} className="border text-center">
                  <div className="text-xs text-gray-600">Net Profit</div>
                  <div className="text-xs text-gray-500">Item Profit + SC − Discount</div>
                  <div className="font-bold text-lg text-green-600">₨ {totalProfit.toFixed(2)}</div>
                </TableCell>


              </TableRow>
            </TableFooter>
          )}

        </Table>
      </div>

      {/* 🔔 Sticky summary bar - stays visible at bottom with improved UI */}
      <div className="sticky bottom-4 z-50 px-4">
        <div className="max-w-full mx-auto">
          <div
            className={`bg-white border rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
              barCollapsed ? "max-h-14" : "max-h-60"
            }`}
          >
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">Sales Summary</div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md text-sm">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <div className="text-gray-500">Qty</div>
                    <div className="font-semibold"> {totalQuantity}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <div className="text-gray-500">Sales</div>
                    <div className="font-semibold">₨ {totalSales.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={barCollapsed ? "Expand summary" : "Collapse summary"}
                  onClick={() => setBarCollapsed((s) => !s)}
                >
                  {barCollapsed ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className={`p-3 border-t ${barCollapsed ? "hidden" : "flex flex-wrap gap-3 items-center"}`}>
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <div className="text-gray-500">Total SC</div>
                <div className="font-medium">₨ {totalService.toFixed(2)}</div>
              </div>

              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm flex items-center gap-2">
                <Percent className="w-4 h-4 text-gray-600" />
                <div className="text-gray-500">Discount</div>
                <div className="font-medium">₨ {totalDiscount.toFixed(2)}</div>
              </div>


              <div className="rounded-md bg-green-50 px-3 py-2 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <div className="flex flex-col">
                  <div className="text-green-600 font-semibold">Final Profit</div>
                  <div className="text-xs text-gray-500">Shows earnings after SC and discount</div>
                </div>
                <div className="font-bold text-green-700">₨ {totalProfit.toFixed(2)}</div>
              </div>

            </div>
          </div>
        </div>
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
