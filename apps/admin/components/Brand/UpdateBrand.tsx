"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fileUpload } from "@/actions/file";
import Image from "next/image";
import { IBrand } from "./ManageBrands";
import { useUpdateBrandMutation } from "@/redux/Api/brandApi";

export const updateBrandSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  image: z.string().optional(),
});

export type UpdateBrandFormValues = z.infer<typeof updateBrandSchema>;

interface UpdateBrandProps {
  brandData: IBrand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateBrand = ({ brandData, open, onOpenChange }: UpdateBrandProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateBrand] = useUpdateBrandMutation();

  const form = useForm<UpdateBrandFormValues>({
    resolver: zodResolver(updateBrandSchema),
    defaultValues: {
      title: "",
      slug: "",
      image: "",
    },
  });

  const titleValue = form.watch("title");

  // Load existing brand data when dialog opens
  useEffect(() => {
    if (open && brandData) {
      form.reset({
        title: brandData.title || "",
        slug: brandData.slug || "",
        image: brandData.image || "",
      });

      if (brandData.image) {
        setImagePreview(brandData.image);
      } else {
        setImagePreview("");
      }

      setSelectedFile(null);
      setHasImageChanged(false);
    }
  }, [open, brandData, form]);

  // Auto-generate slug from title (only if title changes)
  useEffect(() => {
    if (titleValue && titleValue !== brandData.title) {
      const slug = titleValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  }, [titleValue, form, brandData.title]);

  const handleSubmit = async (data: UpdateBrandFormValues) => {
    setIsSubmitting(true);

    if (!data.image && !selectedFile) {
      toast.error("Please upload a brand image!");
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading("Updating brand...");

    try {
      // Upload new image if changed
      if (hasImageChanged && selectedFile) {
        setIsUploading(true);
        const uploadedUrls = await fileUpload([selectedFile], "brand");
        data.image = uploadedUrls[0];
      }

      const response = await updateBrand({
        id: brandData.id,
        data: data,
      }).unwrap();

      if (response.statusCode === 200 || response.statusCode === 201) {
        onOpenChange(false);
        form.reset();
        setImagePreview("");
        setSelectedFile(null);
        setHasImageChanged(false);
        toast.success(response?.message || "Brand updated successfully!", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (error: any) {
      console.error("Error updating brand:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to update brand",
        {
          id: toastId,
          duration: 1000,
        },
      );
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setHasImageChanged(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        form.clearErrors("image");
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
      };

      reader.readAsDataURL(file);
    },
    [form],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
      e.target.value = "";
    },
    [handleFileUpload],
  );

  const handleRemoveImage = useCallback(() => {
    setImagePreview(brandData.image || "");
    setSelectedFile(null);
    setHasImageChanged(false);
    form.setValue("image", brandData.image || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [form, brandData.image]);

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl lg:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Update Brand</DialogTitle>
          <DialogDescription>
            Update the brand details. You can change any field or upload a new
            image.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-180px)] pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter brand title"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="brand-slug"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      You can edit the slug manually
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Brand Image *</FormLabel>
                    <FormControl>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                          disabled={isSubmitting}
                        />

                        {imagePreview ? (
                          <div className="relative w-1/2 md:w-1/3 lg:w-1/4 mt-2 rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              width={250}
                              height={250}
                              className="w-auto h-auto object-cover"
                            />
                            {!isSubmitting && (
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleClickUpload}
                                  className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors"
                                  title="Change image"
                                >
                                  <Upload className="h-4 w-4" />
                                </button>
                                {hasImageChanged && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                                    title="Reset to original"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            )}
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-white text-center">
                                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                  <p className="text-sm">Uploading...</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleClickUpload}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging
                                ? "border-primary bg-primary/5"
                                : "border-gray-300 hover:border-primary"
                              }`}
                          >
                            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-sm font-medium mb-1">
                              Drop your image here or click to browse
                            </p>
                            <p className="text-xs text-gray-500">
                              Supports: JPG, PNG, GIF, WebP (Max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Update Brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBrand;
