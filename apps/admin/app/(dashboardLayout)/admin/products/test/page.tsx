"use client";
import MultipleSelectDropdown from "@/components/Dropdown/MultipleSelectDrodown";
import SingleSelectDropdown from "@/components/Dropdown/SingleSelectDropdown";
import { useGetAllBrandsQuery } from "@/redux/Api/brandApi";
import { useGetAllCategoryQuery } from "@/redux/Api/categoryApi";
import { useGetAllSubCategoryQuery } from "@/redux/Api/sub-categoryApi";
import { ICategory } from "@/types/category.type";
import { ISubCategory } from "@/types/sub.category.type";
import React, { useEffect, useMemo, useState } from "react";

type ExtendedSubCategory = ISubCategory & {
  parentId?: string | null;
  children?: ExtendedSubCategory[];
};

type BrandOption = {
  id: string;
  title: string;
  name?: string;
};

const ProductCreated = () => {
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState("");
  const [nestedSubCategorySearchTerm, setNestedSubCategorySearchTerm] =
    useState("");
  const [brandSearchTerm, setBrandSearchTerm] = useState("");

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
  const [selectedNestedSubCategoryId, setSelectedNestedSubCategoryId] =
    useState<string>("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");

  const { data: categoryResponse, isLoading: categoryLoading } =
    useGetAllCategoryQuery({
      searchTerm: categorySearchTerm,
    });

  const { data: subCategoryResponse, isLoading: subCategoryLoading } =
    useGetAllSubCategoryQuery({
      searchTerm: subCategorySearchTerm,
    });

  const { data: brandResponse, isLoading: brandLoading } =
    useGetAllBrandsQuery({
      searchTerm: brandSearchTerm,
    });

  const categories: ICategory[] = categoryResponse?.data?.data ?? [];
  const subCategories: ExtendedSubCategory[] =
    (subCategoryResponse?.data?.data ?? []) as ExtendedSubCategory[];
  const brands: BrandOption[] = brandResponse?.data ?? [];

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
        name: categoryName ? `${categoryName} � ${item.name}` : item.name,
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
      name: `${parent?.name ?? ""} � ${child.name}`,
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

  const selectionPayload = useMemo(
    () => ({
      categoryIds: selectedCategoryIds,
      subCategoryId: selectedSubCategoryId || null,
      nestedSubCategoryId: selectedNestedSubCategoryId || null,
      brandId: selectedBrandId || null,
    }),
    [
      selectedBrandId,
      selectedCategoryIds,
      selectedNestedSubCategoryId,
      selectedSubCategoryId,
    ]
  );

  console.log("Product taxonomy selection", selectionPayload);

  if (categoryLoading || subCategoryLoading || brandLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white p-3 max-w-4xl mx-auto">
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
            required
            errorMessage="Please select a brand"
            clearable
          />
        </div>
      </div>

      <div className="mt-6 px-6">
        <h4 className="mb-2 text-sm font-semibold text-gray-600">
          Selection payload
        </h4>
        <pre className="rounded-md bg-gray-50 p-4 text-xs text-gray-700">
          {JSON.stringify(selectionPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ProductCreated;
