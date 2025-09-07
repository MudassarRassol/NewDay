"use client"

import { useState, useEffect } from "react"
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

export default function EditUserModal({ open, setOpen, user }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  // ✅ Sync state with props whenever `user` changes
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])


  const handleUpdate = async (id) => {
          setLoading(true)
    try{
      const response = await fetch(`/api/update`, {
        id,
        name,
        email
      })

      if (response.status === 200) {
        setOpen(false)
        alert("User updated successfully")
      }
    }
    catch(err){
      console.log(err)
      alert(err.response.data.error)
    }
    finally{
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        {/* Name */}
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user name"
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
        </div>

        {/* Buttons */}
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdate(user._id) }>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
