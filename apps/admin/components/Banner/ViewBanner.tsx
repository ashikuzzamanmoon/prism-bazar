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
  Calendar,
  Link2,
  FileType,
  CheckCircle,
  XCircle,
  Video,
  Image as ImageIcon,
  Clock,
  Hash,
  Info,
  Tag,
  ExternalLink,
} from "lucide-react";
import { IBanner } from "@/types/banner.type";
import Image from "next/image";

interface ViewBannerProps {
  bannerData: IBanner;
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

const ViewBanner = ({ bannerData, open, onOpenChange }: ViewBannerProps) => {
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
      <DialogContent className="max-w-2xl lg:max-w-2xl mx-auto p-0 gap-0 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Banner Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Complete information about this banner
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Media Preview Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Media Preview
              </h3>
              <div className="rounded-lg w-1/2 border overflow-hidden ">
                {bannerData.type === "IMAGE" && bannerData.image ? (
                  <div className="relative">
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-primary text-white border-0 px-3 py-1">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Image Banner
                      </Badge>
                    </div>
                    <div className="w-full relative">
                      <img
                        src={bannerData.image}
                        alt={bannerData.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : bannerData.type === "VIDEO" && bannerData.video ? (
                  <div className="relative">
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-primary text-white border-0 px-3 py-1">
                        <Video className="w-3 h-3 mr-1" />
                        Video Banner
                      </Badge>
                    </div>
                    <video
                      src={bannerData.video}
                      controls
                      className="w-full aspect-video bg-black"
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">
                        No media available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title and Quick Status */}
            <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </p>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">
                  {bannerData.title}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <StatusIndicator
                    active={bannerData.isPublish}
                    label="Published"
                  />
                  <StatusIndicator
                    active={bannerData.isSide}
                    label="Side Banner"
                  />
                  {/* <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Hash className="w-3 h-3" />
                    <span>ID: {bannerData.id.slice(0, 8)}</span>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Description */}
            {bannerData.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {bannerData.description}
                </p>
              </div>
            )}

            {/* Slug */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Slug / URL Path
              </h3>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Tag className="w-4 h-4 text-gray-500" />
                <code className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200 flex-1">
                  {bannerData.slug}
                </code>
              </div>
            </div>

            {/* Banner Information Grid */}
            {/* <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                Banner Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoCard
                  icon={FileType}
                  label="Type"
                  value={bannerData.type}
                />
                {bannerData.link && (
                  <InfoCard
                    icon={ExternalLink}
                    label="Link URL"
                    value={bannerData.link}
                  />
                )}
                {bannerData.type === "IMAGE" && bannerData.image && (
                  <InfoCard
                    icon={ImageIcon}
                    label="Image URL"
                    value={bannerData.image}
                  />
                )}
                {bannerData.type === "VIDEO" && bannerData.video && (
                  <InfoCard
                    icon={Video}
                    label="Video URL"
                    value={bannerData.video}
                  />
                )}
              </div>
            </div> */}

            {/* Modification */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Modification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bannerData.createdAt && (
                  <InfoCard
                    icon={Calendar}
                    label="Created At"
                    value={formatDate(bannerData.createdAt)}
                  />
                )}
                {bannerData.updatedAt && (
                  <InfoCard
                    icon={Clock}
                    label="Last Updated"
                    value={formatDate(bannerData.updatedAt)}
                  />
                )}
              </div>
            </div>

            {/* Additional Info */}
            {/* <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
              <Badge variant="outline" className="bg-white text-gray-600 border-gray-300">
                <Info className="w-3 h-3 mr-1" />
                Version: 1.0
              </Badge>
              {bannerData.isDelete && (
                <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                  Deleted
                </Badge>
              )}
            </div> */}
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

export default ViewBanner;
