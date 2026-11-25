"use client";
import { fileUpload } from "@/actions/file";
import { FeaturesInput } from "@/components/Products/FeaturesInput";
import { FormFieldWrapper } from "@/components/Products/FormFieldWrapper";
import { Input } from "@/components/ui/input";
import { useCreateProductFeatureMutation } from "@/redux/Api/productApi";
import SingleFileUploader from "@/utlits/FileUploader";
import { useParams, useRouter } from "next/navigation";
import { features } from "process";
import React, { useState } from "react";
import { toast } from "sonner";

interface Feature {
  name: string;
  value: string;
}
interface FeatureFormData {
  title: string;
  features?: Feature[];
  image: string;
}

const initialFormData: FeatureFormData = {
  title: "",
  features: [],
  image: "",
};

const ProductFeatureAdded = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState<FeatureFormData>(initialFormData);
  const [errors, setErrors] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const [createFeature, { isLoading: creating }] =
    useCreateProductFeatureMutation();
  const handleInputChange = (field: keyof FeatureFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let img;
    if (file) {
      const uploadedUrls = await fileUpload([file], "prism-bazar/banner");
      img = uploadedUrls[0];
    }
    if (!img) {
      toast.warning("No image uploaded");
      return;
    }

    const toastId = toast.loading("Creating...!");
    try {
      const payload = {
        title: formData.title,
        feature: formData.features,
        image: img,
      };
      const response = await createFeature({
        id: id as string,
        data: payload,
      }).unwrap();
      if (response?.statusCode === 201) {
        setFormData(initialFormData);
        setFile(null);
        toast.success(response?.message, { id: toastId, duration: 1000 });
      } else {
        toast.error(response?.message || "Fail to created !", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || "Something went wrong!";
      toast.error(errMsg, { id: toastId, duration: 1500 });
      console.log("error", err);
    }
  };

  return (
    <div className=" bg-white p-4 max-w-4xl mx-auto">
      <div>
        <h1 className=" text-lg text-primary">Product Feature Create</h1>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className=" space-y-5">
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
                className={`py-5 shadow-none${
                  errors.title ? "border-red-500" : ""
                } py-5 rounded-sm`}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Features" error={errors.features}>
              <FeaturesInput
                value={formData.features || {}}
                onChange={(features) => handleInputChange("features", features)}
                error={errors.features}
              />
            </FormFieldWrapper>

            <div className="">
              <SingleFileUploader
                file={file}
                setFile={setFile}
                title="Featured Image"
                required={false}
                maxSizeInMB={10}
                acceptedFileTypes={["image/*"]}
                showPreview={true}
                previewClassName="border border-amber-100"
              />
            </div>
          </div>
          <div className=" flex justify-between items-center gap-6">
            <button
              onClick={() => router.back()}
              className=" bg-red-100 text-red-500 w-full py-1"
            >
              Back Products
            </button>
            <button
              type="submit"
              disabled={creating}
              className=" bg-primary py-1 text-white w-full"
            >
              Create Product Feature
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFeatureAdded;
