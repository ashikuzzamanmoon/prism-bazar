"use client";

import React, { useState } from "react";
import {
  useBannerPublishMutation,
  useBannerSidePublishMutation,
  useDeleteBannerMutation,
  useGetAllBannersQuery,
} from "@/redux/Api/bannerApi";
import { IBanner } from "@/types/banner.type";
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
import CreateBanner from "./Createbanner";
import UpdateBanner from "./UpdateBanner";
import ViewBanner from "./ViewBanner";
import ConfirmationAlert from "../Common/ConfirmationAlert";
import { PaginationControl } from "../Common/Pagination";
import { filterDeleteData } from "@/utlits/filterDeleteData";
import { IMeta } from "@/types/metaTypes";

const BannerTable = () => {
  const [selectBanner, setSelectBanner] = useState<IBanner | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedBanner, setSelectedBanner] = useState<IBanner | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  const { data: banner, isLoading, refetch } = useGetAllBannersQuery({});
  const [publishBanner, { isLoading: publishing }] = useBannerPublishMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const [bannerSidePublish, { isLoading: isSidePublishing }] =
    useBannerSidePublishMutation();

  if (isLoading) {
    return (
      <div>
        <TableSkeleton />
      </div>
    );
  }

  const bannerFilterData = filterDeleteData(banner) || [];

  const bannerData: IBanner[] =
    bannerFilterData?.data?.data || bannerFilterData?.data || [];
  const bannerMetaData: IMeta = bannerFilterData?.data?.meta || {};

  // console.log("Banner Data", bannerData);
  // console.log("Banner meta Data", bannerMetaData);

  const totalPages = Math.ceil(bannerData.length / limit);

  // Paginate data
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = bannerData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };
  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };
  const handleEdit = (banner: IBanner) => {
    setSelectBanner(banner);
    setOpenEditModal(true);
  };
  const handleView = (banner: IBanner) => {
    setSelectedBanner(banner);
    setOpenViewModal(true);
  };

  const handleBannerPublish = async (id: string, isPublish: boolean) => {
    try {
      const response = await publishBanner({
        id,
        publish: { publish: isPublish },
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

  const handleBannerSidePublish = async (id: string, isSide: boolean) => {
    try {
      const response = await bannerSidePublish({
        id,
        side: { side: isSide },
      }).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error("Failed to update side publish status!");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update side publish status");
    }
  };

  const handleDeleteClick = (banner: IBanner) => {
    setSelectedBanner(banner);
    setOpenDeleteModal(true);
    setDropdownOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBanner) return;

    try {
      const response = await deleteBanner(selectedBanner.id).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error(response.message || "Failed to delete banner");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete banner");
    } finally {
      setOpenDeleteModal(false);
      setSelectedBanner(null);
    }
  };

  return (
    <div className=" bg-white p-3">
      <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-2">
        <form onSubmit={handleSearch} className="w-full max-w-sm ">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            clearSearch={clearSearch}
          />
        </form>
        {/* <Button>Create Banner</Button> */}
        <CreateBanner />
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Publish</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData?.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <img
                    src={item.image}
                    alt={item.title}
                    width={60}
                    height={60}
                    className="aspect-square object-cover rounded-sm"
                  />
                </TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.slug}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>
                  <Switch
                    disabled={publishing}
                    checked={item.isPublish}
                    onCheckedChange={(checked) =>
                      handleBannerPublish(item.id, checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    disabled={isSidePublishing}
                    checked={item.isSide}
                    onCheckedChange={(checked) =>
                      handleBannerSidePublish(item.id, checked)
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
                        Edit Banner
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleBannerPublish(item.id, !item.isPublish)
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
                        Delete Banner
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* <DeleteConfirmationModal
        open={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm deletion"
        description={`Are you sure you want to delete the banner "${selectedBanner?.title}"?`}
        confirmButtonText="Yes, delete"
        isLoading={isDeleting}
      /> */}

      <div className="pl-2 pt-4">
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={bannerData?.length}
          itemsPerPage={limit}
        />
      </div>

      {openDeleteModal && (
        <ConfirmationAlert
          isOpen={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          actionType="delete"
          itemName={selectBanner?.title}
          isLoading={isDeleting}
        />
      )}

      {selectBanner && openEditModal && (
        <UpdateBanner
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          bannerData={selectBanner}
        />
      )}

      {selectedBanner && openViewModal && (
        <ViewBanner
          open={openViewModal}
          onOpenChange={setOpenViewModal}
          bannerData={selectedBanner}
        />
      )}
    </div>
  );
};

export default BannerTable;
