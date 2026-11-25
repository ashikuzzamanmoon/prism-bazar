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
import { Tag, Hash, Layers, FolderOpen } from "lucide-react";
import { ISubCategory } from "./ManageSubCategory";

interface ViewSubCategoryProps {
  subCategoryData: ISubCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewSubCategory = ({
  subCategoryData,
  open,
  onOpenChange,
}: ViewSubCategoryProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl mx-auto p-0 gap-0 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Sub Category Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Complete information about this sub category
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Name and Quick Info */}
            <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </p>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">
                  {subCategoryData.name}
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <Hash className="w-3 h-3" />
                  <span>ID: {subCategoryData.id.slice(0, 12)}...</span>
                </div>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 shrink-0">
                <Layers className="w-3 h-3 mr-1" />
                {subCategoryData.categories?.length ?? 0} Categor
                {subCategoryData.categories?.length !== 1 ? "ies" : "y"}
              </Badge>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Slug / URL Path
              </h3>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Tag className="w-4 h-4 text-gray-500" />
                <code className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200 flex-1">
                  {subCategoryData.slug}
                </code>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Linked Categories
              </h3>

              {subCategoryData.categories &&
              subCategoryData.categories.length > 0 ? (
                <div className="space-y-2">
                  {subCategoryData.categories.map((cat, index) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 shrink-0">
                        {index + 1}
                      </div>
                      <div className="p-2 rounded-md bg-gray-100 shrink-0">
                        <FolderOpen className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {cat.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <code className="text-xs font-mono text-gray-500">
                            {cat.slug}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                  <Layers className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No categories linked</p>
                </div>
              )}
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

export default ViewSubCategory;
