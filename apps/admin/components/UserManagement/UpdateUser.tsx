"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUpdateProfileMutation } from "@/redux/Api/userApi";
import { fileUpload } from "@/actions/file";
import { Loader2, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  profilePicture: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

interface UpdateUserProps {
  user: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateUser = ({ user, open, onOpenChange }: UpdateUserProps) => {
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      address: "",
      bio: "",
      profilePicture: "",
      gender: "",
      country: "",
      city: "",
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        address: user.address || (user as any).profile?.address || "",
        bio: user.bio || (user as any).profile?.coverLetter || "",
        profilePicture: user.profilePicture || (user as any).profile?.photo || "",
        gender: user.gender || (user as any).profile?.gender || "",
        country: user.country || (user as any).profile?.country || "",
        city: user.city || (user as any).profile?.city || "",
        password: "",
      });
      setPreviewImage(user.profilePicture || (user as any).profile?.photo || null);
    }
  }, [user, open, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        const imageUrls = await fileUpload([file], "user-profiles");
        const imageUrl = imageUrls[0];
        form.setValue("profilePicture", imageUrl);
        setPreviewImage(imageUrl);
        toast.success("Profile picture uploaded");
      } catch (error) {
        toast.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  const onSubmit = async (values: UpdateUserFormValues) => {
    if (!user) return;

    try {
      // Filter out empty values and password if not changed
      const updateData: any = {};
      Object.keys(values).forEach((key) => {
        const val = (values as any)[key];
        if (val !== undefined && val !== null && val !== "") {
          updateData[key] = val;
        }
      });

      // Special case for password: only include if at least 6 chars
      if (values.password && values.password.length >= 6) {
        updateData.password = values.password;
      } else {
        delete updateData.password;
      }

      await updateProfile({
        id: user.id,
        data: updateData,
      }).unwrap();

      toast.success("User profile updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update User Profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar & Phone Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
              <div className="relative group shrink-0">
                <Avatar className="h-28 w-28 border-4 border-white shadow-sm group-hover:border-[#ff7200]/20 transition-all duration-300">
                  <AvatarImage src={previewImage || ""} />
                  <AvatarFallback className="bg-[#ff7200]/5 text-[#ff7200] text-2xl font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-1 right-1 bg-[#ff7200] p-2 rounded-full text-white cursor-pointer hover:bg-[#e66700] shadow-md transition-all active:scale-95 z-10"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>

              <div className="flex-1 w-full space-y-3">
                <FormItem>
                  <FormLabel className="text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input
                        value={
                          user?.phoneNumber ||
                          (user as any)?.profile?.phone ||
                          "N/A"
                        }
                        disabled
                        className="bg-white/80 border-gray-200 text-gray-700 font-medium h-11 pl-3 disabled:opacity-100 disabled:cursor-default"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400 font-medium">
                          READ ONLY
                        </span>
                      </div>
                    </div>
                  </FormControl>
                  <p className="text-[10px] text-muted-foreground italic">
                    Phone number is linked to account and cannot be modified.
                  </p>
                </FormItem>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 px-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="h-11 focus-visible:ring-[#ff7200]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        className="h-11 focus-visible:ring-[#ff7200]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="h-11 focus-visible:ring-[#ff7200]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Row: Gender, Country, City - Mobile stacked, Desktop 3 cols */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/30 p-3 rounded-lg border border-dashed border-gray-200">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-500">
                        Gender
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-500">
                        Country
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bangladesh"
                          className="bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-500">
                        City
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dhaka"
                          className="bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-gray-700 font-medium">
                      Detailed Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="House no, Street name, Area..."
                        className="resize-none min-h-[80px] focus-visible:ring-[#ff7200]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-gray-700 font-medium">
                      Bio / About Me
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="resize-none min-h-[140px] focus-visible:ring-[#ff7200]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating || uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#ff7200] hover:bg-[#e66700] text-white"
                disabled={isUpdating || uploading}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUser;
