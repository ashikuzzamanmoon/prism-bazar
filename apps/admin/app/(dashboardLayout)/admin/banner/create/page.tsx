"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import SingleFileUploader from "@/utlits/FileUploader";
import { fileUpload } from "@/actions/file";
import { toast } from "sonner";
import { useCreateNewBannerMutation } from "@/redux/Api/bannerApi";
import { Upload, X, Video } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),
  description: z.string().optional(),
  link: z.string().optional().or(z.literal("")),
  type: z.enum(["Images_banner", "Video_banner"], {
    errorMap: () => ({ message: "Please select banner type" }),
  }),
  isPublish: z.boolean(),
});

type ContentFormData = z.infer<typeof formSchema>;

const CreateBanner = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBanner] = useCreateNewBannerMutation();

  const form = useForm<ContentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      link: "",
      type: undefined,
      isPublish: false,
    },
  });

  const bannerType = form.watch("type");

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const onTitleChange = (value: string) => {
    form.setValue("title", value);
    form.setValue("slug", generateSlug(value));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a video file");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video size should be less than 100MB");
        return;
      }

      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideoPreview(null);
    setVideoFile(null);
  };

  const onSubmit = async (values: ContentFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Creating banner...");

    try {
      let uploadedMedia: string | undefined;

      // Validate media based on type
      if (values.type === "Images_banner") {
        if (!imageFile) {
          toast.error("Featured image is required for image banner", {
            id: toastId,
          });
          setIsSubmitting(false);
          return;
        }

        // Upload image
        const uploadedUrls = await fileUpload(
          [imageFile],
          "prism-bazar/banner/images"
        );
        uploadedMedia = uploadedUrls[0];
        console.log("Uploaded image URL:", uploadedMedia);
      } else if (values.type === "Video_banner") {
        if (!videoFile) {
          toast.error("Video is required for video banner", { id: toastId });
          setIsSubmitting(false);
          return;
        }

        // Upload video
        const uploadedUrls = await fileUpload(
          [videoFile],
          "prism-bazar/banner/videos"
        );
        uploadedMedia = uploadedUrls[0];
        console.log("Uploaded video URL:", uploadedMedia);
      }

      if (!uploadedMedia) {
        toast.error("Media upload failed", { id: toastId });
        setIsSubmitting(false);
        return;
      }

      // Prepare form data
      const formData = {
        ...values,
        ...(values.type === "Images_banner"
          ? { image: uploadedMedia }
          : { video: uploadedMedia }),
      };
      // console.log("New Payload", formData);

      // Create banner
      const response = await createdBanner(formData).unwrap();
      console.log("Banner created:", response);

      if (response?.statusCode === 201) {
        toast.success("Banner created successfully", {
          id: toastId,
          duration: 2000,
        });
        form.reset();
        setImageFile(null);
        setVideoFile(null);
        setVideoPreview(null);
      } else {
        toast.error("Failed to create banner", { id: toastId, duration: 2000 });
      }
    } catch (error: any) {
      console.error("Error creating banner:", error);
      toast.error(error?.message || "Something went wrong", {
        id: toastId,
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-primary">Create Banner</CardTitle>
          <CardDescription>
            Fill in the details for your new banner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter banner title"
                        {...field}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="py-5"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug Field */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="banner-slug"
                        {...field}
                        className="py-5"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter banner description"
                        className="resize-none"
                        rows={3}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link Field */}
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (optional)</FormLabel>
                    <FormControl>
                      <Input
                        // type="url"
                        placeholder="https://example.com"
                        {...field}
                        className="py-5"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a valid URL for the banner link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Banner Type Selection */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Banner Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="py-5 w-full">
                          <SelectValue placeholder="Select banner type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Images_banner">
                          Image Banner
                        </SelectItem>
                        <SelectItem value="Video_banner">
                          Video Banner
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose whether this banner will display an image or video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Media Upload */}
              {bannerType === "Images_banner" && (
                <SingleFileUploader
                  file={imageFile}
                  setFile={setImageFile}
                  title="Featured Image"
                  required={true}
                  maxSizeInMB={10}
                  acceptedFileTypes={["image/*"]}
                  showPreview={true}
                  previewClassName="border border-amber-100"
                />
              )}

              {bannerType === "Video_banner" && (
                <FormField
                  control={form.control}
                  name="type"
                  render={() => (
                    <FormItem>
                      <FormLabel>Video File</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {videoPreview ? (
                            <div className="relative group">
                              <video
                                src={videoPreview}
                                controls
                                className="w-full h-48 object-cover rounded-lg border border-border"
                              />
                              <div className="absolute top-2 right-2 flex gap-2">
                                <label
                                  htmlFor="video-change"
                                  className="cursor-pointer"
                                >
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    asChild
                                  >
                                    <span>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Change
                                    </span>
                                  </Button>
                                </label>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={removeVideo}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                              <input
                                id="video-change"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleVideoUpload}
                              />
                            </div>
                          ) : (
                            <label
                              htmlFor="video-upload"
                              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Video className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload video
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  MP4, WebM, OGG up to 100MB
                                </p>
                              </div>
                              <input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleVideoUpload}
                              />
                            </label>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Publish Toggle */}
              <FormField
                control={form.control}
                name="isPublish"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publish</FormLabel>
                      <FormDescription>
                        Make this banner publicly visible
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

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !bannerType}
                >
                  {isSubmitting ? "Creating..." : "Create Banner"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setImageFile(null);
                    setVideoFile(null);
                    setVideoPreview(null);
                  }}
                  disabled={isSubmitting}
                >
                  Clear All
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBanner;
