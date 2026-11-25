/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Edit2,
  Save,
  X,
  Camera,
  Mail,
  User,
  Phone,
  ShieldCheck,
  Globe,
  Activity,
  CalendarDays,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { getMyProfile, updateProfile, fileUpload } from "@/apiService/apiService";
import { toast } from "sonner";

export interface IUserProfile {
  id: string;
  name: string | null;
  email: string | null;
  password?: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isVerified: boolean;
  lastLogin: string | null;
  phoneNumber: string | null;
  totalLogins: number;
  bio: string | null;
  city: string | null;
  country: string | null;
  coveragePicture: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  postalCode: string | null;
  profilePicture: string | null;
  thana: string | null;
  totalOrders: number;
}

const countryData: Record<string, string[]> = {
  Bangladesh: [
    "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna",
    "Barisal", "Rangpur", "Mymensingh", "Comilla", "Narayanganj", "Gazipur", "Bogra",
  ],
  Canada: [
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton",
    "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener", "London", "Victoria",
  ],
  India: [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur",
  ],
};

const defaultProfile: IUserProfile = {
  id: "",
  name: "Loading...",
  email: null,
  address: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
  isEmailVerified: false,
  isPhoneVerified: false,
  isVerified: false,
  lastLogin: null,
  phoneNumber: null,
  totalLogins: 0,
  bio: null,
  city: null,
  country: null,
  coveragePicture: null,
  dateOfBirth: null,
  gender: null,
  postalCode: null,
  profilePicture: null,
  thana: null,
  totalOrders: 0,
};

const genderDisplayMap: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export default function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<IUserProfile>(defaultProfile);
  const [editData, setEditData] = useState<IUserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(false);

  const profileImageRef = useRef<HTMLInputElement>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response: IUserProfile = await getMyProfile();
        if (response?.id) {
          setProfileData(response);
          setEditData(response);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Updating profile...");
    try {
      let profilePicUrl;
      if (profileImageFile) {
        const uploadedUrls = await fileUpload([profileImageFile], "prism-bazar/profile");
        profilePicUrl = uploadedUrls[0];
      }

      const payload: Partial<any> = {
        name: editData.name,
        bio: editData.bio,
        phoneNumber: editData.phoneNumber,
        country: editData.country,
        city: editData.city,
        address: editData.address,
        gender: editData.gender,
        ...(profilePicUrl ? { profilePicture: profilePicUrl } : {}),
      };

      const response = await updateProfile({
        id: profileData.id,
        data: payload,
      });

      if (response?.statusCode === 200 || response?.success || response?.id) {
        toast.success("Profile updated successfully!", { id: toastId, duration: 2000 });
        setIsEditing(false);
        setProfileImageFile(null);
        setProfileData({
          ...editData,
          ...payload,
          profilePicture: profilePicUrl || editData.profilePicture,
        });
      } else {
        toast.error("Failed to update profile!", { id: toastId, duration: 2000 });
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error?.message || "Something went wrong", { id: toastId, duration: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
    setProfileImageFile(null);
  };

  const handleInputChange = (field: keyof IUserProfile, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (country: string) => {
    setEditData((prev) => ({
      ...prev,
      country,
      city: countryData[country]?.[0] || "",
    }));
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        handleInputChange("profilePicture", ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const displayName = isEditing ? editData.name || "" : profileData.name || "User Name";
  const displayAvatar = isEditing ? editData.profilePicture : profileData.profilePicture;

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8 animate-in fade-in duration-500 mt-6 lg:mt-8 p-3">
      {/* Top Header / Banner Section */}
      <div className="bg-card rounded-2xl overflow-hidden border shadow-sm relative">
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-primary/20 via-primary/5 to-primary/15 overflow-hidden w-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(var(--primary-rgb,59,130,246),0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--primary-rgb,59,130,246),0.1),transparent_50%)]" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 sm:px-10 pb-8 flex flex-col sm:flex-row gap-6 relative">
          <div className="relative -mt-16 sm:-mt-20 shrink-0 mx-auto sm:mx-0 group">
            <Avatar className="w-32 h-32 sm:w-36 sm:h-36 border-4 border-background shadow-xl ring-1 ring-border bg-background">
              <AvatarImage src={displayAvatar || ""} className="object-cover" />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-semibold">
                {displayName ? displayName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-2 right-2 rounded-full shadow-md w-10 h-10 border z-10 hover:scale-105 transition-transform"
                onClick={() => profileImageRef.current?.click()}
              >
                <Camera className="w-5 h-5 text-foreground" />
              </Button>
            )}
            <input ref={profileImageRef} type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
          </div>

          <div className="flex-1 pt-2 sm:pt-4 text-center sm:text-left">
            <div className="flex flex-col xl:flex-row justify-between items-center sm:items-start xl:items-center gap-4">
              <div className="w-full xl:w-auto">
                {isEditing ? (
                  <Input
                    value={editData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-2xl font-bold h-auto py-1 px-3 w-full sm:w-80 mx-auto sm:mx-0"
                    placeholder="Your Full Name"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                    {displayName}
                    {profileData.isVerified && (
                      <CheckCircle2 className="w-6 h-6 text-blue-500" fill="currentColor" stroke="white" />
                    )}
                  </h1>
                )}
                <p className="text-muted-foreground mt-1.5 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-4 h-4" />
                  {profileData.email || "No email available"}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4 xl:mt-0">
                {isEditing ? (
                  <>
                    <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" /> {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} className="shadow-sm">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge variant="secondary" className="px-3 py-1 font-normal opacity-90 rounded-full">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                {profileData.country || "Earth"}
              </Badge>
              <Badge variant={profileData.totalOrders > 0 ? "default" : "secondary"} className="px-3 py-1 font-normal rounded-full">
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                {profileData.totalOrders} Orders
              </Badge>
              <Badge variant="outline" className="px-3 py-1 font-normal rounded-full text-foreground/80">
                <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                Joined {formatDate(profileData.createdAt)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">

          {/* About Me Section */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b bg-muted/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> About Me
              </h2>
            </div>
            <div className="p-5 sm:p-6">
              {isEditing ? (
                <Textarea
                  value={editData.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Write a short bio about yourself..."
                  className="min-h-[120px] resize-y"
                />
              ) : (
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {profileData.bio || "This user hasn't added a bio yet."}
                </p>
              )}
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b bg-muted/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Information
              </h2>
            </div>
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Phone Number</Label>
                {isEditing ? (
                  <Input
                    value={editData.phoneNumber || ""}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="e.g. +88017..."
                  />
                ) : (
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {profileData.phoneNumber || "—"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Gender</Label>
                {isEditing ? (
                  <Select value={editData.gender || ""} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium">
                    {profileData.gender ? (genderDisplayMap[profileData.gender] || profileData.gender) : "—"}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Location & Address */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b bg-muted/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Location & Address
              </h2>
            </div>
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Country</Label>
                {isEditing ? (
                  <Select value={editData.country || ""} onValueChange={handleCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(countryData).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium">{profileData.country || "—"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">City</Label>
                {isEditing ? (
                  <Select value={editData.city || ""} onValueChange={(value) => handleInputChange("city", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {(editData.country && countryData[editData.country]) ? (
                        countryData[editData.country].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Select country first</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium">{profileData.city || "—"}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Street Address</Label>
                {isEditing ? (
                  <Input value={editData.address || ""} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Full street address" />
                ) : (
                  <p className="font-medium">{profileData.address || "—"}</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar / Status Block */}
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b bg-muted/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Account Status
              </h2>
            </div>
            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                {profileData.isActive ? (
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none px-2.5 py-0.5">Active</Badge>
                ) : (
                  <Badge variant="destructive" className="px-2.5 py-0.5">Inactive</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Verified</span>
                {profileData.isEmailVerified ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Phone Verified</span>
                {profileData.isPhoneVerified ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
              </div>

              <div className="pt-5 border-t space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Logins</p>
                  <p className="text-2xl font-bold text-foreground">{profileData.totalLogins}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Last Login</p>
                  <p className="text-sm font-medium text-foreground">
                    {profileData.lastLogin ? formatDate(profileData.lastLogin) : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
