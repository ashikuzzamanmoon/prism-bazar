"use client";

import React, { useMemo, useState } from "react";
import {
  useGetAllProductsQuery,
  useDeleteProductMutation,
  useProductPublishingMutation,
  useGetProductEditFieldsQuery,
  useGetProductVariantEditFieldsQuery,
  useGetSingleProductQuery,
} from "@/redux/Api/productApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Globe,
  Eye,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import SearchBar from "@/components/Common/SearchBar";
import ConfirmationAlert from "@/components/Common/ConfirmationAlert";
import { PaginationControl } from "@/components/Common/Pagination";
import { filterDeleteData } from "@/utlits/filterDeleteData";
import { IMeta } from "@/types/metaTypes";
import UpdateProduct from "./UpdateProduct";
import UpdateProductVariant from "./UpdateProductVariant";
import ViewProduct from "./ViewProduct";
import UpdateProductFeatureSorting from "./UpdateProductFeatureSorting";
import UpdateFeaturesFromProductFeature from "./UpdateFeaturesFromProductFeature";
import UpdateMainFeaturesSorting from "./UpdateMainFeaturesSorting";
import ProductFiltersPopover, {
  ProductFiltersValue,
} from "./ProductFiltersPopover";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface IProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  modelNumber: string;
  price: string;
  basePrice: string;
  discount: number;
  condition: "BRAND_NEW" | "PRE_OWNED";
  type: "LAPTOP" | "ACCESSORY";
  typeEntity?: { name: string };
  isPublish: boolean;
  isDelete: boolean;
  createdAt: string;
  productImages: ProductImage[];
  productColors: { id: string }[];
  productOptionGroups: { id: string }[];
}

const getProductImage = (images: ProductImage[]): string => {
  if (!images?.length) return "/placeholder.png";
  const primary = images.find((img) => img.isPrimary);
  return primary?.url ?? images[0]?.url ?? "/placeholder.png";
};

const ManageProducts = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isPublish, setIsPublish] = useState<boolean | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortByPrice, setSortByPrice] = useState<"asc" | "desc" | undefined>(
    undefined,
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openEditVariantModal, setOpenEditVariantModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openFeatureSortingModal, setOpenFeatureSortingModal] = useState(false);
  const [openFeatureItemSortingModal, setOpenFeatureItemSortingModal] =
    useState(false);
  const [openMainFeatureSortingModal, setOpenMainFeatureSortingModal] =
    useState(false);

  const query = useMemo(
    () => ({
      page: currentPage,
      limit,
      searchTerm: searchTerm.trim() || undefined,
      isPublish,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortByPrice,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [
      currentPage,
      limit,
      searchTerm,
      isPublish,
      minPrice,
      maxPrice,
      sortByPrice,
      startDate,
      endDate,
    ],
  );

  const filterValues: ProductFiltersValue = {
    isPublish,
    sortByPrice,
    minPrice,
    maxPrice,
    startDate,
    endDate,
  };

  const { data, isLoading, refetch } = useGetAllProductsQuery(query);

  const [publishProduct, { isLoading: publishing }] =
    useProductPublishingMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const { data: productsEditData } = useGetProductEditFieldsQuery(
    selectedProduct?.id ?? "",
    { skip: !selectedProduct?.id },
  );

  const { data: productsVariantEditData } = useGetProductVariantEditFieldsQuery(
    selectedProduct?.id ?? "",
    { skip: !selectedProduct?.id },
  );

  const { data: productDetailsRes, isFetching: isViewing } =
    useGetSingleProductQuery(selectedProduct?.id ?? "", {
      skip: !openViewModal || !selectedProduct?.id,
    });

  const viewProductData = productDetailsRes?.data;

  if (isLoading) return <TableSkeleton />;
  const productData: IProduct[] = data?.data || [];
  const productMetaData: IMeta = data?.meta ||
    data?.data?.meta || {
      page: 1,
      limit,
      total: 0,
    };
  const totalPages = Math.ceil(productMetaData.total / productMetaData.limit);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleEdit = (product: IProduct) => {
    setSelectedProduct(product);
    setOpenEditModal(true);
  };

  const handleEditVariant = (product: IProduct) => {
    setSelectedProduct(product);
    setOpenEditVariantModal(true);
  };

  const handleView = (product: IProduct) => {
    setSelectedProduct(product);
    setOpenViewModal(true);
  };

  const handlePublishToggle = async (id: string, isPublish: boolean) => {
    const toastId = toast.loading("Updating publish status...");
    try {
      const res = await publishProduct({ id, isPublish }).unwrap();
      toast.success(res?.message ?? "Status updated", {
        id: toastId,
        duration: 1000,
      });
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update publish status", {
        id: toastId,
        duration: 1000,
      });
    }
  };

  const handleDeleteClick = (product: IProduct) => {
    setSelectedProduct(product);
    setOpenDeleteModal(true);
    setDropdownOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    const toastId = toast.loading("Deleting product...");
    try {
      const response = await deleteProduct(selectedProduct.id).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message || "Product deleted successfully", {
          id: toastId,
          duration: 1000,
        });
        refetch();
      } else {
        toast.error(response.message || "Failed to delete product", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete product", {
        id: toastId,
        duration: 1000,
      });
    } finally {
      setOpenDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <form onSubmit={handleSearch} className="w-full xl:w-72 shrink-0">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            clearSearch={clearSearch}
          />
        </form>

        <div className="flex items-center gap-2">
          <ProductFiltersPopover
            values={filterValues}
            onChange={(changes) => {
              setCurrentPage(1);
              if ("isPublish" in changes) setIsPublish(changes.isPublish);
              if ("sortByPrice" in changes) setSortByPrice(changes.sortByPrice);
              if ("minPrice" in changes) setMinPrice(changes.minPrice ?? "");
              if ("maxPrice" in changes) setMaxPrice(changes.maxPrice ?? "");
              if ("startDate" in changes) setStartDate(changes.startDate ?? "");
              if ("endDate" in changes) setEndDate(changes.endDate ?? "");
            }}
            onReset={() => {
              setCurrentPage(1);
              setIsPublish(undefined);
              setMinPrice("");
              setMaxPrice("");
              setSortByPrice(undefined);
              setStartDate("");
              setEndDate("");
            }}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="border rounded-md overflow-hidden ">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Publish</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {productData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Package className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No products found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              productData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-500 text-sm">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>

                  <TableCell>
                    <img
                      src={getProductImage(item.productImages)}
                      alt={item.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded-md border border-gray-200"
                    />
                  </TableCell>

                  <TableCell>
                    <p className="text-sm font-medium text-gray-900 max-w-44 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-44">
                      {item.slug}
                    </p>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {item.modelNumber}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        ৳{Number(item.price).toLocaleString()}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-xs text-green-600">
                          {item.discount}% off
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.condition === "BRAND_NEW"
                          ? "border-green-200 text-green-700 bg-green-50 text-xs"
                          : "border-orange-200 text-orange-700 bg-orange-50 text-xs"
                      }
                    >
                      {item.condition.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 bg-blue-50 text-xs"
                    >
                      {item.typeEntity?.name || item.type}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-500">
                        {item.productColors?.length ?? 0} color
                        {(item.productColors?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.productOptionGroups?.length ?? 0} option
                        {(item.productOptionGroups?.length ?? 0) !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Switch
                      disabled={publishing}
                      checked={item.isPublish}
                      onCheckedChange={(checked) =>
                        handlePublishToggle(item.id, checked)
                      }
                    />
                  </TableCell>

                  <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu
                      open={dropdownOpenId === item.id}
                      onOpenChange={(open) =>
                        setDropdownOpenId(open ? item.id : null)
                      }
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem onClick={() => handleView(item)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleEditVariant(item)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Update Variant
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProduct(item);
                            setOpenMainFeatureSortingModal(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Main Features Sorting
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProduct(item);
                            setOpenFeatureSortingModal(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Product Features Sorting
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProduct(item);
                            setOpenFeatureItemSortingModal(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Features From Product Feature
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handlePublishToggle(item.id, !item.isPublish)
                          }
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          {item.isPublish ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination + Per Page + Reset ── */}
      <div className="flex flex-col gap-3 pt-1 pl-1">
        {/* Pagination - full width, wraps naturally */}
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={productMetaData?.total}
          itemsPerPage={productMetaData?.limit}
        />

        {/* Rows per page + Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="whitespace-nowrap">Rows per page</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => {
                setLimit(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-sm text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 transition-colors px-3 whitespace-nowrap"
            onClick={() => {
              setSearchInput("");
              setSearchTerm("");
              setCurrentPage(1);
              setLimit(10);
              setIsPublish(undefined);
              setMinPrice("");
              setMaxPrice("");
              setSortByPrice(undefined);
              setStartDate("");
              setEndDate("");
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* ── Modals ── */}
      {openDeleteModal && (
        <ConfirmationAlert
          isOpen={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          actionType="delete"
          itemName={selectedProduct?.title}
          isLoading={isDeleting}
        />
      )}

      {selectedProduct && openEditModal && (
        <UpdateProduct
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          productData={productsEditData}
        />
      )}

      {selectedProduct && openEditVariantModal && (
        <UpdateProductVariant
          open={openEditVariantModal}
          onOpenChange={setOpenEditVariantModal}
          productData={productsVariantEditData}
        />
      )}

      {openViewModal && (
        <ViewProduct
          open={openViewModal}
          onOpenChange={(v) => {
            setOpenViewModal(v);
            if (!v) setSelectedProduct(null);
          }}
          productData={viewProductData as any}
          isLoading={isViewing}
        />
      )}

      {selectedProduct && openMainFeatureSortingModal && (
        <UpdateMainFeaturesSorting
          open={openMainFeatureSortingModal}
          onOpenChange={(v) => {
            setOpenMainFeatureSortingModal(v);
            if (!v) setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
        />
      )}

      {selectedProduct && openFeatureSortingModal && (
        <UpdateProductFeatureSorting
          open={openFeatureSortingModal}
          onOpenChange={(v) => {
            setOpenFeatureSortingModal(v);
            if (!v) setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
        />
      )}

      {selectedProduct && openFeatureItemSortingModal && (
        <UpdateFeaturesFromProductFeature
          open={openFeatureItemSortingModal}
          onOpenChange={(v) => {
            setOpenFeatureItemSortingModal(v);
            if (!v) setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
        />
      )}
    </div>
  );
};

export default ManageProducts;
