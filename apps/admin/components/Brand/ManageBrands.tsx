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
import { MoreHorizontal, Trash2, Edit, Globe, Eye } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { TableSkeleton } from "../Common/TableSkeleton";
import SearchBar from "../Common/SearchBar";
import ConfirmationAlert from "../Common/ConfirmationAlert";
import { PaginationControl } from "../Common/Pagination";
import {
  useDeleteBrandMutation,
  useGetAllBrandsQuery,
  useUpdateBrandMutation,
} from "@/redux/Api/brandApi";
import CreateBrand from "./CreateBrand";
import ViewBrand from "./ViewBrand";
import UpdateBrand from "./UpdateBrand";
import { filterDeleteData } from "@/utlits/filterDeleteData";
import { IMeta } from "@/types/metaTypes";
import SortingBrandOrder, {
  SortingBrandOrderButton,
} from "./SortingBrandOrder";

export interface IBrand {
  id: string;
  title: string;
  slug: string;
  isDelete: boolean;
  isPublish: boolean;
  createdAt: string;
  updatedAt: string;
  image: string;
  order: number;
}

const ManageBrands = () => {
  const [selectBrand, setSelectBrand] = useState<IBrand | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [openSortModal, setOpenSortModal] = useState(false);
  const [publishBrand, { isLoading: publishing }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const query: Record<string, any> = {
    page: currentPage,
    limit,
  };

  if (searchTerm) {
    query.searchTerm = searchTerm;
  }

  const { data: fetchData, isLoading, refetch } = useGetAllBrandsQuery(query);

  if (isLoading) {
    return (
      <div>
        <TableSkeleton />
      </div>
    );
  }

  const brandData: IBrand[] = fetchData?.data?.data || [];
  const brandMetaData: IMeta = fetchData?.data?.meta ||
    fetchData?.data?.meta || {
      page: 1,
      limit,
      total: 0,
    };
  const totalPages = Math.ceil(brandMetaData.total / brandMetaData.limit);

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

  const handleEdit = (brand: IBrand) => {
    setSelectBrand(brand);
    setOpenEditModal(true);
  };

  const handleView = (brand: IBrand) => {
    setSelectedBrand(brand);
    setOpenViewModal(true);
  };

  const handleBrandPublish = async (id: string, isPublish: boolean) => {
    try {
      const response = await publishBrand({
        id,
        data: { isPublish },
      }).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error("Failed to update publish status!");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update publish status");
    }
  };

  const handleDeleteClick = (brand: IBrand) => {
    setSelectedBrand(brand);
    setOpenDeleteModal(true);
    setDropdownOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBrand) return;

    try {
      const response = await deleteBrand(selectedBrand.id).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error(response.message || "Failed to delete brand");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete brand");
    } finally {
      setOpenDeleteModal(false);
      setSelectedBrand(null);
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
        <div className="flex gap-2">
          <SortingBrandOrderButton onClick={() => setOpenSortModal(true)} />
          <CreateBrand />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Publish</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brandData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-6"
                >
                  No brands found.
                </TableCell>
              </TableRow>
            ) : (
              brandData?.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={item.image}
                      alt={item.title}
                      width={60}
                      height={60}
                      className="aspect-square object-contain rounded-sm"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell>{item.order}</TableCell>
                  <TableCell>
                    <Switch
                      //   disabled={publishing}
                      checked={item.isPublish}
                      onCheckedChange={(checked) =>
                        handleBrandPublish(item.id, checked)
                      }
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
                          Edit Brand
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleBrandPublish(item.id, !item.isPublish)
                          }
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          {item.isPublish ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Brand
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
          totalItems={brandMetaData?.total}
          itemsPerPage={brandMetaData?.limit}
        />
      </div>

      {openDeleteModal && (
        <ConfirmationAlert
          isOpen={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          actionType="delete"
          itemName={selectedBrand?.title}
          isLoading={isDeleting}
        />
      )}

      {selectBrand && openEditModal && (
        <UpdateBrand
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          brandData={selectBrand}
        />
      )}

      {selectedBrand && openViewModal && (
        <ViewBrand
          open={openViewModal}
          onOpenChange={setOpenViewModal}
          brandData={selectedBrand}
        />
      )}

      <SortingBrandOrder open={openSortModal} onOpenChange={setOpenSortModal} />
    </div>
  );
};

export default ManageBrands;
