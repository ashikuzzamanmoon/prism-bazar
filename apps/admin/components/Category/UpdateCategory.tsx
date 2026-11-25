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
import { Badge } from "@/components/ui/badge";
import { Loader2, X, FolderOpen, ChevronsUpDown, Check } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetAllCollectionsQuery } from "@/redux/Api/collectionApi";
// import { ICategory } from "@/types/category.type";
import { cn } from "@/lib/utils";
import { ICollection } from "../Collection/ManageCollection";
import { useUpdateCategoryMutation } from "@/redux/Api/categoryApi";
import { ICategory } from "./ManageCategory";

// interface

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  collectionIds: z.array(z.string()).optional(),
});

export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;

interface UpdateCategoryProps {
  categoryData: ICategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateCategory = ({
  categoryData,
  open,
  onOpenChange,
}: UpdateCategoryProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionPopoverOpen, setCollectionPopoverOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<ICollection[]>(
    [],
  );

  const [updateCategory] = useUpdateCategoryMutation();
  const { data: fetchCollections, isLoading: isCollectionsLoading } =
    useGetAllCollectionsQuery({});

  console.log("fetch collections", fetchCollections?.data?.data);

  const filterActiveCollections = (
    fetchCollections?.data?.data ||
    fetchCollections?.data ||
    fetchCollections ||
    []
  ).filter((c: ICollection) => c.isActive === true);
  const collections: ICollection[] = filterActiveCollections;

  const form = useForm<UpdateCategoryFormValues>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      collectionIds: [],
    },
  });

  const nameValue = form.watch("name");

  // Load existing category data when dialog opens
  useEffect(() => {
    if (open && categoryData) {
      form.reset({
        name: categoryData.name || "",
        slug: categoryData.slug || "",
        collectionIds: categoryData.collections?.map((c) => c.id) || [],
      });

      // Pre-select collections that are already linked
      // Match from the full active collections list + existing linked ones
      const preSelected: ICollection[] =
        categoryData.collections?.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          isActive: true,
          isHomeShow: false,
          isDelete: false,
          createdAt: "",
          updatedAt: "",
        })) || [];

      setSelectedCollections(preSelected);
    }
  }, [open, categoryData, form]);

  // Auto-regenerate slug only when name changes from original
  useEffect(() => {
    if (nameValue && nameValue !== categoryData.name) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  }, [nameValue, form, categoryData.name]);

  const handleToggleCollection = (collection: ICollection) => {
    const isSelected = selectedCollections.some((c) => c.id === collection.id);
    const updated = isSelected
      ? selectedCollections.filter((c) => c.id !== collection.id)
      : [...selectedCollections, collection];

    setSelectedCollections(updated);
    form.setValue(
      "collectionIds",
      updated.map((c) => c.id),
    );
  };

  const handleRemoveCollection = (id: string) => {
    const updated = selectedCollections.filter((c) => c.id !== id);
    setSelectedCollections(updated);
    form.setValue(
      "collectionIds",
      updated.map((c) => c.id),
    );
  };

  const handleSubmit = async (data: UpdateCategoryFormValues) => {
    setIsSubmitting(true);

    const toastId = toast.loading("Updating category...");

    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        collectionIds: data.collectionIds ?? [],
      };

      const response = await updateCategory({
        id: categoryData.id,
        data: payload,
      }).unwrap();

      if (response.statusCode === 200 || response.statusCode === 201) {
        onOpenChange(false);
        form.reset();
        setSelectedCollections([]);
        toast.success(response?.message || "Category updated successfully!", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to update category",
        { id: toastId, duration: 1000 },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Category</DialogTitle>
          <DialogDescription>
            Update the category details or change its linked collections.
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
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter category name"
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
                        placeholder="category-slug"
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

              {/* Collections Multi-Select */}
              <FormField
                control={form.control}
                name="collectionIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Collections</FormLabel>

                    {/* Selected collection badges */}
                    {selectedCollections.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selectedCollections.map((col) => (
                          <Badge
                            key={col.id}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            <FolderOpen className="w-3 h-3" />
                            {col.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveCollection(col.id)}
                              className="ml-1 rounded-full hover:bg-gray-300 p-0.5 transition-colors"
                              disabled={isSubmitting}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Popover
                      open={collectionPopoverOpen}
                      onOpenChange={setCollectionPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            disabled={isSubmitting || isCollectionsLoading}
                            className={cn(
                              "w-full justify-between font-normal",
                              selectedCollections.length === 0 &&
                                "text-muted-foreground",
                            )}
                          >
                            {isCollectionsLoading
                              ? "Loading collections..."
                              : selectedCollections.length > 0
                                ? `${selectedCollections.length} collection${selectedCollections.length > 1 ? "s" : ""} selected`
                                : "Select collections"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--radix-popover-trigger-width) p-0"
                        align="start"
                      >
                        <ScrollArea className="max-h-auto">
                          {collections.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                              No active collections available.
                            </p>
                          ) : (
                            <div className="p-1">
                              {collections.map((col) => {
                                const isSelected = selectedCollections.some(
                                  (c) => c.id === col.id,
                                );
                                return (
                                  <button
                                    key={col.id}
                                    type="button"
                                    onClick={() => handleToggleCollection(col)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors"
                                  >
                                    <div
                                      className={cn(
                                        "flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors",
                                        isSelected
                                          ? "bg-primary border-primary"
                                          : "border-gray-300",
                                      )}
                                    >
                                      {isSelected && (
                                        <Check className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    <FolderOpen className="w-4 h-4 text-gray-500 shrink-0" />
                                    <div className="flex-1 text-left min-w-0">
                                      <p className="font-medium truncate">
                                        {col.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono truncate">
                                        {col.slug}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>

                    <FormDescription>
                      Select one or more collections to link to this category
                    </FormDescription>
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
            Update Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCategory;
