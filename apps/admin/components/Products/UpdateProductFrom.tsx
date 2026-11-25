"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Eye, AlertCircle } from "lucide-react";
import {
  ProductFormData,
  ProductValidationErrors,
} from "@/types/product.create.type";
import { validateProductForm } from "./validateProductForm";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { FeaturesInput } from "./FeaturesInput";
import { generateSlug } from "./generateSlug";
import { useGetAllCategoryQuery } from "@/redux/Api/categoryApi";
import SingleSelectDropdown from "../Dropdown/SingleSelectDropdown";
import MultipleSelectDropdown from "../Dropdown/MultipleSelectDrodown";
import { useGetAllSubCategoryQuery } from "@/redux/Api/sub-categoryApi";
import MultipleFileUploader from "../Dropdown/MultipleFileUploader";
import { fileUpload } from "@/actions/file";
import { toast } from "sonner";
import { IProduct } from "@/types/products.type";
import { useGetUpdateProductMutation } from "@/redux/Api/productApi";
import { useGetAllBrandsQuery } from "@/redux/Api/brandApi";
import { ICategory } from "@/types/category.type";
import { ISubCategory } from "@/types/sub.category.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ExistingImageObject {
  url: string;
}

type ExtendedSubCategory = ISubCategory & {
  parentId?: string | null;
  children?: ExtendedSubCategory[];
};

type BrandOption = {
  id: string;
  title: string;
  name?: string;
};

const normalizeImageSource = (image: string | ExistingImageObject) =>
  typeof image === "string" ? image : image.url;

const productConditions = [
  "FRESH",
  "PACKAGED",
  "HANDMADE",
  "PRINTED",
  "DIGITAL",
  "BRAND_NEW",
  "PRE_OWNED",
];
const productTypes = [
  "ORGANIC_FOOD",
  "EDUCATION_MATERIAL",
  "GENERAL",
  "LAPTOP",
  "ACCESSORY",
];

const UpdateProductForm = ({ productData }: { productData: IProduct }) => {
  console.log("Edit Product Data", productData)
  const normalizedCategoryIds =
    productData.categoryIds && productData.categoryIds.length > 0
      ? productData.categoryIds
      : productData.categoryId
      ? [productData.categoryId]
      : [];

  const normalizedExistingImages = productData.mainImages
    ? productData.mainImages.map(normalizeImageSource)
    : [];

  const [formData, setFormData] = useState<ProductFormData>({
    title: productData.title,
    brand: productData.brand,
    model: productData.model,
    description: productData.description,
    originalPrice: productData.originalPrice,
    discount: productData.discount || 0,
    finalPrice: productData.finalPrice,
    prebookPrice: productData.prebookPrice || 0,
    deliveryCharge: productData.deliveryCharge || 0,
    condition: productData.condition || "FRESH",
    type: productData.type || "ORGANIC_FOOD",
    expiryDate: (productData as any).expiryDate || "",
    ingredients: (productData as any).ingredients || "",
    nutritionInfo: (productData as any).nutritionInfo || "",
    isDigital: (productData as any).isDigital || false,
    author: (productData as any).author || "",
    publisher: (productData as any).publisher || "",
    stock: productData.stock || 0,
    slug: productData.slug,
    processor: productData.processor || "",
    ram: productData.ram || "",
    storage: productData.storage || "",
    screenSize: productData.screenSize || "",
    graphicsCard: productData.graphicsCard || "",
    os: productData.os || "",
    warranty: productData.warranty || "",
    weight: productData.weight || "",
    features: productData.features || {},
    ratings: productData.ratings || 0,
    reviewsCount: productData.reviewsCount || 0,
    isPublish: productData.isPublish,
  });

  const [errors, setErrors] = useState<ProductValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState("");
  const [nestedSubCategorySearchTerm, setNestedSubCategorySearchTerm] =
    useState("");
  const [brandSearchTerm, setBrandSearchTerm] = useState("");

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    normalizedCategoryIds
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(
    productData.subCategoryId || ""
  );
  const [selectedNestedSubCategoryId, setSelectedNestedSubCategoryId] =
    useState<string>(productData.nestedSubCategoryId || "");
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    productData.brandId || ""
  );
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    normalizedExistingImages
  );

  const categoryQuery: Record<string, any> = {
    searchTerm: categorySearchTerm,
  };

  const subCategoryQuery: Record<string, any> = {
    searchTerm: subCategorySearchTerm,
  };

  const brandQuery: Record<string, any> = {
    searchTerm: brandSearchTerm,
  };

  const { data: categoryResponse, isLoading: categoryLoading } =
    useGetAllCategoryQuery(categoryQuery);

  const { data: subCategoryResponse, isLoading: subCategoryLoading } =
    useGetAllSubCategoryQuery(subCategoryQuery);

  const { data: brandResponse, isLoading: brandLoading } =
    useGetAllBrandsQuery(brandQuery);

  const [updateProduct, { isLoading: updating }] =
    useGetUpdateProductMutation();

  const categories: ICategory[] = categoryResponse?.data?.data || [];
  const subCategories: ExtendedSubCategory[] = (subCategoryResponse?.data
    ?.data ||
    subCategoryResponse?.data ||
    []) as ExtendedSubCategory[];
  const brands: BrandOption[] = (brandResponse?.data?.data ||
    brandResponse?.data ||
    []) as BrandOption[];

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((item) => item.type === "CATEGORY")
        .map(({ id, name }) => ({
          id,
          name,
        })),
    [categories]
  );

  const subCategoryOptions = useMemo(() => {
    const rootNodes = subCategories.filter((item) => !item.parentId);
    const filtered = selectedCategoryIds.length
      ? rootNodes.filter(
          (item) =>
            item.categoryId && selectedCategoryIds.includes(item.categoryId)
        )
      : rootNodes;

    return filtered.map((item) => {
      const categoryName = categories.find(
        (category) => category.id === item.categoryId
      )?.name;

      return {
        id: item.id,
        name: categoryName ? `${categoryName} > ${item.name}` : item.name,
      };
    });
  }, [categories, selectedCategoryIds, subCategories]);

  const nestedSubCategoryOptions = useMemo(() => {
    if (!selectedSubCategoryId) {
      return [];
    }

    const parent = subCategories.find(
      (item) => item.id === selectedSubCategoryId
    );

    return (parent?.children ?? []).map((child) => ({
      id: child.id,
      name: `${parent?.name ?? ""} > ${child.name}`,
    }));
  }, [selectedSubCategoryId, subCategories]);

  const brandOptions = useMemo(
    () =>
      brands.map((brand) => ({
        id: brand.id,
        title: brand.title,
      })),
    [brands]
  );

  useEffect(() => {
    if (
      selectedSubCategoryId &&
      !subCategoryOptions.some((option) => option.id === selectedSubCategoryId)
    ) {
      setSelectedSubCategoryId("");
      setSelectedNestedSubCategoryId("");
      setNestedSubCategorySearchTerm("");
    }
  }, [selectedSubCategoryId, subCategoryOptions]);

  useEffect(() => {
    if (
      selectedNestedSubCategoryId &&
      !nestedSubCategoryOptions.some(
        (option) => option.id === selectedNestedSubCategoryId
      )
    ) {
      setSelectedNestedSubCategoryId("");
    }
  }, [selectedNestedSubCategoryId, nestedSubCategoryOptions]);

  useEffect(() => {
    if (!selectedSubCategoryId) {
      setSelectedNestedSubCategoryId("");
      setNestedSubCategorySearchTerm("");
    }
  }, [selectedSubCategoryId]);

  useEffect(() => {
    if (
      selectedBrandId &&
      !brandOptions.some((option) => option.id === selectedBrandId)
    ) {
      setSelectedBrandId("");
      setBrandSearchTerm("");
    }
  }, [brandOptions, selectedBrandId]);

  useEffect(() => {
    if (formData.title) {
      const newSlug = generateSlug(formData.title);
      if (newSlug !== formData.slug) {
        setFormData((prev) => ({
          ...prev,
          slug: newSlug,
        }));
      }
    }
  }, [formData.title]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    const toastId = toast.loading("Updating product...");
    const validationErrors = validateProductForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      toast.error("Please fix the errors in the form", { id: toastId });
      return;
    }

    let newImages: string[] = [];
    if (files.length > 0) {
      const uploadedUrls = await fileUpload(files, "prism-bazar/products");
      newImages = uploadedUrls;
    }

    const payload = {
      ...formData,
      categoryIds: selectedCategoryIds,
      subCategoryId: selectedSubCategoryId || null,
      nestedSubCategoryId: selectedNestedSubCategoryId || null,
      brandId: selectedBrandId || null,
      mainImages: [...existingImages, ...newImages],
    };

    try {
      const response = await updateProduct({
        id: productData?.id,
        data: payload,
      }).unwrap();

      if (response?.statusCode === 200) {
        toast.success(response?.message, { id: toastId, duration: 1000 });
        setSubmitSuccess(true);
      } else {
        toast.error(response?.message || "Failed to update product", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || "Something went wrong!";
      toast.error(errMsg, { id: toastId, duration: 1500 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoryLoading || subCategoryLoading || brandLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 h-full flex flex-col bg-white">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Product updated successfully!</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-primary">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormFieldWrapper
                  label="Product Title"
                  required
                  error={errors.title}
                  htmlFor="title"
                >
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter product title"
                    className={`${
                      errors.title ? "border-red-500" : ""
                    } py-5 rounded-sm`}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Brand"
                  required
                  error={errors.brand}
                  htmlFor="brand"
                >
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder="Enter brand name"
                    className={`${errors.brand ? "border-red-500" : ""} py-5`}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Model"
                  required
                  error={errors.model}
                  htmlFor="model"
                >
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="Enter model number"
                    className={`${errors.model ? "border-red-500" : ""} py-5`}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Slug"
                  required
                  error={errors.slug}
                  htmlFor="slug"
                >
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="product-slug"
                    className={`${errors.slug ? "border-red-500" : ""} py-5`}
                  />
                </FormFieldWrapper>
              </div>

              <FormFieldWrapper
                label="Description"
                required
                error={errors.description}
                htmlFor="description"
              >
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter product description"
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
              </FormFieldWrapper>
            </CardContent>
          </Card>
          <hr />
          {/* Pricing & Stock */}
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-primary">Pricing & Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormFieldWrapper
                  label="Original Price"
                  required
                  error={errors.originalPrice}
                  htmlFor="originalPrice"
                >
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.originalPrice || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "originalPrice",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                    className={`${
                      errors.originalPrice ? "border-red-500" : ""
                    } py-5`}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Discount (%)"
                  error={errors.discount}
                  htmlFor="discount"
                >
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "discount",
                        e.target.value
                          ? Number.parseFloat(e.target.value)
                          : undefined
                      )
                    }
                    placeholder="0.00"
                    className={`${
                      errors.discount ? "border-red-500" : ""
                    } py-5`}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Final Price"
                  required
                  error={errors.finalPrice}
                  htmlFor="finalPrice"
                >
                  <Input
                    id="finalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.finalPrice || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "finalPrice",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0.00"
                    className={`${
                      errors.finalPrice ? "border-red-500" : ""
                    } py-5`}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Prebook Price"
                  error={errors.prebookPrice}
                  htmlFor="prebookPrice"
                >
                  <Input
                    id="prebookPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.prebookPrice || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "prebookPrice",
                        e.target.value
                          ? Number.parseFloat(e.target.value)
                          : undefined
                      )
                    }
                    placeholder="0.00"
                    className={`${
                      errors.prebookPrice ? "border-red-500" : ""
                    } py-5`}
                  />
                </FormFieldWrapper>

                {/* <FormFieldWrapper
                  label="Stock Quantity"
                  required
                  error={errors.stock}
                  htmlFor="stock"
                >
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "stock",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className={`${errors.stock ? "border-red-500" : ""} py-5`}
                  />
                </FormFieldWrapper> */}
                <FormFieldWrapper
                  label="Stock Quantity"
                  required
                  error={errors.stock}
                  htmlFor="stock"
                >
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock === 0 ? "" : formData.stock}
                    onChange={(e) =>
                      handleInputChange(
                        "stock",
                        e.target.value ? Number.parseInt(e.target.value) : 0
                      )
                    }
                    placeholder="0"
                    className={`${errors.stock ? "border-red-500" : ""} py-5`}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Delivery Charge"
                  required
                  error={errors.stock}
                  htmlFor="deliveryCharge"
                >
                  <Input
                    id="deliveryCharge"
                    type="number"
                    min="0"
                    value={formData.deliveryCharge || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "deliveryCharge",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className={`${
                      errors.description ? "border-red-500" : ""
                    } py-5`}
                  />
                </FormFieldWrapper>
                <FormFieldWrapper
                  label="Condition"
                  required
                  error={errors.condition}
                  htmlFor="condition"
                >
                  <Select
                    value={formData.condition}
                    onValueChange={(value) =>
                      handleInputChange("condition", value)
                    }
                  >
                    <SelectTrigger className="w-full py-5">
                      <SelectValue placeholder="Select product condition" />
                    </SelectTrigger>

                    <SelectContent className="min-h-24 overflow-y-auto">
                      {productConditions.map((item, index) => (
                        <SelectItem key={index} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Product Type"
                  required
                  error={errors.condition}
                  htmlFor="type"
                >
                  <Select
                    value={formData.condition}
                    onValueChange={(value) =>
                      handleInputChange("type", value)
                    }
                  >
                    <SelectTrigger className="w-full py-5">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>

                    <SelectContent className="min-h-24 overflow-y-auto">
                      {productTypes.map((item, index) => (
                        <SelectItem key={index} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormFieldWrapper>
              </div>
            </CardContent>
          </Card>

          {/* Organic Food & Education Details */}
          <Card className="border-0 shadow-none bg-gray-50/60 rounded-xl p-4">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-primary text-base">
                অর্গানিক ও শিক্ষা পণ্যের বিবরণ (Organic & Education Specifics)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldWrapper label="লেখক / সংকলক (Author)" htmlFor="author">
                  <Input
                    id="author"
                    value={formData.author || ""}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    placeholder="যেমন: ড. মুহাম্মদ জাফর ইকবাল"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="প্রকাশক / প্রতিষ্ঠান (Publisher)" htmlFor="publisher">
                  <Input
                    id="publisher"
                    value={formData.publisher || ""}
                    onChange={(e) => handleInputChange("publisher", e.target.value)}
                    placeholder="যেমন: অনুপম প্রকাশনী"
                  />
                </FormFieldWrapper>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormFieldWrapper label="উপাদান (Ingredients)" htmlFor="ingredients">
                  <Input
                    id="ingredients"
                    value={formData.ingredients || ""}
                    onChange={(e) => handleInputChange("ingredients", e.target.value)}
                    placeholder="যেমন: সরিষা বীজ, খাঁটি মধু"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="পুষ্টিগুণ (Nutrition)" htmlFor="nutritionInfo">
                  <Input
                    id="nutritionInfo"
                    value={formData.nutritionInfo || ""}
                    onChange={(e) => handleInputChange("nutritionInfo", e.target.value)}
                    placeholder="যেমন: ভিটামিন এ, সি"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="মেয়াদ (Best Before)" htmlFor="expiryDate">
                  <Input
                    id="expiryDate"
                    value={formData.expiryDate || ""}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    placeholder="যেমন: ৬ মাস"
                  />
                </FormFieldWrapper>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="isDigital"
                  checked={formData.isDigital || false}
                  onCheckedChange={(checked) => handleInputChange("isDigital", checked)}
                />
                <label htmlFor="isDigital" className="text-sm font-medium text-gray-700 cursor-pointer">
                  ডিজিটাল সংস্করণ / পিডিএফ ফাইল (Digital PDF)
                </label>
              </div>
            </CardContent>
          </Card>
          <hr />
          {/* Technical Specifications */}
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-primary">
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormFieldWrapper label="Processor" htmlFor="processor">
                  <Input
                    id="processor"
                    value={formData.processor || ""}
                    onChange={(e) =>
                      handleInputChange("processor", e.target.value)
                    }
                    placeholder="e.g., Intel Core i7-12700H"
                    className="py-5"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="RAM" htmlFor="ram">
                  <Input
                    id="ram"
                    value={formData.ram || ""}
                    onChange={(e) => handleInputChange("ram", e.target.value)}
                    placeholder="e.g., 16GB DDR4"
                    className="py-5"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Storage" htmlFor="storage">
                  <Input
                    id="storage"
                    value={formData.storage || ""}
                    onChange={(e) =>
                      handleInputChange("storage", e.target.value)
                    }
                    placeholder="e.g., 512GB SSD"
                    className="py-5"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Screen Size" htmlFor="screenSize">
                  <Input
                    id="screenSize"
                    value={formData.screenSize || ""}
                    onChange={(e) =>
                      handleInputChange("screenSize", e.target.value)
                    }
                    placeholder="e.g., 15.6 inches"
                    className="py-5"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Graphics Card" htmlFor="graphicsCard">
                  <Input
                    id="graphicsCard"
                    value={formData.graphicsCard || ""}
                    onChange={(e) =>
                      handleInputChange("graphicsCard", e.target.value)
                    }
                    placeholder="e.g., NVIDIA RTX 3060"
                    className="py-5"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Operating System" htmlFor="os">
                  <Input
                    id="os"
                    value={formData.os || ""}
                    onChange={(e) => handleInputChange("os", e.target.value)}
                    placeholder="e.g., Windows 11"
                    className="py-5"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Warranty" htmlFor="warranty">
                  <Input
                    id="warranty"
                    value={formData.warranty || ""}
                    onChange={(e) =>
                      handleInputChange("warranty", e.target.value)
                    }
                    placeholder="e.g., 2 years"
                    className="py-5"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper label="Weight" htmlFor="weight">
                  <Input
                    id="weight"
                    value={formData.weight || ""}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    placeholder="e.g., 2.1 kg"
                    className="py-5"
                  />
                </FormFieldWrapper>
              </div>
            </CardContent>
          </Card>

          {/* Organic Food & Education Details */}
          <Card className="border-0 shadow-none bg-gray-50/60 rounded-xl p-4">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-primary text-base">
                অর্গানিক ও শিক্ষা পণ্যের বিবরণ (Organic & Education Specifics)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldWrapper label="লেখক / সংকলক (Author)" htmlFor="author">
                  <Input
                    id="author"
                    value={formData.author || ""}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    placeholder="যেমন: ড. মুহাম্মদ জাফর ইকবাল"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="প্রকাশক / প্রতিষ্ঠান (Publisher)" htmlFor="publisher">
                  <Input
                    id="publisher"
                    value={formData.publisher || ""}
                    onChange={(e) => handleInputChange("publisher", e.target.value)}
                    placeholder="যেমন: অনুপম প্রকাশনী"
                  />
                </FormFieldWrapper>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormFieldWrapper label="উপাদান (Ingredients)" htmlFor="ingredients">
                  <Input
                    id="ingredients"
                    value={formData.ingredients || ""}
                    onChange={(e) => handleInputChange("ingredients", e.target.value)}
                    placeholder="যেমন: সরিষা বীজ, খাঁটি মধু"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="পুষ্টিগুণ (Nutrition)" htmlFor="nutritionInfo">
                  <Input
                    id="nutritionInfo"
                    value={formData.nutritionInfo || ""}
                    onChange={(e) => handleInputChange("nutritionInfo", e.target.value)}
                    placeholder="যেমন: ভিটামিন এ, সি"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="মেয়াদ (Best Before)" htmlFor="expiryDate">
                  <Input
                    id="expiryDate"
                    value={formData.expiryDate || ""}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    placeholder="যেমন: ৬ মাস"
                  />
                </FormFieldWrapper>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="isDigital"
                  checked={formData.isDigital || false}
                  onCheckedChange={(checked) => handleInputChange("isDigital", checked)}
                />
                <label htmlFor="isDigital" className="text-sm font-medium text-gray-700 cursor-pointer">
                  ডিজিটাল সংস্করণ / পিডিএফ ফাইল (Digital PDF)
                </label>
              </div>
            </CardContent>
          </Card>
          <hr />
          {/* Additional Features */}
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-primary">
                Additional Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormFieldWrapper label="Features" error={errors.features}>
                <FeaturesInput
                  value={formData.features || {}}
                  onChange={(features) =>
                    handleInputChange("features", features)
                  }
                  error={errors.features}
                />
              </FormFieldWrapper>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormFieldWrapper
                  label="Ratings"
                  error={errors.ratings}
                  htmlFor="ratings"
                >
                  <Input
                    id="ratings"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.ratings || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "ratings",
                        e.target.value
                          ? Number.parseFloat(e.target.value)
                          : undefined
                      )
                    }
                    placeholder="0.0"
                    className={`${errors.ratings ? "border-red-500" : ""} py-5`}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Reviews Count"
                  error={errors.reviewsCount}
                  htmlFor="reviewsCount"
                >
                  <Input
                    id="reviewsCount"
                    type="number"
                    min="0"
                    value={formData.reviewsCount || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "reviewsCount",
                        e.target.value
                          ? Number.parseInt(e.target.value)
                          : undefined
                      )
                    }
                    placeholder="0"
                    className={`${
                      errors.reviewsCount ? "border-red-500" : ""
                    } py-5`}
                  />
                </FormFieldWrapper>
              </div>

              <div className="flex items-center space-x-2 sticky bottom-0 bg-white py-4 border-t">
                <Switch
                  id="isPublish"
                  checked={formData.isPublish}
                  onCheckedChange={(checked) =>
                    handleInputChange("isPublish", checked)
                  }
                  className="ml-2"
                />
                <label
                  htmlFor="isPublish"
                  className="text-sm font-medium cursor-pointer"
                >
                  Publish product immediately
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
            <div>
              <h3 className="mb-2">Multiple Categories</h3>
              <MultipleSelectDropdown
                searchTerm={categorySearchTerm}
                setSearchTerm={setCategorySearchTerm}
                selectedValues={selectedCategoryIds}
                setSelectedValues={setSelectedCategoryIds}
                options={categories}
                placeholder="Select categories..."
                emptyText="No categories found."
                clearable
              />
            </div>

            <div>
              <h3 className="mb-2">Parent Sub-Category</h3>
              <SingleSelectDropdown
                searchTerm={subCategorySearchTerm}
                setSearchTerm={setSubCategorySearchTerm}
                selectedValue={selectedSubCategoryId}
                setSelectedValue={setSelectedSubCategoryId}
                options={subCategoryOptions}
                placeholder="Select sub-category..."
                emptyText="No sub-categories found."
                clearable
              />
            </div>

            <div>
              <h3 className="mb-2">Nested Sub-Category</h3>
              <SingleSelectDropdown
                searchTerm={nestedSubCategorySearchTerm}
                setSearchTerm={setNestedSubCategorySearchTerm}
                selectedValue={selectedNestedSubCategoryId}
                setSelectedValue={setSelectedNestedSubCategoryId}
                options={nestedSubCategoryOptions}
                placeholder="Select nested sub-category..."
                emptyText={
                  selectedSubCategoryId
                    ? "No nested sub-categories found."
                    : "Select a parent sub-category first."
                }
                clearable
              />
            </div>

            <div>
              <h3 className="mb-2">Brand</h3>
              <SingleSelectDropdown
                searchTerm={brandSearchTerm}
                setSearchTerm={setBrandSearchTerm}
                selectedValue={selectedBrandId}
                setSelectedValue={setSelectedBrandId}
                options={brandOptions}
                placeholder="Select brand..."
                emptyText="No brands found."
                clearable
              />
            </div>
          </div>

          <div className="px-6">
            <MultipleFileUploader
              file={files}
              setFile={setFiles}
              existingImages={existingImages}
              onRemoveExistingImage={handleRemoveImage}
              title="Products Images"
              required={false}
              maxSizeInMB={20}
              acceptedFileTypes={["image/*"]}
              showPreview
              previewClassName="border border-amber-100"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button type="submit" disabled={isSubmitting || updating}>
              {isSubmitting || updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductForm;
