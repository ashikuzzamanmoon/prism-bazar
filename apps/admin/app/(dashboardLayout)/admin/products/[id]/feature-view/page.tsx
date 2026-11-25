"use client";
import {
  useGetAllProductFeaturesQuery,
  useUpdateProductFeatureMutation,
} from "@/redux/Api/productApi";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import SingleFileUploader from "@/utlits/FileUploader";
import { fileUpload } from "@/actions/file";
import FeatureSortingModal from "./FeatureSortingModal";

export interface IProductFeatures {
  id: string;
  title: string;
  image: string;
  order: number;
  feature: Record<string, string>;
  productId: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

// type for editing feature items
type FeatureItem = {
  id: string;
  key: string;
  value: string;
};

const FeatureView = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useGetAllProductFeaturesQuery(
    id as string
  );
  const [updateFeature, { isLoading: updating }] =
    useUpdateProductFeatureMutation();

  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    title: string;
    features: FeatureItem[];
    image?: string;
  }>({ title: "", features: [] });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>("");

  // Start editing
  const handleEditStart = (feature: IProductFeatures) => {
    setEditingFeature(feature.id);
    setEditData({
      title: feature.title,
      image: feature.image,
      features: Object.entries(feature.feature).map(([key, value]) => ({
        id: crypto.randomUUID(),
        key,
        value,
      })),
    });
    setImageFile(null);
    setImageError("");
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingFeature(null);
    setEditData({ title: "", features: [] });
    setImageFile(null);
    setImageError("");
  };

  // Change key
  const handleFeatureKeyChange = (id: string, newKey: string) => {
    setEditData((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === id ? { ...f, key: newKey } : f
      ),
    }));
  };

  // Change value
  const handleFeatureValueChange = (id: string, newValue: string) => {
    setEditData((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === id ? { ...f, value: newValue } : f
      ),
    }));
  };

  // Add new feature
  const handleAddNewFeature = () => {
    const newFeature: FeatureItem = {
      id: crypto.randomUUID(),
      key: `Feature ${editData.features.length + 1}`,
      value: "",
    };
    setEditData((prev) => ({
      ...prev,
      features: [...prev.features, newFeature],
    }));
  };

  // Remove feature
  const handleRemoveFeature = (id: string) => {
    setEditData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== id),
    }));
  };

  // Save changes
  const handleSave = async (featureId: string) => {
    const toastId = toast.loading("Updating feature...");

    try {
      let img: string | undefined;
      if (imageFile) {
        const uploadedUrls = await fileUpload([imageFile], "prism-bazar/banner");
        img = uploadedUrls[0];
      }

      const payload = {
        title: editData.title,
        feature: editData.features.reduce(
          (acc, f) => ({ ...acc, [f.key]: f.value }),
          {}
        ),
        ...(img && { image: img }),
      };

      const response = await updateFeature({
        id: featureId,
        data: payload,
      }).unwrap();

      if (response?.statusCode === 200) {
        toast.success("Feature updated successfully!", { id: toastId });
        setEditingFeature(null);
        setImageFile(null);
        setImageError("");
        refetch();
      } else {
        toast.error(response?.message || "Failed to update feature", {
          id: toastId,
        });
      }
    } catch (error: any) {
      const errMsg =
        error?.data?.message || error?.message || "Something went wrong!";
      toast.error(errMsg, { id: toastId });
    }
  };

  // image handlers
  const handleImageValidationError = (error: string) => {
    setImageError(error);
    toast.error(error);
  };

  const handleImageSelect = (file: File) => {
    setImageError("");
    console.log("[v0] Image selected:", file.name);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg">
        <div className="flex items-center justify-center h-32">
          <div className="text-lg text-gray-600">
            Loading product features...
          </div>
        </div>
      </div>
    );
  }

  const features: IProductFeatures[] = data?.data || [];

  if (features.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg">
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">
            No product features found
          </div>
          <div className="text-gray-400 text-sm">
            Add some features to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Product Features</h2>
        <div className=" flex items-center gap-2">
          <FeatureSortingModal features={features} />
          <Badge variant="secondary" className="text-sm">
            {features.length} Feature{features.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {features.map((feature) => (
          <Card key={feature.id} className="overflow-hidden shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={
                        feature.image ||
                        "/placeholder.svg?height=64&width=64&query=product feature"
                      }
                      alt={feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    {editingFeature === feature.id ? (
                      <Input
                        value={editData.title}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="text-xl font-semibold px-4 py-1 shadow-none h-auto focus-visible:ring-0 "
                        placeholder="Feature title"
                      />
                    ) : (
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      Created:{" "}
                      {new Date(feature.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingFeature === feature.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(feature.id)}
                        className="h-8"
                        disabled={updating}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                        className="h-8 bg-transparent"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditStart(feature)}
                      className="h-8"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {editingFeature === feature.id && (
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Feature Image:
                    </h4>
                    <SingleFileUploader
                      file={imageFile}
                      setFile={setImageFile}
                      title="Feature Image"
                      acceptedFileTypes={["image/*"]}
                      maxSizeInMB={5}
                      existingFileUrl={editData.image}
                      onFileSelect={handleImageSelect}
                      onValidationError={handleImageValidationError}
                      error={imageError}
                      className="max-w-md"
                    />
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Feature Details:
                  </h4>

                  {editingFeature === feature.id ? (
                    <div className="space-y-3">
                      {editData.features.map((f) => (
                        <div key={f.id} className="flex items-center gap-2">
                          <Input
                            value={f.key}
                            onChange={(e) =>
                              handleFeatureKeyChange(f.id, e.target.value)
                            }
                            className="flex-1 py-5 shadow-none"
                            placeholder="Feature name"
                          />
                          <span className="text-gray-500">:</span>
                          <Input
                            value={f.value}
                            onChange={(e) =>
                              handleFeatureValueChange(f.id, e.target.value)
                            }
                            className="flex-1 py-5 shadow-none"
                            placeholder="Feature value"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFeature(f.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddNewFeature}
                        className="w-full mt-2 bg-primary text-white py-4 hover:bg-primary hover:text-white shadow-none cursor-pointer"
                      >
                        Add New Feature
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {Object.entries(feature.feature).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-700">
                            {key}:
                          </span>
                          <span className="text-gray-900 text-right flex-1 ml-4">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeatureView;
