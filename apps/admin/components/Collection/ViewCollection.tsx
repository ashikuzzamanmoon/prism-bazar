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
import { Calendar, Clock, Tag, Hash, CheckCircle, XCircle } from "lucide-react";
import { ICollection } from "./ManageCollection";

interface ViewCollectionProps {
  collectionData: ICollection;
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

// Status Indicator
const StatusIndicator = ({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`}
    />
    <span className="text-sm text-gray-600">{label}</span>
  </div>
);

const ViewCollection = ({
  collectionData,
  open,
  onOpenChange,
}: ViewCollectionProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl mx-auto p-0 gap-0 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Collection Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Complete information about this collection
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Title and Quick Status */}
            <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </p>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">
                  {collectionData.name}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <StatusIndicator
                    active={collectionData.isActive}
                    label="Active"
                  />
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Hash className="w-3 h-3" />
                    <span>ID: {collectionData.id.slice(0, 12)}...</span>
                  </div>
                </div>
              </div>
              <Badge
                className={
                  collectionData.isActive
                    ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-50"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }
              >
                {collectionData.isActive ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {collectionData.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Slug / URL Path */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Slug / URL Path
              </h3>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Tag className="w-4 h-4 text-gray-500" />
                <code className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200 flex-1">
                  {collectionData.slug}
                </code>
              </div>
            </div>

            {/* Modification */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Modification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {collectionData.createdAt && (
                  <InfoCard
                    icon={Calendar}
                    label="Created At"
                    value={formatDate(collectionData.createdAt)}
                  />
                )}
                {collectionData.updatedAt && (
                  <InfoCard
                    icon={Clock}
                    label="Last Updated"
                    value={formatDate(collectionData.updatedAt)}
                  />
                )}
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

export default ViewCollection;
