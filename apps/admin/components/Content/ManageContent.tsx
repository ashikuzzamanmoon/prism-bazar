"use client";

import React, { useMemo, useState } from "react";
import {
  useGetAllContentsQuery,
  useDeleteContentMutation,
} from "@/redux/Api/contentApi";
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
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Package,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import SearchBar from "@/components/Common/SearchBar";
import ConfirmationAlert from "@/components/Common/ConfirmationAlert";
import { PaginationControl } from "@/components/Common/Pagination";
import { filterDeleteData } from "@/utlits/filterDeleteData";
import { IMeta } from "@/types/metaTypes";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IContent {
  id: string;
  title: string;
  description: string | null;
  number: number | null;
  image: string | null;
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
            !value && "text-gray-400",
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">
            {dateValue ? format(dateValue, "dd MMM yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-lg border-gray-200"
        align="start"
      >
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

const ManageContent = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<IContent | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      searchTerm: searchTerm.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [currentPage, limit, searchTerm, startDate, endDate],
  );

  const {
    data: contents,
    isLoading,
    isError,
    refetch,
  } = useGetAllContentsQuery(queryParams);
  const [deleteContent, { isLoading: isDeleting }] = useDeleteContentMutation();

  if (isLoading) return <TableSkeleton />;
  if (isError)
    return <p className="text-red-500 p-4">Failed to fetch contents.</p>;

  const contentFilterData = filterDeleteData(contents) || [];
  const contentData: IContent[] =
    contentFilterData?.data?.data || contentFilterData?.data || [];
  const contentMetaData: IMeta = contentFilterData?.data?.meta || {};

  const totalPages = Number(contentMetaData?.totalPages || 1);
  const totalItems = Number(contentMetaData?.total || contentData.length);

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
    setStartDate("");
    setEndDate("");
  };

  const handleEdit = (content: IContent) => {
    setSelectedContent(content);
    setOpenEditModal(true);
  };

  const handleView = (content: IContent) => {
    setSelectedContent(content);
    setOpenViewModal(true);
  };

  const handleDeleteClick = (content: IContent) => {
    setSelectedContent(content);
    setOpenDeleteModal(true);
    setDropdownOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContent) return;
    try {
      const response = await deleteContent(selectedContent.id).unwrap();
      if (response.statusCode === 200) {
        toast.success(response.message);
        refetch();
      } else {
        toast.error(response.message || "Failed to delete content");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete content");
    } finally {
      setOpenDeleteModal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <form onSubmit={handleSearch} className="w-full xl:w-72 shrink-0">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            clearSearch={clearSearch}
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <DatePickerField
            value={startDate}
            onChange={(v) => {
              setStartDate(v);
              setCurrentPage(1);
            }}
            placeholder="Start date"
          />
          <DatePickerField
            value={endDate}
            onChange={(v) => {
              setEndDate(v);
              setCurrentPage(1);
            }}
            placeholder="End date"
          />
          <CreateContent refetch={refetch} />
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="flex items-center justify-between text-sm text-gray-500 px-1">
        <div className="flex items-center gap-1.5">
          <Package className="h-4 w-4" />
          <span>
            Showing{" "}
            <span className="font-medium text-gray-800">
              {contentData.length}
            </span>{" "}
            of <span className="font-medium text-gray-800">{totalItems}</span>{" "}
            contents
          </span>
        </div>
        <span>
          Page <span className="font-medium text-gray-700">{currentPage}</span>{" "}
          / {totalPages}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="border rounded-md overflow-hidden ">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {contentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Package className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No contents found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              contentData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-500 text-sm">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>

                  <TableCell>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-sm font-medium text-gray-900">
                    {item.title}
                  </TableCell>

                  <TableCell className="text-sm text-gray-500">
                    {item.number ?? "—"}
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
                          Edit Content
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Content
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
          className="h-8 text-sm text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 transition-colors px-3 whitespace-nowrap"
          onClick={handleReset}
        >
          Reset Filters
        </Button>
      </div>

      {/* ── Modals ── */}
      <ViewContent
        isOpen={openViewModal}
        onClose={() => setOpenViewModal(false)}
        content={selectedContent}
      />
      <UpdateContent
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        content={selectedContent}
        refetch={refetch}
      />
      <ConfirmationAlert
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Content"
        description={`Are you sure you want to delete "${selectedContent?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageContent;

// ─── Dummy Select (to avoid import error if not available in current scope) ───
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ViewContent from "./ViewContent";
import UpdateContent from "./UpdateContent";
import CreateContent from "./CreateContent";
