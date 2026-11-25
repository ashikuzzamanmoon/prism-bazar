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
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUpdateCollectionMutation } from "@/redux/Api/collectionApi";
import { ICollection } from "./ManageCollection";

export const updateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  isActive: z.boolean(),
});

export type UpdateCollectionFormValues = z.infer<typeof updateCollectionSchema>;

interface UpdateCollectionProps {
  collectionData: ICollection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateCollection = ({
  collectionData,
  open,
  onOpenChange,
}: UpdateCollectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateCollection] = useUpdateCollectionMutation();

  const form = useForm<UpdateCollectionFormValues>({
    resolver: zodResolver(updateCollectionSchema),
    defaultValues: {
      name: "",
      slug: "",
      isActive: true,
    },
  });

  const nameValue = form.watch("name");

  // Load existing collection data when dialog opens
  useEffect(() => {
    if (open && collectionData) {
      form.reset({
        name: collectionData.name || "",
        slug: collectionData.slug || "",
        isActive: collectionData.isActive ?? true,
      });
    }
  }, [open, collectionData, form]);

  // Auto-generate slug from name only if name has changed from original
  useEffect(() => {
    if (nameValue && nameValue !== collectionData.name) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  }, [nameValue, form, collectionData.name]);

  const handleSubmit = async (data: UpdateCollectionFormValues) => {
    setIsSubmitting(true);

    const toastId = toast.loading("Updating collection...");

    try {
      const response = await updateCollection({
        id: collectionData.id,
        data,
      }).unwrap();

      if (response.statusCode === 200 || response.statusCode === 201) {
        onOpenChange(false);
        form.reset();
        toast.success(response?.message || "Collection updated successfully!", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (error: any) {
      console.error("Error updating collection:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to update collection",
        {
          id: toastId,
          duration: 1000,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Collection</DialogTitle>
          <DialogDescription>
            Update the collection details. Edit the name, slug, or active
            status.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-180px)] pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name <span className=" text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter collection name"
                        {...field}
                        disabled={isSubmitting}
                        className=" py-6"
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
                        placeholder="collection-slug"
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

              {/* isActive Toggle */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Make this collection active and visible
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
            Update Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCollection;
