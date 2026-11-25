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
import {
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  UserPlus,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "../Common/TableSkeleton";
import SearchBar from "../Common/SearchBar";
import { PaginationControl } from "../Common/Pagination";
import ConfirmationAlert from "../Common/ConfirmationAlert";
import {
  useDeleteUserMutation,
  useGetAllUserQuery,
} from "@/redux/Api/userApi";
import CreateAdmin from "./CreateAdmin";
import ViewUser from "./ViewUser";
import UpdateUser from "./UpdateUser";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  bio: string | null;
  profilePicture: string | null;
  coveragePicture: string | null;
  dateOfBirth: string | null;
  postalCode: string | null;
  thana: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isVerified: boolean;
  lastLogin: string | null;
  totalLogins: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const avatarColors = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
];

const getAvatarColor = (id: string) => {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarColors[sum % avatarColors.length];
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const UserAvatar = ({ item }: { item: IUser }) => {
  const [imgError, setImgError] = useState(false);
  const colorClass = getAvatarColor(item.id);

  if (item.profilePicture && !imgError) {
    return (
      <img
        src={item.profilePicture}
        alt={item.name ?? "user"}
        className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}
    >
      <User className="h-4 w-4" />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ManageUsers = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const { data: fetchData, isLoading, refetch } = useGetAllUserQuery({});
  const [deleteUser] = useDeleteUserMutation();

  if (isLoading) return <TableSkeleton />;

  const allUsers: IUser[] = fetchData?.data ?? [];

  // Client-side search
  const filtered = searchTerm
    ? allUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.phoneNumber?.includes(searchTerm) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : allUsers;

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

  const handleView = (user: IUser) => {
    setSelectedUser(user);
    setOpenViewModal(true);
    setDropdownOpenId(null);
  };

  const handleDeleteClick = (user: IUser) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
    setDropdownOpenId(null);
  };

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setOpenUpdateModal(true);
    setDropdownOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    const toastId = toast.loading("Deleting user...");

    try {
      const response = await deleteUser(selectedUser.id).unwrap();

      toast.success(response?.message || "User deleted successfully", {
        id: toastId,
        duration: 1000,
      });
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user", {
        id: toastId,
        duration: 1000,
      });
    } finally {
      setOpenDeleteModal(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="bg-white p-3">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-3">
        <form onSubmit={handleSearch} className="w-full max-w-sm">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            clearSearch={clearSearch}
          />
        </form>

        <CreateAdmin />
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-x-auto">
        <Table className="table-fixed min-w-[980px]">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10 whitespace-nowrap">#</TableHead>
              <TableHead className="w-12 whitespace-nowrap">Avatar</TableHead>
              <TableHead className="w-[160px] min-w-[160px] whitespace-nowrap">
                Name
              </TableHead>
              <TableHead className="w-[180px] min-w-[180px] whitespace-nowrap">
                Email
              </TableHead>
              <TableHead className="w-[140px] min-w-[140px] whitespace-nowrap">
                Phone
              </TableHead>
              <TableHead className="w-[220px] min-w-[180px] whitespace-nowrap">
                Address
              </TableHead>
              <TableHead className="text-center w-24 whitespace-nowrap">
                Verified
              </TableHead>
              <TableHead className="text-center w-16 whitespace-nowrap">
                Logins
              </TableHead>
              <TableHead className="text-center w-16 whitespace-nowrap">
                Orders
              </TableHead>
              <TableHead className="text-right w-16 whitespace-nowrap">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center text-muted-foreground py-10 text-sm"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-gray-50/60">
                  <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <UserAvatar item={item} />
                  </TableCell>
                  <TableCell className="w-[160px] min-w-[160px] max-w-[160px] overflow-hidden">
                    <span
                      className="block w-full truncate text-sm font-medium text-gray-900"
                      title={item.name ?? undefined}
                    >
                      {item.name ?? (
                        <span className="text-gray-400 italic font-normal">
                          No name
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="w-[180px] min-w-[180px] max-w-[180px] overflow-hidden">
                    <span
                      className="block w-full truncate text-sm text-gray-600"
                      title={item.email ?? undefined}
                    >
                      {item.email ?? (
                        <span className="text-gray-300 italic">—</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="w-[140px] min-w-[140px] max-w-[140px] overflow-hidden">
                    <span
                      className="block w-full truncate whitespace-nowrap text-sm font-mono text-gray-700"
                      title={item.phoneNumber ?? undefined}
                    >
                      {item.phoneNumber ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="w-[220px] min-w-[180px] max-w-[220px] overflow-hidden">
                    <span
                      className="text-xs text-gray-600 block"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      title={
                        item.address ||
                        [item.city, item.country].filter(Boolean).join(", ") ||
                        undefined
                      }
                    >
                      {item.address ||
                        [item.city, item.country]
                          .filter(Boolean)
                          .join(", ") || (
                          <span className="text-gray-300 italic">—</span>
                        )}
                    </span>
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {item.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-xs font-medium">
                        <XCircle className="h-3 w-3" />
                        No
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-700">
                      {item.totalLogins}
                    </span>
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-700">
                      {item.totalOrders}
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
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
                          Edit User
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
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
          onPageChange={(page) => {
            if (page < 1 || page > totalPages || page === currentPage) return;
            setCurrentPage(page);
          }}
          totalItems={filtered.length}
          itemsPerPage={limit}
        />
      </div>

      {openDeleteModal && (
        <ConfirmationAlert
          isOpen={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          actionType="delete"
          itemName={
            selectedUser?.name ?? selectedUser?.phoneNumber ?? "this user"
          }
        />
      )}

      {selectedUser && openViewModal && (
        <ViewUser
          open={openViewModal}
          onOpenChange={setOpenViewModal}
          userData={selectedUser}
        />
      )}

      {selectedUser && openUpdateModal && (
        <UpdateUser
          user={selectedUser as any}
          open={openUpdateModal}
          onOpenChange={setOpenUpdateModal}
        />
      )}
    </div>
  );
};

export default ManageUsers;
