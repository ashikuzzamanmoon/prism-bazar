"use client";
import MultipleSelectDropdown from "@/components/Dropdown/MultipleSelectDrodown";
import SingleSelectDropdown from "@/components/Dropdown/SingleSelectDropdown";
import ManageProducts from "@/components/NewProducts/ManageProducts";
import ProductTable from "@/components/Products/ProductTable";
import { useGetAllCategoryQuery } from "@/redux/Api/categoryApi";
import React, { useState } from "react";

interface ICategory {
  id: string;
  name: string;
}

const ProductManagementPage = () => {
  // const [singleSearchTerm, setSingleSearchTerm] = useState("");
  // const [multiSearchTerm, setMultiSearchTerm] = useState("");
  // const [selectedCategory, setSelectedCategory] = useState<string>("");
  // const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // const { data, isLoading } = useGetAllCategoryQuery({});

  // if (isLoading) {
  //   return <h1>Loading...</h1>;
  // }

  // const categoryData: ICategory[] = data?.data || [];

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Single selected category:", selectedCategory);
  //   console.log("Multiple selected categories:", selectedCategories);
  // };

  return (
    <div className=" p-4 space-y-4 bg-white">
      {/* <div className="max-w-md mx-auto flex items-center gap-6">
        <div>
          <h3 className="mb-2">Single Select</h3>
          <SingleSelectDropdown
            searchTerm={singleSearchTerm}
            setSearchTerm={setSingleSearchTerm}
            selectedValue={selectedCategory}
            setSelectedValue={setSelectedCategory}
            options={categoryData}
            placeholder="Select category..."
            emptyText="No categories found."
            required={true}
            errorMessage="Please select a category"
            clearable={true}
          />
        </div>

        <div>
          <h3 className="mb-2">Multiple Select</h3>
          <MultipleSelectDropdown
            searchTerm={multiSearchTerm}
            setSearchTerm={setMultiSearchTerm}
            selectedValues={selectedCategories}
            setSelectedValues={setSelectedCategories}
            options={categoryData}
            placeholder="Select categories..."
            emptyText="No categories found."
            clearable={true}
          />
        </div>
      </div> */}

      <div>
        {/* <ProductTable /> */}
        <ManageProducts />
      </div>
    </div>
  );
};

export default ProductManagementPage;
