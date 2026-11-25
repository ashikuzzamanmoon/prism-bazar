"use client";

import React, { useState } from "react";
import {
  useGetAllCategoryQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/redux/Api/categoryApi";
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
import ViewCategory from "./ViewCategory";
import CreateCategory from "./CreateCategory";
import UpdateCategory from "./UpdateCategory";
import { filterDeleteData } from "@/utlits/filterDeleteData";
import { Switch } from "../ui/switch";
import { IMeta } from "@/types/metaTypes";

export interface ICategoryCollection {
  id: string;
  name: string;
  slug: string;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  isDelete?: boolean;
  collections: ICategoryCollection[];
}

const ManageCategory = () => {
  const [selectCategory, setSelectCategory] = useState<ICategory | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  const {
    data: fetchCategories,
    isLoading,
    isError,
    refetch,
  } = useGetAllCategoryQuery(undefined);

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  if (isLoading) {
    return (
      <div>
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500 p-4">Failed to fetch categories.</p>;
  }

  const categoryFilterData = filterDeleteData(fetchCategories);

  const categoryData: ICategory[] =
    categoryFilterData?.data?.data || categoryFilterData?.data || [];
  const categoryMetaData: IMeta = categoryFilterData?.data?.meta || {};

  // Filter data based on searchTerm
  const filteredData = categoryData.filter((category) => {
    const search = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(search) ||
      category.slug.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredData.length / limit);

  // Paginate data
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset to first page on search
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1); // Reset to first page on clear
  };

  const handleEdit = (category: ICategory) => {
    setSelectCategory(category);
    setOpenEditModal(true);
  };

  const handleView = (category: ICategory) => {
    setSelectedCategory(category);
    setOpenViewModal(true);
  };

  const handleDeleteClick = (category: ICategory) => {
    setSelectedCategory(category);
    setOpenDeleteModal(true);
    setDropdownOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      const response = await deleteCategory(selectedCategory.id).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category");
    } finally {
      setOpenDeleteModal(false);
      setSelectedCategory(null);
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
        <CreateCategory />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Collections</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-6"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell className="pl-10">
                    {item?.collections?.length}
                  </TableCell>
                  <TableCell>
                    <Switch
                      // disabled={isUpdating}
                      checked={item.isActive}
                      // onCheckedChange={(checked) =>
                      //   handleToggleActive(item.id, checked)
                      // }
                    />
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
                          Edit Category
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Category
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
          totalItems={filteredData?.length}
          itemsPerPage={limit}
        />
      </div>

      {openDeleteModal && (
        <ConfirmationAlert
          isOpen={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          actionType="delete"
          itemName={selectedCategory?.name}
          isLoading={isDeleting}
        />
      )}

      {selectCategory && openEditModal && (
        <UpdateCategory
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          categoryData={selectCategory}
        />
      )}

      {selectedCategory && openViewModal && (
        <ViewCategory
          open={openViewModal}
          onOpenChange={setOpenViewModal}
          categoryData={selectedCategory}
        />
      )}
    </div>
  );
};

export default ManageCategory;
