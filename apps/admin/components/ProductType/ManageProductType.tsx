"use client";

import React, { useState } from "react";
import {
  useGetAllProductTypesQuery,
  useDeleteProductTypeMutation,
} from "@/redux/Api/productTypeApi";
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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit, Package } from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import SearchBar from "@/components/Common/SearchBar";
import ConfirmationAlert from "@/components/Common/ConfirmationAlert";
import CreateProductType from "./CreateProductType";
import UpdateProductType from "./UpdateProductType";

const ManageProductType = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: productTypesResponse, isLoading, isError, refetch } =
    useGetAllProductTypesQuery(undefined);
  const [deleteProductType, { isLoading: isDeleting }] =
    useDeleteProductTypeMutation();

  const productTypes = productTypesResponse?.data || [];

  const filteredData = productTypes.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  const handleEdit = (item: any) => {
    setSelectedProductType(item);
    setOpenEditModal(true);
  };

  const handleDeleteClick = (item: any) => {
    setSelectedProductType(item);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductType) return;
    try {
      const response = await deleteProductType(selectedProductType.id).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete product type");
    } finally {
      setOpenDeleteModal(false);
    }
  };

  if (isLoading) return <TableSkeleton />;
  if (isError) return <p className="text-red-500 p-4">Failed to fetch product types.</p>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Product Type</h1>
          <p className="text-sm text-gray-500 text-nowrap">Manage your product categorization types here.</p>
        </div>
        <CreateProductType refetch={refetch} />
      </div>

      <div className="mb-6 max-w-sm">
        <form onSubmit={handleSearch}>
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            clearSearch={clearSearch}
          />
        </form>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-10 w-10 opacity-20" />
                    <p>No product types found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item: any, index: number) => (
                <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-500">{index + 1}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{item.name}</TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4 text-blue-500" />
                          Edit Type
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Type
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

      <UpdateProductType
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        productType={selectedProductType}
        refetch={refetch}
      />

      <ConfirmationAlert
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product Type"
        description={`Are you sure you want to delete "${selectedProductType?.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageProductType;
