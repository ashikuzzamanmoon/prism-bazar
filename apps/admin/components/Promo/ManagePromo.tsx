"use client";

import React, { useMemo, useState } from "react";
import {
  useGetAllPromoCodeQuery,
  useDeletePromoCodeMutation,
} from "@/redux/Api/promoApi";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Trash2, Edit, Eye, Package, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import SearchBar from "@/components/Common/SearchBar";
import ConfirmationAlert from "@/components/Common/ConfirmationAlert";
import { PaginationControl } from "@/components/Common/Pagination";
import { filterDeleteData } from "@/utlits/filterDeleteData";
import { IMeta } from "@/types/metaTypes";
import ViewPromo from "./ViewPromo";
import CreatePromo from "./CreatePromo";
import UpdatePromo from "./UpdatePromo";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IPromoCode {
  id: string;
  code: string;
  discount: string;
  type: "FLAT" | "PERCENT";
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  isDeleted: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

const DatePickerField = ({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const dateValue = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-36 justify-start text-left text-sm font-normal bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors",
            !value && "text-gray-400"
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">
            {dateValue ? format(dateValue, "dd MMM yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-lg border-gray-200" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          initialFocus
        />
        {value && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-500 hover:text-red-500"
              onClick={() => onChange("")}
            >
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ManagePromo = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [promoType, setPromoType] = useState<"all" | "FLAT" | "PERCENT">("all");
  const [isActive, setIsActive] = useState<"all" | "true" | "false">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectPromo, setSelectPromo] = useState<IPromoCode | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<IPromoCode | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      searchTerm: searchTerm.trim() || undefined,
      type: promoType !== "all" ? promoType : undefined,
      isActive: isActive !== "all" ? isActive === "true" : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [currentPage, limit, searchTerm, promoType, isActive, startDate, endDate]
  );

  const { data: fetchPromo, isLoading, isError, refetch } = useGetAllPromoCodeQuery(queryParams);
  const [deletePromo, { isLoading: isDeleting }] = useDeletePromoCodeMutation();

  if (isLoading) return <TableSkeleton />;
  if (isError) return <p className="text-red-500 p-4">Failed to fetch promo codes.</p>;

  const promoFilterData = filterDeleteData(fetchPromo);
  const promoData: IPromoCode[] =
    promoFilterData?.data?.data || promoFilterData?.data || [];
  const promoMetaData: IMeta = promoFilterData?.data?.meta || {};

  const totalPages = Number(promoMetaData?.totalPages || 1);
  const totalItems = Number(promoMetaData?.total || promoData.length);

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
    setPromoType("all");
    setIsActive("all");
    setStartDate("");
    setEndDate("");
  };

  const handleEdit = (promo: IPromoCode) => {
    setSelectPromo(promo);
    setOpenEditModal(true);
  };

  const handleView = (promo: IPromoCode) => {
    setSelectedPromo(promo);
    setOpenViewModal(true);
  };

  const handleDeleteClick = (promo: IPromoCode) => {
    setSelectedPromo(promo);
    setOpenDeleteModal(true);
    setDropdownOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPromo) return;
    try {
      const response = await deletePromo(selectedPromo.id).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error(response.message || "Failed to delete promo code");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete promo code");
    } finally {
      setOpenDeleteModal(false);
      setSelectedPromo(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3">

        {/* Row 1: Search + Create (always together) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <form onSubmit={handleSearch} className="w-full max-w-sm">
            <SearchBar
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              searchTerm={searchTerm}
              clearSearch={clearSearch}
            />
          </form>
          <CreatePromo />
        </div>

        {/* Row 2: Filters — wrap nicely on all sizes */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Type */}
          <Select
            value={promoType}
            onValueChange={(val) => {
              setPromoType(val as "all" | "FLAT" | "PERCENT");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-36 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="FLAT">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  Flat (৳)
                </span>
              </SelectItem>
              <SelectItem value="PERCENT">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                  Percent (%)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Active Status */}
          <Select
            value={isActive}
            onValueChange={(val) => {
              setIsActive(val as "all" | "true" | "false");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-36 text-sm bg-white border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  Active
                </span>
              </SelectItem>
              <SelectItem value="false">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  Inactive
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Start Date */}
          <DatePickerField
            value={startDate}
            onChange={(v) => { setStartDate(v); setCurrentPage(1); }}
            placeholder="Start date"
          />

          {/* End Date */}
          <DatePickerField
            value={endDate}
            onChange={(v) => { setEndDate(v); setCurrentPage(1); }}
            placeholder="End date"
          />

        </div>
      </div>

      {/* ── Summary ── */}
      <div className="flex items-center justify-between text-sm text-gray-500 px-1">
        <div className="flex items-center gap-1.5">
          <Package className="h-4 w-4" />
          <span>
            Showing{" "}
            <span className="font-medium text-gray-800">{promoData.length}</span> of{" "}
            <span className="font-medium text-gray-800">{totalItems}</span> promo codes
          </span>
        </div>
        <span>
          Page <span className="font-medium text-gray-700">{currentPage}</span> / {totalPages}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {promoData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Package className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No promo codes found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              promoData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-500 text-sm">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>

                  <TableCell>
                    <span className="font-mono font-semibold text-sm text-gray-900">
                      {item.code}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm font-medium text-gray-800">
                    {item.type === "FLAT" ? "৳" : ""}
                    {item.discount}
                    {item.type === "PERCENT" ? "%" : ""}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.type === "FLAT"
                          ? "border-blue-200 text-blue-700 bg-blue-50 text-xs"
                          : "border-purple-200 text-purple-700 bg-purple-50 text-xs"
                      }
                    >
                      {item.type}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {item.usedCount}
                      <span className="text-gray-400">/{item.usageLimit}</span>
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={
                        isExpired(item.expiresAt)
                          ? "text-red-500 text-sm"
                          : "text-sm text-gray-600"
                      }
                    >
                      {formatDate(item.expiresAt)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Switch checked={item.isActive} />
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
                          Edit Promo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Promo
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
          onPageChange={(page) => {
            if (page < 1 || page > totalPages || page === currentPage) return;
            setCurrentPage(page);
          }}
          totalItems={totalItems}
          itemsPerPage={limit}
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
            className="h-8 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors px-3 whitespace-nowrap"
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
          itemName={selectedPromo?.code}
          isLoading={isDeleting}
        />
      )}

      {selectPromo && openEditModal && (
        <UpdatePromo
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          promoData={selectPromo}
        />
      )}

      {selectedPromo && openViewModal && (
        <ViewPromo
          open={openViewModal}
          onOpenChange={setOpenViewModal}
          promoData={selectedPromo}
        />
      )}
    </div>
  );
};

export default ManagePromo;