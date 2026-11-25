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
import { useCreateNewBannerMutation } from "@/redux/Api/bannerApi";
import Image from "next/image";

export const bannerSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO"]),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  video: z.string().url("Please enter a valid video URL").optional().or(z.literal("")),
  link: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      "Please enter a valid URL",
    ),
  isPublish: z.boolean(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;

const CreateBanner = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [createBanner] = useCreateNewBannerMutation();

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
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

  // Auto-generate slug from title
  useEffect(() => {
    if (titleValue) {
      const slug = titleValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
      form.setValue("slug", slug);
    }
  }, [titleValue, form]);

  const handleSubmit = async (data: BannerFormValues) => {
    setIsSubmitting(true);

    console.log('Creating banner with data:', data);

    // Validation: IMAGE type must have image
    if (data.type === "IMAGE" && !selectedFile) {
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

    const toastId = toast.loading("Creating banner...");

    try {
      // Upload image if type is IMAGE
      if (data.type === "IMAGE" && selectedFile) {
        setIsUploading(true);
        const uploadedUrls = await fileUpload([selectedFile], "banner");
        data.image = uploadedUrls[0];
        data.video = "";
      } else {
        // If type is VIDEO, clear image field
        data.image = "";
      }

      const response = await createBanner(data).unwrap();

      console.log('Banner creation response:', response);

      if (response.statusCode === 200 || response.statusCode === 201) {
        setOpen(false);
        form.reset();
        setImagePreview("");
        setSelectedFile(null);
        toast.success(response?.message || "Banner created successfully!", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (error: any) {
      console.error("Error creating banner:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to create banner",
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

  const handleTypeChange = (value: string) => {
    form.setValue("type", value as "IMAGE" | "VIDEO");
    // Clear media when type changes
    form.setValue("image", "");
    form.setValue("video", "");
    setImagePreview("");
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Banner</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl lg:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Banner</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new banner.
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
                    <FormLabel>Banner Type <span className=" text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={handleTypeChange}
                      defaultValue={field.value}
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
                    <FormLabel>Title <span className=" text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter banner title"
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
                    <FormLabel>Slug *</FormLabel>
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
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                            id="image-upload"
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
                                document.getElementById("image-upload")?.click()
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
                      <FormLabel className="text-base">Publish Status</FormLabel>
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
            {isUploading ? "Uploading..." : "Create Banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBanner;