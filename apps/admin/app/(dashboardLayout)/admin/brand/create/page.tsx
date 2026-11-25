"use client";

import React, { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import SingleFileUpload from "@/components/Common/SingleFileUpload";
import { cn } from "@/lib/utils";
import { fileUpload } from "@/actions/file";
import { toast } from "sonner";
import { useCreateNewBrandMutation } from "@/redux/Api/brandApi";

interface CategoryFormData {
  title: string;
  slug: string;
  image: File | null;
}

const CreateNewBrand = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createBrand, { isLoading }] = useCreateNewBrandMutation();

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
      title: "",
      slug: "",
      image: null,
    },
    mode: "onChange",
  });

  const watchedName = watch("title");

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const validateMinWords = (value: string) => {
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length >= 1 || "Must contain at least 1 words";
  };

  const validateSlugMinWords = (value: string) => {
    const words = value
      .replace(/-/g, " ")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length >= 1 || "Slug must represent at least 1 words";
  };

  useEffect(() => {
    if (watchedName) {
      const newSlug = generateSlug(watchedName);
      setValue("slug", newSlug);
    }
  }, [watchedName, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    console.log("Data", data);
    setIsSubmitting(true);
    const toastId = toast.loading("Creating....!");
    try {
      if (!data.image) {
        setError("image", { message: "Image is required" });
        setIsSubmitting(false);
        return;
      }

      let img;
      if (data?.image) {
        const uploadImg = await fileUpload([data.image], "prism-bazar/category");
        img = uploadImg[0];
      }

      const payload = {
        title: data.title,
        slug: data.slug,
        image: img,
      };

      const response = await createBrand(payload).unwrap();
      if (response.statusCode === 201) {
        toast.success(response?.message, { id: toastId, duration: 1000 });
        reset();
      } else {
        toast.error(response.message || "Failed to create category", {
          id: toastId,
          duration: 1500,
        });
      }
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || "Something went wrong!";
      toast.error(errMsg, { id: toastId, duration: 1500 });

      if (errMsg.includes("Slug already exists")) {
        setError("slug", { message: errMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageError = (error: string) => {
    setError("image", { message: error });
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className=" bg-white shadow-none border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold sr-only">
            Create New Brand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload with Controller */}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Brand Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter brand name (minimum 1 words)"
                {...register("title", {
                  required: "Name is required",
                  validate: validateMinWords,
                })}
                className={cn("py-6", errors.title && "border-destructive")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Slug Input */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                Brand Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                type="text"
                placeholder="brand-url-slug"
                {...register("slug", {
                  required: "Slug is required",
                  validate: validateSlugMinWords,
                })}
                className={cn("py-6", errors.title && "border-destructive")}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Controller
                name="image"
                control={control}
                rules={{ required: "Image is required" }}
                render={({ field: { value, onChange } }) => (
                  <SingleFileUpload
                    file={value}
                    setFile={(file) => {
                      onChange(file);
                      if (file) {
                        clearErrors("image");
                      }
                    }}
                    label="Brand Image"
                    placeholder="Upload category image"
                    maxSize={5}
                    required
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

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating Branding..." : "Create Brand"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateNewBrand;
