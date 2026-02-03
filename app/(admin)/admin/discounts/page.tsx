"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    percentage: 10,
    maxUses: 100,
    isPublic: false,
    expiresAt: "",
  });

  const fetchDiscounts = () => {
    fetch("/api/admin/discounts")
      .then((res) => res.json())
      .then(setDiscounts);
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt
            ? new Date(formData.expiresAt)
            : undefined,
        }),
      });
      if (res.ok) {
        setIsOpen(false);
        fetchDiscounts();
        setFormData({
          code: "",
          percentage: 10,
          maxUses: 100,
          isPublic: false,
          expiresAt: "",
        });
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create discount");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Discounts</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. SUMMER2024"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentage: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUses: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                />
                <Label
                  htmlFor="isPublic"
                  className="font-normal cursor-pointer"
                >
                  Public (Show to everyone)
                </Label>
              </div>

              <DialogFooter>
                <Button type="submit">Create Discount</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.map((d) => (
            <TableRow key={d._id}>
              <TableCell className="font-mono font-medium">{d.code}</TableCell>
              <TableCell>
                <Badge variant={d.isPublic ? "outline" : "secondary"}>
                  {d.isPublic ? "Public" : "Private"}
                </Badge>
              </TableCell>
              <TableCell className="text-green-600 font-bold">
                {d.percentage}%
              </TableCell>
              <TableCell>
                {d.usedCount} / {d.maxUses}
              </TableCell>
              <TableCell>
                <Badge
                  variant={d.usedCount >= d.maxUses ? "destructive" : "default"}
                >
                  {d.usedCount >= d.maxUses ? "Exhausted" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                {d.expiresAt
                  ? new Date(d.expiresAt).toLocaleDateString()
                  : "Never"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
