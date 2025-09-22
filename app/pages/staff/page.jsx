"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useRouter } from "next/navigation";
import StaffHeader from "../../../component/StaffHeader";
import { Loader2 } from "lucide-react";
import axios from "axios";

export default function StaffPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState([]);


  // ✅ search input ref
  const searchRef = useRef(null);

  useEffect(() => {
    const savedStatus = localStorage.getItem("status");
    setStatus(savedStatus);
  }, []);

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
    if (status === "active") fetchMedicines();
  }, [status]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        const ids = items.map((i) => i._id);
        setSelectedMedicines(ids);
      } catch (err) {
        console.error("Failed to parse saved cart", err);
      }
    }
  }, []);

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.generic.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedMedicines((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCheckout = useCallback(() => {
    if (selectedMedicines.length === 0) {
      alert("No medicines selected!");
      return;
    }
    const soldItems = inventory.filter((item) =>
      selectedMedicines.includes(item._id)
    );
    localStorage.setItem("cartItems", JSON.stringify(soldItems));
    router.push("/pages/sales-transaction");
  }, [selectedMedicines, inventory, router]);

  const handleClear = useCallback(() => {
    localStorage.removeItem("cartItems");
    setSelectedMedicines([]);
  }, []);

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handleCheckout();
      }
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        handleClear();
      }
      // ✅ Ctrl + S → focus on search
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCheckout, handleClear]);

  const highlightText = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
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

  if (status === "inactive") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Your Account is NOT ACTIVE
        </h1>
        <p className="text-gray-700">Please contact admin to activate your account.</p>
      </div>
    );
  }

  return (
    <div>
      <StaffHeader />
      <div className="p-8 relative">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary">Sell Medicines</h1>
          <div className="flex items-center gap-4">
            {/* ✅ search input with ref + autofocus */}
            <Input
              ref={searchRef}
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 py-7 border-2 border-blue-950 placeholder:text-blue-950 text-2xl  "
              autoFocus
              tabIndex={1}
            />
            <div className="flex gap-3">
              <Button className="px-10 py-7" onClick={handleCheckout} tabIndex={2}>
                View Bill ({selectedMedicines.length})
              </Button>
              <Button
                className="px-6 py-7 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleClear}
                disabled={selectedMedicines.length === 0}
                tabIndex={3}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-md border p-2 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Medicine Name</TableHead>
                <TableHead>(Generic)</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Tp</TableHead>
                <TableHead>MRP</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Select</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    <Loader2 className="animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No medicines found!
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item, index) => (
                  <TableRow
                    key={item._id}
                    className={
                      item.quantity === 0
                        ? "bg-gray-100 opacity-50 pointer-events-none"
                        : ""
                    }
                  >
                    <TableCell className=" border " >{index + 1}</TableCell>
                    <TableCell className=" border ">{highlightText(item.name, search)}</TableCell>
                    <TableCell className=" border ">{highlightText(item.generic, search)}</TableCell>
                    <TableCell className=" border ">{item.category || "None"}</TableCell>
                    <TableCell
                      className={
                        item.quantity === 0 ? "text-red-600" : "text-green-500"
                      }
                    >
                      {item.quantity}
                    </TableCell>
                    <TableCell className=" border ">₨ {item.purchasePrice}</TableCell>
                    <TableCell className=" border ">₨ {item.sellingPrice}</TableCell>
                    <TableCell
                      className={
                        new Date(item.expiry) < new Date()
                          ? "text-red-500 font-semibold"
                          : ""
                      }
                    >
                      {new Date(item.expiry).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center border">
                      <Checkbox
                        className="border-2 border-blue-950"
                        disabled={item.quantity === 0}
                        checked={selectedMedicines.includes(item._id)}
                        onCheckedChange={() => toggleSelect(item._id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            toggleSelect(item._id);
                          }
                        }}
                        tabIndex={4 + index}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
