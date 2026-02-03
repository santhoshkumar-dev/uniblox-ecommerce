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

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/discounts")
      .then((res) => res.json())
      .then(setDiscounts);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Generated Discounts</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Percentage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Used By</TableHead>
            <TableHead>Expires At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.map((d) => (
            <TableRow key={d._id}>
              <TableCell className="font-mono">{d.code}</TableCell>
              <TableCell>{d.percentage}%</TableCell>
              <TableCell>
                <Badge variant={d.isUsed ? "secondary" : "default"}>
                  {d.isUsed ? "Used" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>{d.usedBy || "-"}</TableCell>
              <TableCell>
                {new Date(d.expiresAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
