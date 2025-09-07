"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import axios from "axios"
export default function ChangePasswordModal({ open, setOpen,user }) {
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  
const handleUpdate = async () => {
  console.log(user)
    if (!newPassword) {
      alert("Please enter a new password")
      return
    }

    try {
      setLoading(true)
      const res = await axios.post("/api/changepassword", {
        id: user._id,            
        password: newPassword
      })

      if(res.status === 200){
              alert("Password updated successfully")
      setOpen(false)
      setNewPassword("") // reset field
      }

    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || "Error updating password")
    } finally {
      setLoading(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* New Password Only */}
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="text"
              autoComplete="off"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
        </div>

        {/* Buttons */}
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              {
                loading ? "Saving..." : "Save"
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
