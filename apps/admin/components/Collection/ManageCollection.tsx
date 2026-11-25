"use client";

import React, { useMemo, useState } from "react";
import {
  useGetAllCollectionsQuery,
  useDeleteCollectionMutation,
  useUpdateCollectionMutation,
  useUpdateHomeShowStatusMutation,
} from "@/redux/Api/collectionApi";
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
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  ToggleLeft,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import SearchBar from "@/components/Common/SearchBar";
import ConfirmationAlert from "@/components/Common/ConfirmationAlert";
import { PaginationControl } from "@/components/Common/Pagination";
import { filterDeleteData } from "@/utlits/filterDeleteData";
import { IMeta } from "@/types/metaTypes";
import ViewCollection from "./ViewCollection";
import CreateCollection from "./CreateCollection";
import UpdateCollection from "./UpdateCollection";
import CollectionFiltersPopover, {
  CollectionFiltersValue,
} from "./CollectionFiltersPopover";

export interface ICollection {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isHomeShow: boolean;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ManageCollection = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isActive, setIsActive] = useState<"all" | "true" | "false">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectCollection, setSelectCollection] = useState<ICollection | null>(
    null,
  );
  const [selectedCollection, setSelectedCollection] =
    useState<ICollection | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      page: currentPage,
      limit,
      searchTerm: searchTerm.trim() || undefined,
      isActive: isActive !== "all" ? isActive === "true" : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [currentPage, limit, searchTerm, isActive, startDate, endDate],
  );

  const filterValues: CollectionFiltersValue = {
    isActive,
    startDate,
    endDate,
  };

  const {
    data: fetchCollection,
    isLoading,
    isError,
    refetch,
  } = useGetAllCollectionsQuery(query);

  const [deleteCollection, { isLoading: isDeleting }] =
    useDeleteCollectionMutation();
  const [updateCollection, { isLoading: isUpdating }] =
    useUpdateCollectionMutation();
  const [updateHomeShowStatus, { isLoading: isHomeShowUpdating }] =
    useUpdateHomeShowStatusMutation();

  if (isLoading) return <TableSkeleton />;
  if (isError)
    return <p className="text-red-500 p-4">Failed to fetch collections.</p>;

  const collectionData: ICollection[] = fetchCollection?.data?.data || [];
  const collectionMetaData: IMeta = fetchCollection?.data?.meta ||
    fetchCollection?.data?.meta || {
      page: 1,
      limit,
      total: 0,
    };
  const totalPages = Math.ceil(
    collectionMetaData.total / collectionMetaData.limit,
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
    setLimit(10);
    setIsActive("all");
    setStartDate("");
    setEndDate("");
  };

  const handleEdit = (collection: ICollection) => {
    setSelectCollection(collection);
    setOpenEditModal(true);
  };

  const handleView = (collection: ICollection) => {
    setSelectedCollection(collection);
    setOpenViewModal(true);
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await updateCollection({
        id,
        data: { isActive: active },
      }).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error("Failed to update collection status!");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update collection status");
    }
  };

  const handleToggleHomeShow = async (id: string, homeShow: boolean) => {
    try {
      const response = await updateHomeShowStatus({
        id,
        data: { isHomeShow: homeShow },
      }).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error("Failed to update home show status!");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update home show status");
    }
  };

  const handleDeleteClick = (collection: ICollection) => {
    setSelectedCollection(collection);
    setOpenDeleteModal(true);
    setDropdownOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCollection) return;
    try {
      const response = await deleteCollection(selectedCollection.id).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error(response.message || "Failed to delete collection");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete collection");
    } finally {
      setOpenDeleteModal(false);
      setSelectedCollection(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Search + Create */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <form onSubmit={handleSearch} className="w-full max-w-sm">
            <SearchBar
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              searchTerm={searchTerm}
              clearSearch={clearSearch}
            />
          </form>
          <div className=" flex items-center gap-3">
            <CreateCollection />
            <div className="flex items-center gap-2">
              <CollectionFiltersPopover
                values={filterValues}
                onChange={(changes) => {
                  setCurrentPage(1);
                  if ("isActive" in changes)
                    setIsActive(changes.isActive ?? "all");
                  if ("startDate" in changes)
                    setStartDate(changes.startDate ?? "");
                  if ("endDate" in changes) setEndDate(changes.endDate ?? "");
                }}
                onReset={() => {
                  setCurrentPage(1);
                  setIsActive("all");
                  setStartDate("");
                  setEndDate("");
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Filters */}
      </div>

      {/* ── Table ── */}
      <div className="border rounded-md overflow-hidden ">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Home Show</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {collectionData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Package className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No collections found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              collectionData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-500 text-sm">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>

                  <TableCell className="text-sm font-medium text-gray-900">
                    {item.name}
                  </TableCell>

                  <TableCell className="text-sm text-gray-500">
                    {item.slug}
                  </TableCell>

                  <TableCell>
                    <Switch
                      disabled={isUpdating}
                      checked={item.isActive}
                      onCheckedChange={(checked) =>
                        handleToggleActive(item.id, checked)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Switch
                      disabled={isHomeShowUpdating}
                      checked={item.isHomeShow}
                      onCheckedChange={(checked) =>
                        handleToggleHomeShow(item.id, checked)
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
                          Edit Collection
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleToggleActive(item.id, !item.isActive)
                          }
                        >
                          <ToggleLeft className="mr-2 h-4 w-4" />
                          {item.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleToggleHomeShow(item.id, !item.isHomeShow)
                          }
                        >
                          <ToggleLeft className="mr-2 h-4 w-4" />
                          {item.isHomeShow ? "Hide from Home" : "Show on Home"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Collection
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
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={collectionMetaData?.total}
          itemsPerPage={collectionMetaData?.limit}
        />

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
            onClick={handleReset}
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
          itemName={selectedCollection?.name}
          isLoading={isDeleting}
        />
      )}

      {selectCollection && openEditModal && (
        <UpdateCollection
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          collectionData={selectCollection}
        />
      )}

      {selectedCollection && openViewModal && (
        <ViewCollection
          open={openViewModal}
          onOpenChange={setOpenViewModal}
          collectionData={selectedCollection}
        />
      )}
    </div>
  );
};

export default ManageCollection;
