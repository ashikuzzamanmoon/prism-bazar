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
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X, ImageIcon, Video } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fileUpload } from "@/actions/file";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBannerMutation } from "@/redux/Api/bannerApi";
import Image from "next/image";
import { IBanner } from "@/types/banner.type";

export const updateBannerSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO"]),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  video: z
    .string()
    .url("Please enter a valid video URL")
    .optional()
    .or(z.literal("")),
  link: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      "Please enter a valid URL",
    ),
  isPublish: z.boolean(),
});

export type UpdateBannerFormValues = z.infer<typeof updateBannerSchema>;

interface UpdateBannerProps {
  bannerData: IBanner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateBanner = ({
  bannerData,
  open,
  onOpenChange,
}: UpdateBannerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateBanner] = useUpdateBannerMutation();

  const form = useForm<UpdateBannerFormValues>({
    resolver: zodResolver(updateBannerSchema),
    defaultValues: {
      type: "IMAGE",
      title: "",
      slug: "",
      description: "",
      image: "",
      video: "",
      link: "",
      isPublish: false,
    },
  });

  const bannerType = form.watch("type");
  const titleValue = form.watch("title");

  // Load existing banner data when dialog opens
  useEffect(() => {
    if (open && bannerData) {
      const bannerType: "IMAGE" | "VIDEO" =
        bannerData.type === "IMAGE" || bannerData.type === "VIDEO"
          ? (bannerData.type as "IMAGE" | "VIDEO")
          : "IMAGE";

      form.reset({
        type: bannerType,
        title: bannerData.title || "",
        slug: bannerData.slug || "",
        description: bannerData.description || "",
        image: bannerData.image || "",
        video: bannerData.video || "",
        link: bannerData.link || "",
        isPublish: bannerData.isPublish || false,
      });

      // Set image preview for IMAGE type
      if (bannerData.type === "IMAGE" && bannerData.image) {
        setImagePreview(bannerData.image);
      } else {
        setImagePreview("");
      }

      setSelectedFile(null);
      setHasImageChanged(false);
    }
  }, [open, bannerData, form]);

  // Auto-generate slug from title (only if title changes)
  useEffect(() => {
    if (titleValue && titleValue !== bannerData.title) {
      const slug = titleValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  }, [titleValue, form, bannerData.title]);

  const handleSubmit = async (data: UpdateBannerFormValues) => {
    setIsSubmitting(true);

    console.log("Updating banner with data:", data);

    // Validation: IMAGE type must have image (either existing or new)
    if (data.type === "IMAGE" && !data.image && !selectedFile) {
      toast.error("Please upload an image!");
      setIsSubmitting(false);
      return;
    }

    // Validation: VIDEO type must have video URL
    if (data.type === "VIDEO" && !data.video) {
      toast.error("Please enter a video URL!");
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading("Updating banner...");

    try {
      // Upload new image if changed
      if (data.type === "IMAGE" && hasImageChanged && selectedFile) {
        setIsUploading(true);
        const uploadedUrls = await fileUpload([selectedFile], "banner");
        data.image = uploadedUrls[0];
        data.video = "";
      } else if (data.type === "VIDEO") {
        // If type is VIDEO, clear image field
        data.image = "";
      }

      const response = await updateBanner({
        id: bannerData.id,
        data: data,
      }).unwrap();

      console.log("Banner update response:", response);

      if (response.statusCode === 200 || response.statusCode === 201) {
        onOpenChange(false);
        form.reset();
        setImagePreview("");
        setSelectedFile(null);
        setHasImageChanged(false);
        toast.success(response?.message || "Banner updated successfully!", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (error: any) {
      console.error("Error updating banner:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to update banner",
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
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setHasImageChanged(true);

      // Preview
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
    // Reset to original image
    setImagePreview(bannerData.image || "");
    setSelectedFile(null);
    setHasImageChanged(false);
    form.setValue("image", bannerData.image || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [form, bannerData.image]);

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleTypeChange = useCallback(
    (value: string) => {
      form.setValue("type", value as "IMAGE" | "VIDEO");
      // When changing type, reset media fields
      if (value === "IMAGE") {
        form.setValue("video", "");
        // Restore original image if exists
        if (bannerData.image) {
          setImagePreview(bannerData.image);
          form.setValue("image", bannerData.image);
        }
      } else {
        form.setValue("image", "");
        setImagePreview("");
        setSelectedFile(null);
        // Restore original video URL if exists
        if (bannerData.video) {
          form.setValue("video", bannerData.video);
        }
      }
      setHasImageChanged(false);
    },
    [form, bannerData],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl lg:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Update Banner</DialogTitle>
          <DialogDescription>
            Update the banner details. You can change any field or upload a new
            image.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-180px)] pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Banner Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Type *</FormLabel>
                    <Select
                      onValueChange={handleTypeChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className=" w-full py-5">
                          <SelectValue placeholder="Select banner type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IMAGE">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Image Banner
                          </div>
                        </SelectItem>
                        <SelectItem value="VIDEO">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Banner
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter banner title"
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
                        placeholder="banner-slug"
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

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter banner description"
                        {...field}
                        disabled={isSubmitting}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional: Image Upload or Video URL */}
              {bannerType === "IMAGE" ? (
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Banner Image *</FormLabel>
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
                            <div className="relative  w-full  flex justify-center items-center p-2 mt-2 rounded-lg overflow-hidden border-2 border-gray-200">
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
              ) : (
                <FormField
                  control={form.control}
                  name="video"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/video.mp4"
                          type="url"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the full URL of the video
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Link */}
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/category/smartphones"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional link for banner click
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* isPublish Toggle */}
              <FormField
                control={form.control}
                name="isPublish"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Publish Status
                      </FormLabel>
                      <FormDescription>
                        Make this banner visible to users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
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
            {isUploading ? "Uploading..." : "Update Banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBanner;
