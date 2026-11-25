"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { IContent } from "./ManageContent";

const ViewContent = ({
  isOpen,
  onClose,
  content,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: IContent | null;
}) => {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Content Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-4">
          <div className="space-y-6">
            {content.image && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image
                  src={content.image}
                  alt={content.title}
                  fill
                  className="object-contain bg-gray-50"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Title</p>
                <p className="text-base text-gray-900">{content.title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Number</p>
                <p className="text-base text-gray-900">{content.number ?? "—"}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {content.description || "No description provided."}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-base text-gray-900">
                  {new Date(content.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Updated At</p>
                <p className="text-base text-gray-900">
                  {new Date(content.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ViewContent;
