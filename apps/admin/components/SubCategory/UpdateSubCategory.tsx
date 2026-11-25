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
import { useGetAllCategoryQuery } from "@/redux/Api/categoryApi";
import { ISubCategory } from "./ManageSubCategory";
import { cn } from "@/lib/utils";
import { useUpdateSubCategoryMutation } from "@/redux/Api/sub-categoryApi";
import { ICategory } from "../Category/ManageCategory";

export const updateSubCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  categoryIds: z.array(z.string()).optional(),
});

export type UpdateSubCategoryFormValues = z.infer<
  typeof updateSubCategorySchema
>;

interface UpdateSubCategoryProps {
  subCategoryData: ISubCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateSubCategory = ({
  subCategoryData,
  open,
  onOpenChange,
}: UpdateSubCategoryProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);

  const [updateSubCategory] = useUpdateSubCategoryMutation();
  const { data: fetchCategories, isLoading: isCategoriesLoading } =
    useGetAllCategoryQuery(undefined);

  const categories: ICategory[] = fetchCategories?.data || [];

  const form = useForm<UpdateSubCategoryFormValues>({
    resolver: zodResolver(updateSubCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      categoryIds: [],
    },
  });

  const nameValue = form.watch("name");

  // Load existing sub category data when dialog opens
  useEffect(() => {
    if (open && subCategoryData) {
      form.reset({
        name: subCategoryData.name || "",
        slug: subCategoryData.slug || "",
        categoryIds: subCategoryData.categories?.map((c) => c.id) || [],
      });

      // Pre-select categories that are already linked
      const preSelected: ICategory[] =
        subCategoryData.categories?.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          collections: [],
        })) || [];

      setSelectedCategories(preSelected);
    }
  }, [open, subCategoryData, form]);

  // Auto-regenerate slug only when name changes from original
  useEffect(() => {
    if (nameValue && nameValue !== subCategoryData.name) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  }, [nameValue, form, subCategoryData.name]);

  const handleToggleCategory = (category: ICategory) => {
    const isSelected = selectedCategories.some((c) => c.id === category.id);
    const updated = isSelected
      ? selectedCategories.filter((c) => c.id !== category.id)
      : [...selectedCategories, category];

    setSelectedCategories(updated);
    form.setValue(
      "categoryIds",
      updated.map((c) => c.id),
    );
  };

  const handleRemoveCategory = (id: string) => {
    const updated = selectedCategories.filter((c) => c.id !== id);
    setSelectedCategories(updated);
    form.setValue(
      "categoryIds",
      updated.map((c) => c.id),
    );
  };

  const handleSubmit = async (data: UpdateSubCategoryFormValues) => {
    setIsSubmitting(true);

    const toastId = toast.loading("Updating sub category...");

    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        categoryIds: data.categoryIds ?? [],
      };

      const response = await updateSubCategory({
        id: subCategoryData.id,
        data: payload,
      }).unwrap();

      if (response.statusCode === 200 || response.statusCode === 201) {
        onOpenChange(false);
        form.reset();
        setSelectedCategories([]);
        toast.success(
          response?.message || "Sub category updated successfully!",
          {
            id: toastId,
            duration: 1000,
          },
        );
      }
    } catch (error: any) {
      console.error("Error updating sub category:", error);
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update sub category",
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
          <DialogTitle>Update Sub Category</DialogTitle>
          <DialogDescription>
            Update the sub category details or change its linked categories.
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
                        placeholder="Enter sub category name"
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
                        placeholder="sub-category-slug"
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

              {/* Categories Multi-Select */}
              <FormField
                control={form.control}
                name="categoryIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>

                    {/* Selected category badges */}
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selectedCategories.map((cat) => (
                          <Badge
                            key={cat.id}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            <FolderOpen className="w-3 h-3" />
                            {cat.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(cat.id)}
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
                      open={categoryPopoverOpen}
                      onOpenChange={setCategoryPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            disabled={isSubmitting || isCategoriesLoading}
                            className={cn(
                              "w-full justify-between font-normal",
                              selectedCategories.length === 0 &&
                                "text-muted-foreground",
                            )}
                          >
                            {isCategoriesLoading
                              ? "Loading categories..."
                              : selectedCategories.length > 0
                                ? `${selectedCategories.length} categor${selectedCategories.length > 1 ? "ies" : "y"} selected`
                                : "Select categories"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--radix-popover-trigger-width) p-0"
                        align="start"
                      >
                        <ScrollArea className="max-h-56">
                          {categories.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                              No categories available.
                            </p>
                          ) : (
                            <div className="p-1">
                              {categories.map((cat) => {
                                const isSelected = selectedCategories.some(
                                  (c) => c.id === cat.id,
                                );
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleToggleCategory(cat)}
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
                                        {cat.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono truncate">
                                        {cat.slug}
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
                      Select one or more categories to link to this sub category
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
            Update Sub Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSubCategory;
