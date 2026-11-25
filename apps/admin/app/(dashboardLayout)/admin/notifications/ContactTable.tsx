"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Mail, MessageSquare, MoreHorizontal, Phone, Trash2, User } from "lucide-react";
import { TableSkeleton } from "@/components/Common/TableSkeleton";
import { useGetNotificationsQuery } from "@/redux/Api/contactApi";
import { IContactMessage } from "@/types/contact.type";

const ContactTable = () => {
  const { data, isLoading } = useGetNotificationsQuery({});
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton />;

  const contactData: IContactMessage[] = data?.data || [];

  return (
    <div className=" rounded-md p-2 mt-5 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {contactData.length > 0 ? (
            contactData.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>{item.name}</TableCell>

                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.subject}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {item.message}
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

                      <DropdownMenuItem asChild>
                        <Link href={`/admin/contact/${item.id}/view`}>
                          <div className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => console.log("Delete:", item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                No contact messages found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactTable;
