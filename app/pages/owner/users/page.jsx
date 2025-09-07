"use client";

import { useEffect, useState } from "react";
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
import { cn } from "../../../../lib/utils";
import {
  Search,
  Edit,
  Lock,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";

import EditUserModal from "../../../../component/EditUserDialog";
import ChangePasswordModal from "../../../../component/ChangePasswordModal";
import axios from "axios";
export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [PasswordModel, SetPasswordModel] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/getuser");
      console.log(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggelstatus = (id) => {
    try {
      axios.post("/api/toggle-status", {
        id,
      });
      fetchUsers();
    } catch (err) {
      console.log(err);
      alert(err.response.data.error);
    }
  };

  return (
    <div className="flex  bg-gray-50">
      <main className="flex-1 p-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              User Management
            </h2>
            <p className="text-gray-500">
              Manage user roles, permissions, and account status.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            name="search"
            autoComplete="off"
            placeholder="Search users by name or email"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                // 🚀 When users are still loading
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <Loader2 className="mx-auto animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                // ✅ Show users
                filteredUsers.map((user, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-indigo-100 text-indigo-800"
                        )}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Edit button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Change password button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user); // ✅ store clicked user
                            SetPasswordModel(true); // ✅ open modal
                          }}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>

                        {/* Toggle status */}
                        {user.status === "inactive" ? (
                          <Button
                            onClick={() => toggelstatus(user._id)}
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                          >
                            <ToggleLeft className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => toggelstatus(user._id)}
                            variant="ghost"
                            size="icon"
                            className="text-green-600"
                          >
                            <ToggleRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // ❌ No users found for search
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    No user found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      <ChangePasswordModal
        open={PasswordModel}
        setOpen={SetPasswordModel}
        user={selectedUser} // ✅ pass user here
      />

      {/* ✅ Edit User Modal */}
      <EditUserModal
        open={open}
        setOpen={setOpen}
        user={selectedUser}
        fetchUsers={fetchUsers}
      />
    </div>
  );
}
