"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useCreateNewBrandMutation } from "@/redux/Api/brandApi";

export const brandSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  image: z.string().optional(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

const CreateBrand = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [createBrand] = useCreateNewBrandMutation();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      title: "",
      slug: "",
      image: "",
    },
  });

  const titleValue = form.watch("title");

  // Auto-generate slug from title
  useEffect(() => {
    if (titleValue) {
      const slug = titleValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  }, [titleValue, form]);

  const handleSubmit = async (data: BrandFormValues) => {
    setIsSubmitting(true);

    if (!selectedFile) {
      toast.error("Please upload a brand image!");
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading("Creating brand...");

    try {
      setIsUploading(true);
      const uploadedUrls = await fileUpload([selectedFile], "brand");
      data.image = uploadedUrls[0];

      const response = await createBrand(data).unwrap();

      if (response.statusCode === 200 || response.statusCode === 201) {
        setOpen(false);
        form.reset();
        setImagePreview("");
        setSelectedFile(null);
        toast.success(response?.message || "Brand created successfully!", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (error: any) {
      console.error("Error creating brand:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to create brand",
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

  const handleFileUpload = (file: File) => {
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Brand</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl lg:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Brand</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new brand.
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
                    <FormLabel>Title <span className=" text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter brand title"
                        {...field}
                        disabled={isSubmitting}
                        className=" py-6 shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug (Auto-generated) */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug <span className=" text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="auto-generated-slug"
                        {...field}
                        disabled={true}
                        className="bg-gray-50"
                      />
                    </FormControl>
                    <FormDescription>Auto-generated from title</FormDescription>
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
                    <FormLabel>Brand Image <span className=" text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                          id="brand-image-upload"
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
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
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
                            onClick={() =>
                              document
                                .getElementById("brand-image-upload")
                                ?.click()
                            }
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
            onClick={() => setOpen(false)}
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
            {isUploading ? "Uploading..." : "Create Brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBrand;
