"use client";

import React, { useEffect, useState } from "react";
import {
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useProductPublishingMutation,
} from "@/redux/Api/productApi";
import { IProduct } from "@/types/products.type";

import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "../ui/table";

import { TableSkeleton } from "../Common/TableSkeleton";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Switch } from "../ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";

import {
  MoreHorizontal,
  Eye,
  Edit,
  Globe,
  Trash2,
  Plus,
  Search,
  X,
  ArrowDownUp,
  ArrowUpDown,
} from "lucide-react";

import { Input } from "../ui/input";
import { PaginationControl } from "../Common/Pagination";
import { toast } from "sonner";
import ConfirmationAlert from "../Common/CustomAleart";
import ProductFeatureOrderingModal from "./ProductFearureOrderingModal";
import { IMeta } from "@/types/metaTypes";

const ProductTable = () => {
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openPublishModal, setOpenPublishModal] = useState(false);
  const [openSortingModal, setOpenSortingModal] = useState(false);

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [publishProduct, { isLoading: isPublishing }] =
    useProductPublishingMutation();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [limit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const query: Record<string, any> = {
    page: currentPage,
    limit,
  };

  if (searchTerm) {
    query.searchTerm = searchTerm;
  }

  const { data: product, isLoading } = useGetAllProductsQuery(query);

  if (isLoading) {
    return (
      <div>
        <TableSkeleton />
      </div>
    );
  }

  const productData: IProduct[] = product?.data?.data || [];

  const productMetaData: IMeta = product?.data?.meta ||
    product?.data?.meta || {
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
  };

  const handleProductPublish = (item: IProduct) => {
    setSelectedProduct(item);
    setDropdownOpenId(null);
    setOpenPublishModal(true);
  };

  const handleDelete = (item: IProduct) => {
    setSelectedProduct(item);
    setDropdownOpenId(null);
    setOpenDeleteModal(true);
  };

  const handleDeleteConfirmation = async () => {
    const toastId = toast.loading("Processing...");
    try {
      const response = await deleteProduct(
        selectedProduct?.id as string,
      ).unwrap();
      if (response?.statusCode === 200) {
        toast.success(response?.message, { id: toastId, duration: 1000 });
        setOpenDeleteModal(false);
      } else {
        toast.error(response?.message, { id: toastId, duration: 1000 });
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Something went wrong!",
        { id: toastId },
      );
      console.error("Update error:", error);
    }
  };

  const handlePublishConfirmation = async () => {
    const toastId = toast.loading("Processing...");
    if (!selectedProduct) {
      return toast.warning("Banner Select !");
    }
    try {
      const response = await publishProduct({
        id: selectedProduct.id as string,
        isPublish: !selectedProduct.isPublish,
      }).unwrap();
      if (response?.statusCode === 200) {
        toast.success(response?.message, { id: toastId, duration: 1000 });
      } else {
        toast.error(response?.message, { id: toastId, duration: 1000 });
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Something went wrong!",
        { id: toastId },
      );
      console.error("Update error:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2 mb-4"
        >
          <Input
            type="text"
            placeholder="Search by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 shadow-none"
          />
          <Button
            type="submit"
            size="sm"
            className="h-10 cursor-pointer bg-primary text-white hover:bg-primary"
          >
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-9 px-2 cursor-pointer bg-red-100 text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>
        <div className=" flex items-center gap-2">
          <Link href={"/admin/products/sorting"} className=" inline-block">
            <button className=" bg-primary text-white py-1.5 px-4 cursor-pointer flex items-center gap-2">
              <ArrowUpDown size={17} /> Sorting
            </button>
          </Link>
          <Link href={"/admin/products/create"} className=" inline-block">
            <button className=" bg-primary text-white py-1.5 px-4 cursor-pointer flex items-center gap-2">
              <Plus /> Create
            </button>
          </Link>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Pre Book Price</TableHead>
            <TableHead>Publish</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productData.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      typeof item.mainImages?.[0] === "string"
                        ? item.mainImages[0]
                        : item.mainImages?.[0]?.url || "/placeholder.svg"
                    }
                    alt={item.title || "Product Image"}
                  />
                </Avatar>
              </TableCell>

              <TableCell
                className="max-w-[200px] truncate whitespace-nowrap"
                title={item.title}
              >
                {item.title}
              </TableCell>

              <TableCell>{item.category?.name || "N/A"}</TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>{item.finalPrice.toFixed(2)}</TableCell>
              <TableCell>{item.discount}%</TableCell>
              <TableCell>
                {item.prebookPrice !== null && item.prebookPrice !== undefined
                  ? `${item.prebookPrice.toFixed(2)}`
                  : "-"}
              </TableCell>
              <TableCell>
                <Switch
                  checked={item.isPublish}
                  // onCheckedChange={() => handleProductPublish(item)}
                />
              </TableCell>
              <TableCell>
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
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <Link href={`/admin/products/${item.id}/view`}>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/admin/products/${item.id}/update`}>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/admin/products/${item.id}/feature`}>
                      <DropdownMenuItem>
                        <Plus className="mr-2 h-4 w-4" />
                        Feature
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/admin/products/${item.id}/feature-view`}>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Feature
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleProductPublish(item)}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      {item.isPublish ? "Unpublish" : "Publish"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>

                    {/* <DropdownMenuItem
                      onClick={() => handleSortingProductFeature(item)}
                    >
                      <ArrowDownUp className="mr-2 h-4 w-4" />
                      Sorting Feature
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className=" py-3">
        {/* <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={productMetaData?.total}
          itemsPerPage={productMetaData?.limit}
        /> */}
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={productMetaData?.total}
          itemsPerPage={productMetaData?.limit}
        />
      </div>

      {selectedProduct && openDeleteModal && (
        <ConfirmationAlert
          isOpen={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onConfirm={handleDeleteConfirmation}
          actionType="delete"
          itemName={selectedProduct?.title}
          isLoading={isDeleting}
        />
      )}

      {openPublishModal && (
        <ConfirmationAlert
          isOpen={openPublishModal}
          onClose={() => setOpenPublishModal(false)}
          onConfirm={handlePublishConfirmation}
          actionType={selectedProduct?.isPublish ? "unpublish" : "publish"}
          itemName={selectedProduct?.title}
          isLoading={isPublishing}
        />
      )}

      {/* {selectedProduct && openSortingModal && (
        <ProductFeatureOrderingModal
          productData={selectedProduct}
          open={openSortingModal}
          onOpenChange={setOpenSortingModal}
        />
      )} */}
    </div>
  );
};

export default ProductTable;
