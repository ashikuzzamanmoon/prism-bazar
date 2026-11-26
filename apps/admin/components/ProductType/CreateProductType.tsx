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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateProductTypeMutation } from "@/redux/Api/productTypeApi";

const productTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type ProductTypeFormValues = z.infer<typeof productTypeSchema>;

const CreateProductType = ({ refetch }: { refetch?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createProductType] = useCreateProductTypeMutation();

  const form = useForm<ProductTypeFormValues>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async (data: ProductTypeFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Creating product type...");

    try {
      const response = await createProductType(data).unwrap();

      if (response.statusCode === 201 || response.statusCode === 200) {
        setOpen(false);
        form.reset();
        toast.success(response?.message || "Product type created successfully!", {
          id: toastId,
        });
        if (refetch) refetch();
      }
    } catch (error: any) {
      console.error("Error creating product type:", error);
      toast.error(
        error?.data?.message || error?.message || "Failed to create product type",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create Product Type</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Product Type</DialogTitle>
          <DialogDescription>
            Enter the name for the new product type.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. অর্গানিক খাদ্য সামগ্রী" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductType;
