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
import { cn } from "@/lib/utils";
import { ICollection } from "../Collection/ManageCollection";
import { useCreateNewCategoryMutation } from "@/redux/Api/categoryApi";
import { useGetAllCollectionsQuery } from "@/redux/Api/collectionApi";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  collectionIds: z.array(z.string()).optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

const CreateCategory = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionPopoverOpen, setCollectionPopoverOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<ICollection[]>(
    [],
  );

  const [createCategory] = useCreateNewCategoryMutation();
  const { data: fetchCollections, isLoading: isCollectionsLoading } =
    useGetAllCollectionsQuery({});

  const filterActiveCollections = (
    fetchCollections?.data?.data ||
    fetchCollections?.data ||
    []
  ).filter((c: ICollection) => c.isActive === true);
  const collections: ICollection[] = filterActiveCollections;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      collectionIds: [],
    },
  });

  const nameValue = form.watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  }, [nameValue, form]);

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

  const handleSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);

    const toastId = toast.loading("Creating category...");

    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        collectionIds: data.collectionIds ?? [],
      };

      const response = await createCategory(payload).unwrap();

      if (response.statusCode === 200 || response.statusCode === 201) {
        setOpen(false);
        form.reset();
        setSelectedCollections([]);
        toast.success(response?.message || "Category created successfully!", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to create category",
        { id: toastId, duration: 1000 },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      form.reset();
      setSelectedCollections([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Create Category</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl! max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new category.
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
                        placeholder="Enter category name"
                        {...field}
                        disabled={isSubmitting}
                        className=" py-6"
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
                    <FormDescription>Auto-generated from name</FormDescription>
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
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
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
                              No collections available.
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
            onClick={() => handleOpenChange(false)}
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
            Create Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategory;
