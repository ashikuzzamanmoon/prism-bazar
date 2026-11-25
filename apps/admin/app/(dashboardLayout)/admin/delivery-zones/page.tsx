"use client";

import React, { useState } from "react";
import {
  useGetAllDeliveryZonesQuery,
  useCreateDeliveryZoneMutation,
  useUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
} from "@/redux/Api/deliveryZoneApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, MapPin, Truck, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface DeliveryZoneItem {
  id: string;
  name: string;
  area: string;
  deliveryCharge: number;
  estimatedTime?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function DeliveryZonesPage() {
  const { data, isLoading } = useGetAllDeliveryZonesQuery(undefined);
  const [createZone, { isLoading: isCreating }] = useCreateDeliveryZoneMutation();
  const [updateZone, { isLoading: isUpdating }] = useUpdateDeliveryZoneMutation();
  const [deleteZone, { isLoading: isDeleting }] = useDeleteDeliveryZoneMutation();

  const zones: DeliveryZoneItem[] = data?.data || data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZoneItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    area: "",
    deliveryCharge: 0,
    estimatedTime: "",
    isActive: true,
    sortOrder: 0,
  });

  const handleOpenCreate = () => {
    setEditingZone(null);
    setFormData({
      name: "",
      area: "",
      deliveryCharge: 60,
      estimatedTime: "১২-২৪ ঘণ্টা",
      isActive: true,
      sortOrder: zones.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone: DeliveryZoneItem) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      area: zone.area,
      deliveryCharge: Number(zone.deliveryCharge),
      estimatedTime: zone.estimatedTime || "",
      isActive: zone.isActive,
      sortOrder: zone.sortOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.area.trim()) {
      toast.error("নাম ও এলাকা পূরণ করা আবশ্যক!");
      return;
    }

    try {
      if (editingZone) {
        await updateZone({ id: editingZone.id, data: formData }).unwrap();
        toast.success("ডেলিভারি এলাকা সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await createZone(formData).unwrap();
        toast.success("নতুন ডেলিভারি এলাকা সফলভাবে যোগ করা হয়েছে!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "অপারেশন ব্যর্থ হয়েছে!");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`আপনি কি "${name}" ডেলিভারি এলাকা মুছে ফেলতে নিশ্চিত?`)) {
      return;
    }
    try {
      await deleteZone(id).unwrap();
      toast.success("ডেলিভারি এলাকা মুছে ফেলা হয়েছে!");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "ডিলিট ব্যর্থ হয়েছে!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> ডেলিভারি এলাকা ও চার্জ ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            সিরাজগঞ্জ, কাজিপুর ও অন্যান্য অঞ্চলের হোম ডেলিভারি জোন এবং ডেলিভারি চার্জ নির্ধারণ করুন।
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="h-4 w-4" /> নতুন ডেলিভারি এলাকা যোগ করুন
        </Button>
      </div>

      {/* Zones Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">ডাটা লোড হচ্ছে...</div>
        ) : zones.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p className="text-base font-semibold">কোনো ডেলিভারি এলাকা পাওয়া যায়নি</p>
            <p className="text-xs text-gray-400 mt-1">
              ডেলিভারি চার্জ নির্ধারণ করতে &quot;নতুন ডেলিভারি এলাকা যোগ করুন&quot; বাটনে ক্লিক করুন।
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-16">ক্রম</TableHead>
                <TableHead>এলাকার নাম (Name)</TableHead>
                <TableHead>আওতাধীন এলাকা (Area)</TableHead>
                <TableHead>ডেলিভারি চার্জ</TableHead>
                <TableHead>আনুমানিক সময়</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-mono text-gray-500">{zone.sortOrder}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{zone.name}</TableCell>
                  <TableCell className="text-gray-600 text-sm">{zone.area}</TableCell>
                  <TableCell className="font-bold text-primary">৳{Number(zone.deliveryCharge)}</TableCell>
                  <TableCell className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {zone.estimatedTime || "নির্ধারিত নয়"}
                  </TableCell>
                  <TableCell>
                    {zone.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">সক্রিয় (Active)</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400">নিষ্ক্রিয়</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(zone)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(zone.id, zone.name)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? "ডেলিভারি এলাকা সম্পাদনা" : "নতুন ডেলিভারি এলাকা যোগ করুন"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                এলাকার নাম (Name) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="যেমন: সিরাজগঞ্জ সদর"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                আওতাধীন এলাকা (Area) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="যেমন: সিরাজগঞ্জ পৌরসভা ও আশপাশের ইউনিয়ন"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ডেলিভারি চার্জ (টাকা) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.deliveryCharge}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryCharge: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ক্রম (Sort Order)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                আনুমানিক ডেলিভারি সময় (Estimated Time)
              </label>
              <Input
                value={formData.estimatedTime}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedTime: e.target.value })
                }
                placeholder="যেমন: ১২-২৪ ঘণ্টা"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <span className="text-sm font-medium text-gray-700">সক্রিয় স্ট্যাটাস (Active)</span>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isCreating || isUpdating ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
