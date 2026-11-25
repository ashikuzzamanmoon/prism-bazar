"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User as UserIcon,
  XCircle,
} from "lucide-react";

interface ViewUserProps {
  userData: IUserDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface IUserDetails {
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

const InfoCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number | null;
}) => (
  <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div className="rounded-md bg-gray-100 p-2">
      <Icon className="h-4 w-4 text-gray-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-gray-900">
        {value || "—"}
      </p>
    </div>
  </div>
);

const StatusIndicator = ({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) => (
  <div className="flex items-center gap-2">
    <div
      className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`}
    />
    <span className="text-sm text-gray-600">{label}</span>
  </div>
);

const ViewUser = ({ userData, open, onOpenChange }: ViewUserProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fullAddress =
    userData?.address ||
    [userData?.thana, userData?.city, userData?.country]
      .filter(Boolean)
      .join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-w-175! gap-0 overflow-hidden bg-white p-0">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              User Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Complete information about this user
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {userData ? (
            <div className="space-y-6">
              <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:flex-row">
                <div className="flex min-w-0 items-center gap-4">
                  {userData.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt={userData.name ?? "user"}
                      className="h-16 w-16 shrink-0 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <UserIcon className="h-7 w-7 text-gray-500" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </p>
                    <h2 className="truncate text-xl font-semibold text-gray-900">
                      {userData.name || "No name"}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      <StatusIndicator
                        active={userData.isActive}
                        label={userData.isActive ? "Active" : "Inactive"}
                      />
                      <StatusIndicator
                        active={userData.isVerified}
                        label={userData.isVerified ? "Verified" : "Unverified"}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={
                      userData.isEmailVerified
                        ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
                        : "border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-100"
                    }
                  >
                    {userData.isEmailVerified ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    Email
                  </Badge>
                  <Badge
                    className={
                      userData.isPhoneVerified
                        ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
                        : "border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-100"
                    }
                  >
                    {userData.isPhoneVerified ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    Phone
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="h-4 w-1 rounded-full bg-primary" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoCard icon={Mail} label="Email" value={userData.email} />
                  <InfoCard
                    icon={Phone}
                    label="Phone Number"
                    value={userData.phoneNumber}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="h-4 w-1 rounded-full bg-primary" />
                  Profile Information
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoCard icon={UserIcon} label="Gender" value={userData.gender} />
                  <InfoCard
                    icon={Calendar}
                    label="Date of Birth"
                    value={formatDate(userData.dateOfBirth)}
                  />
                  <InfoCard
                    icon={MapPin}
                    label="Address"
                    value={fullAddress || null}
                  />
                  <InfoCard
                    icon={Globe}
                    label="Postal Code"
                    value={userData.postalCode}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="h-4 w-1 rounded-full bg-primary" />
                  Account Activity
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoCard
                    icon={ShieldCheck}
                    label="Total Logins"
                    value={userData.totalLogins}
                  />
                  <InfoCard
                    icon={ShieldCheck}
                    label="Total Orders"
                    value={userData.totalOrders}
                  />
                  <InfoCard
                    icon={Clock}
                    label="Last Login"
                    value={formatDate(userData.lastLogin)}
                  />
                  <InfoCard
                    icon={Calendar}
                    label="Created At"
                    value={formatDate(userData.createdAt)}
                  />
                </div>
              </div>

              {userData.bio && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <div className="h-4 w-1 rounded-full bg-primary" />
                    Bio
                  </h3>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm leading-6 text-gray-700">
                      {userData.bio}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
              <p className="text-sm text-gray-500">User details not found.</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUser;
