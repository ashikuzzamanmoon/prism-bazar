"use client";

import React, { useState } from "react";
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
import { useCreateContentMutation } from "@/redux/Api/contentApi";
import { Textarea } from "@/components/ui/textarea";

export const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  number: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().optional(),
  ),
  image: z.string().optional(),
});

export type ContentFormValues = z.infer<typeof contentSchema>;

const CreateContent = ({ refetch }: { refetch: () => void }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [createContent] = useCreateContentMutation();

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      number: "" as any,
      image: "",
    },
  });

  const handleSubmit = async (data: ContentFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Creating content...");

    try {
      if (selectedFile) {
        setIsUploading(true);
        const uploadedUrls = await fileUpload([selectedFile], "content");
        data.image = uploadedUrls[0];
        setIsUploading(false);
      }

      const response = await createContent(data).unwrap();

      if (response.statusCode === 200 || response.statusCode === 201) {
        setOpen(false);
        form.reset();
        setImagePreview("");
        setSelectedFile(null);
        toast.success(response?.message || "Content created successfully!", {
          id: toastId,
        });
        refetch();
      }
    } catch (error: any) {
      console.error("Error creating content:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to create content",
        { id: toastId },
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
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Content</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Content</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new content entry.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] max-h-[calc(90vh-200px)] pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                      id="content-image-upload"
                    />
                    {imagePreview ? (
                      <div className="relative w-40 h-40 border rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setSelectedFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() =>
                          document
                            .getElementById("content-image-upload")
                            ?.click()
                        }
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      >
                        <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Click to upload image
                        </p>
                      </div>
                    )}
                  </div>
                </FormControl>
              </FormItem>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter title"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter number"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        {...field}
                        disabled={isSubmitting}
                      />
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
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Create Content"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContent;
