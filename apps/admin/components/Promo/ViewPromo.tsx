"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tag,
  Hash,
  Percent,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Ticket,
} from "lucide-react";
import { IPromoCode } from "./ManagePromo";

interface ViewPromoProps {
  promoData: IPromoCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Info Card Component
const InfoCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number | null;
}) => (
  <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="p-2 rounded-md bg-gray-100">
      <Icon className="w-4 h-4 text-gray-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900 mt-1 wrap-break-word">
        {value || "—"}
      </p>
    </div>
  </div>
);

const ViewPromo = ({ promoData, open, onOpenChange }: ViewPromoProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getUsagePercentage = () => {
    return Math.round((promoData.usedCount / promoData.usageLimit) * 100);
  };

  const getRemainingUses = () => {
    return promoData.usageLimit - promoData.usedCount;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-175! mx-auto p-0 gap-0 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Promo Code Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Complete information about this promotional code
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Promo Code and Quick Info */}
            <div className="flex items-start justify-between gap-4 p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promo Code
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1 font-mono">
                  {promoData.code}
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <Hash className="w-3 h-3" />
                  <span>ID: {promoData.id.slice(0, 12)}...</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge
                  className={`${
                    promoData.isActive
                      ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-50"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-50"
                  } shrink-0`}
                >
                  {promoData.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge
                  className={`${
                    isExpired(promoData.expiresAt)
                      ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-50"
                      : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50"
                  } shrink-0`}
                >
                  {isExpired(promoData.expiresAt) ? "Expired" : "Valid"}
                </Badge>
              </div>
            </div>

            {/* Discount Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Discount Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  icon={Tag}
                  label="Discount Amount"
                  value={
                    promoData.type === "FLAT"
                      ? `৳${promoData.discount}`
                      : `${promoData.discount}%`
                  }
                />
                <InfoCard
                  icon={Percent}
                  label="Discount Type"
                  value={promoData.type}
                />
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Usage Statistics
              </h3>

              <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usage Progress</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {promoData.usedCount} / {promoData.usageLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      getUsagePercentage() >= 80
                        ? "bg-red-500"
                        : getUsagePercentage() >= 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${getUsagePercentage()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {getUsagePercentage()}% used • {getRemainingUses()} remaining
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <InfoCard
                  icon={TrendingUp}
                  label="Total Limit"
                  value={promoData.usageLimit}
                />
                <InfoCard
                  icon={Ticket}
                  label="Used Count"
                  value={promoData.usedCount}
                />
                <InfoCard
                  icon={Users}
                  label="Per User Limit"
                  value={promoData.perUserLimit}
                />
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Date & Time Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="p-2 rounded-md bg-red-50">
                    <Calendar className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires At
                    </p>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        isExpired(promoData.expiresAt)
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatDate(promoData.expiresAt)}
                    </p>
                  </div>
                  {isExpired(promoData.expiresAt) && (
                    <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50 shrink-0">
                      Expired
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InfoCard
                    icon={Clock}
                    label="Created At"
                    value={formatDate(promoData.createdAt)}
                  />
                  <InfoCard
                    icon={Clock}
                    label="Last Updated"
                    value={formatDate(promoData.updatedAt)}
                  />
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Status Summary
              </h3>
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Active Status</p>
                    <Badge
                      className={
                        promoData.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {promoData.isActive ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Validity</p>
                    <Badge
                      className={
                        isExpired(promoData.expiresAt)
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {isExpired(promoData.expiresAt)
                        ? "Expired"
                        : "Currently Valid"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={handleClose}
                className="bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewPromo;
