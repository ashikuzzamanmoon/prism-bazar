"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import SingleFileUpload from "@/components/Common/SingleFileUpload";
import { cn } from "@/lib/utils";
import { fileUpload } from "@/actions/file";
import { useCreateNewCategoryMutation } from "@/redux/Api/categoryApi";
import { toast } from "sonner";
import { useGetAllBrandsQuery } from "@/redux/Api/brandApi";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: File | null;
  selectedBrands: string[];
  type: "CATEGORY" | "BRAND";
}

interface IBrand {
  id: string;
  title: string;
  slug: string;
  image: string;
  isDelete: boolean;
  isPublish: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryTypeOptions = ["CATEGORY", "BRAND"] as const;

const CreateNewCategory: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createCategory] = useCreateNewCategoryMutation();

  const { data, isLoading: brandLoading } = useGetAllBrandsQuery({});
  const brandData: IBrand[] = data?.data || [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
    clearErrors,
    setError,
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image: null,
      selectedBrands: [],
      type: "CATEGORY",
    },
    mode: "onChange",
  });

  const watchedName = watch("name");
  const watchedBrands = watch("selectedBrands");
  const watchedType = watch("type");

  useEffect(() => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [watchedName, setValue]);

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const current = watchedBrands || [];
    if (checked) setValue("selectedBrands", [...current, brandId]);
    else
      setValue(
        "selectedBrands",
        current.filter((id) => id !== brandId)
      );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked)
      setValue(
        "selectedBrands",
        brandData.map((b) => b.id)
      );
    else setValue("selectedBrands", []);
  };

  const handleImageError = (error: string) => {
    setError("image", { message: error });
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Creating....!");
    try {
      let img;
      if (data.image) {
        const upload = await fileUpload([data.image], "prism-bazar/category");
        img = upload[0];
      }

      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: img,
        subCategories: data.type === "BRAND" ? data.selectedBrands : [],
        type: data.type,
      };

      const response = await createCategory(payload).unwrap();
      if (response.stateCode === 201) {
        toast.success(response.message, { id: toastId, duration: 1000 });
        reset();
      } else {
        toast.error(response.message || "Failed to create category", {
          id: toastId,
          duration: 1500,
        });
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Something went wrong!",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (brandLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center">
        <h1 className="text-lg">Loading brands...</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl min-h-screen mx-auto p-6">
      <Card className="bg-white shadow-none border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold sr-only">
            Create New Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Type Select */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Category Type <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="type"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full py-5",
                        errors.type && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder="Select category type" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {categoryTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-destructive">Type is required</p>
              )}
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter category name"
                {...register("name", { required: "Name is required" })}
                className={cn("py-6", errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug Input */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                Category Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                type="text"
                placeholder="category-url-slug"
                {...register("slug", { required: "Slug is required" })}
                className={cn("py-6", errors.slug && "border-destructive")}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter detailed description"
                {...register("description", {
                  required: "Description is required",
                })}
                className={`min-h-[100px] py-6 ${
                  errors.description ? "border-destructive" : ""
                }`}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Controller
                name="image"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <SingleFileUpload
                    file={value}
                    setFile={(file) => {
                      onChange(file);
                      if (file) clearErrors("image");
                    }}
                    label="Category Image"
                    placeholder="Upload category image"
                    maxSize={5}
                    onError={handleImageError}
                  />
                )}
              />
              {errors.image && (
                <p className="text-sm text-destructive">
                  {errors.image.message}
                </p>
              )}
            </div>

            {/* Brand Selection (only for type BRAND) */}

            {watchedType === "BRAND" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Select Brands <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={watchedBrands?.length === brandData.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label
                      htmlFor="select-all"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Select All
                    </Label>
                  </div>
                </div>

                {brandData.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-fit border rounded-lg p-4">
                    {brandData.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={watchedBrands?.includes(brand.id) || false}
                          onCheckedChange={(checked) =>
                            handleBrandChange(brand.id, checked as boolean)
                          }
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          {brand.image && (
                            <img
                              src={brand.image}
                              alt={brand.title}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <Label
                            htmlFor={`brand-${brand.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {brand.title}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No brands available</p>
                  </div>
                )}

                {watchedBrands && watchedBrands.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Selected: {watchedBrands.length} brand(s)
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateNewCategory;
