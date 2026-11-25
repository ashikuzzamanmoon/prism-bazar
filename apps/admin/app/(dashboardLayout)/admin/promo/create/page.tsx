"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Percent, Users, Hash, Target } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateNewPromoMutation } from "@/redux/Api/promoApi";
import { toast } from "sonner";

interface CouponFormData {
  code: string;
  discountValue: number;
  usageLimit: number;
  perUserLimit: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const CreatePromoCode = () => {
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    discountValue: 1,
    usageLimit: 1,
    perUserLimit: 1,
    startDate: undefined,
    endDate: undefined,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CouponFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createPromoCode, { isLoading: creating }] =
    useCreateNewPromoMutation();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CouponFormData, string>> = {};

    // Validate code
    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    }

    // Validate discountValue
    if (!formData.discountValue || formData.discountValue < 1) {
      newErrors.discountValue = "Discount value must be at least 1";
    }

    // Validate usageLimit
    if (!formData.usageLimit || formData.usageLimit < 1) {
      newErrors.usageLimit = "Usage limit must be at least 1";
    }

    // Validate perUserLimit
    if (!formData.perUserLimit || formData.perUserLimit < 1) {
      newErrors.perUserLimit = "Per user limit must be at least 1";
    }

    // Validate startDate
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    // Validate endDate
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    const toastId = toast.loading("Creating...!");
    try {
      const response = await createPromoCode(formData).unwrap();
      if (response?.statusCode === 201) {
        setFormData({
          code: "",
          discountValue: 1,
          usageLimit: 1,
          perUserLimit: 1,
          startDate: undefined,
          endDate: undefined,
        });
        setSubmitSuccess(true);
        toast.success(response?.message, { id: toastId, duration: 1000 });
      }
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      toast.error(error?.message || "Something went wrong", {
        id: toastId,
        duration: 1000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CouponFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Clear success message when form is edited
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };

  return (
    <div className=" max-w-3xl mx-auto">
      <Card className="w-full border bg-white shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Create Coupon
          </CardTitle>
          <CardDescription className=" sr-only">
            Configure your discount code settings and validity period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coupon Code */}
              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2">
                  Coupon Code <span className=" text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="e.g., SAVE20, WELCOME10"
                  value={formData.code}
                  onChange={(e) =>
                    handleInputChange("code", e.target.value.toUpperCase())
                  }
                  className={`py-5 ${errors.code ? "border-destructive" : ""}`}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code}</p>
                )}
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label
                  htmlFor="discountValue"
                  className="flex items-center gap-2"
                >
                  Discount Value <span className=" text-red-500">*</span>
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="1"
                  placeholder="Enter discount amount"
                  value={formData.discountValue}
                  onChange={(e) =>
                    handleInputChange(
                      "discountValue",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                  className={`py-5 ${
                    errors.discountValue ? "border-destructive" : ""
                  }`}
                />
                {errors.discountValue && (
                  <p className="text-sm text-destructive">
                    {errors.discountValue}
                  </p>
                )}
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit" className="flex items-center gap-2">
                  Total Usage Limit <span className=" text-red-500">*</span>
                </Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="1"
                  placeholder="e.g., 100"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    handleInputChange(
                      "usageLimit",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                  className={`py-5 ${
                    errors.usageLimit ? "border-destructive" : ""
                  }`}
                />
                {errors.usageLimit && (
                  <p className="text-sm text-destructive">
                    {errors.usageLimit}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="perUserLimit"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Per User Limit <span className=" text-red-500">*</span>
                </Label>
                <Input
                  id="perUserLimit"
                  type="number"
                  min="1"
                  placeholder="e.g., 1"
                  value={formData.perUserLimit}
                  onChange={(e) =>
                    handleInputChange(
                      "perUserLimit",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                  className={`py-5 ${
                    errors.perUserLimit ? "border-destructive" : ""
                  }`}
                />
                {errors.perUserLimit && (
                  <p className="text-sm text-destructive">
                    {errors.perUserLimit}
                  </p>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Start Date <span className=" text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full py-5 justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground",
                        errors.startDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, "PPP")
                      ) : (
                        <span>Pick a start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleDateChange("startDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  End Date <span className=" text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full py-5 justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground",
                        errors.endDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, "PPP")
                      ) : (
                        <span>Pick an end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => handleDateChange("endDate", date)}
                      initialFocus
                      disabled={
                        formData.startDate
                          ? { before: formData.startDate }
                          : undefined
                      }
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Success Message */}
            {submitSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                Coupon created successfully!
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Coupon..." : "Create Coupon Code"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePromoCode;
