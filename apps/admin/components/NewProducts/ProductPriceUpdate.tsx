"use client";

import React, { useState } from "react";
import { useGetProductInventoriesQuery } from "@/redux/Api/productApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import SearchBar from "@/components/Common/SearchBar";
import { PaginationControl } from "@/components/Common/Pagination";
import EditPriceModal from "./EditPriceModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductImage {
  id: string;
  url: string;
}

interface ProductInventory {
  id: string;
  quantity: number;
}

interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  stock: number;
}

interface IProduct {
  id: string;
  title: string;
  price: string;
  productImages?: ProductImage[];
  productInventories?: ProductInventory[];
  productColors?: ProductColor[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const getProductImage = (images?: ProductImage[]): string => {
  if (!images?.length) return "/placeholder.png";
  return images[0]?.url ?? "/placeholder.png";
};

const getTotalQuantity = (inventories?: ProductInventory[]): number => {
  if (!inventories?.length) return 0;
  return inventories.reduce((sum, inv) => sum + (inv?.quantity ?? 0), 0);
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductPriceUpdate = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    title: string;
    price: string;
    inventoryQuantity?: number;
    colorStocks?: { colorId: string; colorName?: string; stock: number }[];
  } | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const {
    data: productsRes,
    isLoading,
    refetch,
  } = useGetProductInventoriesQuery({});

  if (isLoading) return <TableSkeleton />;

  const allProducts: IProduct[] = productsRes?.data ?? productsRes ?? [];

  // Client-side search
  const filtered = searchTerm
    ? allProducts.filter(
        (p) =>
          p?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p?.id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : allProducts;

  const totalPages = Math.ceil(filtered.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleEdit = (product: IProduct) => {
    // Map productColors → colorStocks format expected by EditPriceModal
    setSelectedProduct({
      id: product.id,
      title: product.title,
      price: product.price,
      inventoryQuantity: getTotalQuantity(product.productInventories),
      colorStocks: product.productColors?.map((color) => ({
        colorId: color.id,
        colorName: color.name,
        stock: color.stock,
      })) ?? [],
    });
    setOpenEditModal(true);
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      {/* Search */}
      <div className="mb-4">
        <form onSubmit={handleSearch} className="w-full max-w-sm">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            clearSearch={clearSearch}
          />
        </form>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-center w-10">#</TableHead>
              <TableHead className="text-center">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-center">Price</TableHead>
              <TableHead className="text-center">Total Qty</TableHead>
              <TableHead className="text-center">Colors & Stock</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={item?.id}>
                  {/* # */}
                  <TableCell className="text-center text-gray-500 text-sm">
                    {startIndex + index + 1}
                  </TableCell>

                  {/* Image */}
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <img
                        src={getProductImage(item?.productImages)}
                        alt={item?.title ?? "product"}
                        className="w-12 h-12 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.png";
                        }}
                      />
                    </div>
                  </TableCell>

                  {/* Title */}
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {item?.title ?? "—"}
                    </p>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      ৳{Number(item?.price ?? 0).toLocaleString()}
                    </span>
                  </TableCell>

                  {/* Total Quantity */}
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-gray-700">
                      {getTotalQuantity(item?.productInventories)}
                    </span>
                  </TableCell>

                  {/* Colors & Stock */}
                  <TableCell className="text-center">
                    {item?.productColors?.length ? (
                      <div className="flex items-center justify-center gap-1.5">
                        {item.productColors.slice(0, 2).map((color) => (
                          <div
                            key={color?.id}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-700 whitespace-nowrap"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0"
                              style={{
                                backgroundColor: color?.hexCode ?? "#ccc",
                              }}
                            />
                            <span>{color?.name ?? "—"}</span>
                            <span className="text-gray-400">·</span>
                            <span className="font-medium">
                              {color?.stock ?? 0}
                            </span>
                          </div>
                        ))}

                        {item.productColors.length > 2 && (
                          <div className="relative group">
                            <span className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-100 text-xs text-gray-500 cursor-default whitespace-nowrap">
                              +{item.productColors.length - 2} more
                            </span>
                            <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-max">
                              {item.productColors.slice(2).map((color) => (
                                <div
                                  key={color?.id}
                                  className="flex items-center gap-1.5 text-xs text-gray-700"
                                >
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0"
                                    style={{
                                      backgroundColor: color?.hexCode ?? "#ccc",
                                    }}
                                  />
                                  <span>{color?.name ?? "—"}</span>
                                  <span className="text-gray-400">·</span>
                                  <span className="font-medium">
                                    {color?.stock ?? 0}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No colors</span>
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="pl-2 pt-4">
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            if (page < 1 || page > totalPages || page === currentPage) return;
            setCurrentPage(page);
          }}
          totalItems={filtered.length}
          itemsPerPage={limit}
        />
      </div>

      {selectedProduct && openEditModal && (
        <EditPriceModal
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          productData={selectedProduct}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default ProductPriceUpdate;