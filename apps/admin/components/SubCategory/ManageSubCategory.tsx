"use client";

import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MoreHorizontal, Trash2, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "../Common/TableSkeleton";
import SearchBar from "../Common/SearchBar";
import ConfirmationAlert from "../Common/ConfirmationAlert";
import { PaginationControl } from "../Common/Pagination";
import {
  useDeleteSubCategoryMutation,
  useGetAllSubCategoryQuery,
} from "@/redux/Api/sub-categoryApi";
import CreateSubCategory from "./CreateSubCategory";
import ViewSubCategory from "./ViewSubCategory";
import UpdateSubCategory from "./UpdateSubCategory";
import { filterDeleteData } from "@/utlits/filterDeleteData";
import { IMeta } from "@/types/metaTypes";

export interface ISubCategoryCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ISubCategory {
  id: string;
  name: string;
  slug: string;
  categories: ISubCategoryCategory[];
}

const ManageSubCategory = () => {
  const [selectSubCategory, setSelectSubCategory] =
    useState<ISubCategory | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<ISubCategory | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  const {
    data: fetchSubCategories,
    isLoading,
    isError,
    refetch,
  } = useGetAllSubCategoryQuery(undefined);

  const [deleteSubCategory, { isLoading: isDeleting }] =
    useDeleteSubCategoryMutation();

  if (isLoading) {
    return (
      <div>
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500 p-4">Failed to fetch sub categories.</p>;
  }

  const subCategoryFilterData = filterDeleteData(fetchSubCategories);

  const subCategoryData: ISubCategory[] =
    subCategoryFilterData?.data?.data || subCategoryFilterData?.data || [];
  const subCategoryMetaData: IMeta = subCategoryFilterData?.data?.meta || {};

  // Filter data based on searchTerm
  const filteredData = subCategoryData.filter((subCategory) => {
    const search = searchTerm.toLowerCase();
    return (
      subCategory.name.toLowerCase().includes(search) ||
      subCategory.slug.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredData.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

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

  const handleEdit = (subCategory: ISubCategory) => {
    setSelectSubCategory(subCategory);
    setOpenEditModal(true);
  };

  const handleView = (subCategory: ISubCategory) => {
    setSelectedSubCategory(subCategory);
    setOpenViewModal(true);
  };

  const handleDeleteClick = (subCategory: ISubCategory) => {
    setSelectedSubCategory(subCategory);
    setOpenDeleteModal(true);
    setDropdownOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSubCategory) return;

    try {
      const response = await deleteSubCategory(selectedSubCategory.id).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error(response.message || "Failed to delete sub category");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete sub category");
    } finally {
      setOpenDeleteModal(false);
      setSelectedSubCategory(null);
    }
  };

  return (
    <div className=" bg-white p-3">
      <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-2">
        <form onSubmit={handleSearch} className="w-full max-w-sm">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            clearSearch={clearSearch}
          />
        </form>
        <CreateSubCategory />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-6"
                >
                  No sub categories found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell className="pl-10">
                    {item?.categories?.length}
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
                          Edit Sub Category
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Sub Category
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

      <div className="pl-2 pt-4">
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredData.length}
          itemsPerPage={limit}
        />
      </div>

      {openDeleteModal && (
        <ConfirmationAlert
          isOpen={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          actionType="delete"
          itemName={selectedSubCategory?.name}
          isLoading={isDeleting}
        />
      )}

      {selectSubCategory && openEditModal && (
        <UpdateSubCategory
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          subCategoryData={selectSubCategory}
        />
      )}

      {selectedSubCategory && openViewModal && (
        <ViewSubCategory
          open={openViewModal}
          onOpenChange={setOpenViewModal}
          subCategoryData={selectedSubCategory}
        />
      )}
    </div>
  );
};

export default ManageSubCategory;
