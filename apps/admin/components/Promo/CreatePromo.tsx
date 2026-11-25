"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, CalendarIcon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useCreateNewPromoMutation } from "@/redux/Api/promoApi";

export const PromoType = {
  FLAT: "FLAT",
  PERCENT: "PERCENT",
} as const;

export const promoSchema = z.object({
  code: z
    .string()
    .min(1, "Promo code is required")
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must not exceed 20 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Code must contain only uppercase letters and numbers",
    ),
  discount: z
    .string()
    .min(1, "Discount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Discount must be a positive number",
    }),
  type: z.enum([PromoType.FLAT, PromoType.PERCENT], {
    required_error: "Please select a discount type",
  }),
  usageLimit: z
    .string()
    .min(1, "Usage limit is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Usage limit must be a positive number",
    }),
  perUserLimit: z
    .string()
    .min(1, "Per user limit is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Per user limit must be a positive number",
    }),
  isActive: z.boolean().default(true),
  expiresAt: z.date({
    required_error: "Expiry date is required",
  }),
});

export type PromoFormValues = z.infer<typeof promoSchema>;

const CreatePromo = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createPromo] = useCreateNewPromoMutation();

  const form = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema) as any,
    defaultValues: {
      code: "",
      discount: "",
      type: PromoType.FLAT,
      usageLimit: "",
      perUserLimit: "",
      isActive: true,
      expiresAt: undefined,
    },
  });

  const handleSubmit = async (data: PromoFormValues) => {
    setIsSubmitting(true);

    const toastId = toast.loading("Creating promo code...");

    try {
      const expiresAtISO = data.expiresAt.toISOString();

      const payload = {
        code: data.code,
        discount: Number(data.discount),
        type: data.type,
        usageLimit: Number(data.usageLimit),
        perUserLimit: Number(data.perUserLimit),
        isActive: data.isActive,
        expiresAt: expiresAtISO,
      };

      const response = await createPromo(payload).unwrap();

      if (response.statusCode === 200 || response.statusCode === 201) {
        setOpen(false);
        form.reset();
        toast.success(response?.message || "Promo code created successfully!", {
          id: toastId,
          duration: 1000,
        });
      }
    } catch (error: any) {
      console.error("Error creating promo code:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to create promo code",
        { id: toastId, duration: 1000 },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Create Promo Code</Button>
      </DialogTrigger>
      <DialogContent className="max-w-175! max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Promo Code</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new promotional code.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-180px)] pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Promo Code <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., SUMMER2024"
                        {...field}
                        disabled={isSubmitting}
                        className="py-6 uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Use only uppercase letters and numbers (3-20 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Discount Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="py-6">
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PromoType.FLAT}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Flat Amount</span>
                            <span className="text-xs text-muted-foreground">
                              (৳)
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value={PromoType.PERCENT}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Percentage</span>
                            <span className="text-xs text-muted-foreground">
                              (%)
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose between flat amount or percentage discount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Discount Amount <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter discount value"
                        {...field}
                        disabled={isSubmitting}
                        className="py-6"
                        min="0"
                        step="0.01"
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch("type") === PromoType.FLAT
                        ? "Amount in BDT (৳)"
                        : "Percentage value (e.g., 10 for 10%)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Total Usage Limit <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        {...field}
                        disabled={isSubmitting}
                        className="py-6"
                        min="1"
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of times this code can be used in total
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perUserLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Per User Limit <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 1"
                        {...field}
                        disabled={isSubmitting}
                        className="py-6"
                        min="1"
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of times one user can use this code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Expiry Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full py-6 pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The promo code will expire at 11:59 PM on this date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this promo code immediately
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Promo Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePromo;
