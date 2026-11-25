"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import SingleFileUploader from "@/utlits/FileUploader";
import { fileUpload } from "@/actions/file";
import { toast } from "sonner";
import { useCreateNewBannerMutation } from "@/redux/Api/bannerApi";
import { useGetAllCategoryQuery, useGetAllQueryCategoryQuery } from "@/redux/Api/categoryApi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useCreateSubCategoryMutation } from "@/redux/Api/sub-categoryApi";

const formSchema = z.object({
  name: z.string().min(1, "name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),
  description: z.string().optional(),
});

type ContentFormData = z.infer<typeof formSchema>;
interface Category {
  id: string;
  name: string;
}

const CreateSubCategory = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectCategory, setSelectCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [createSubCategory, { isLoading }] = useCreateSubCategoryMutation();

  const { data, isLoading: categoryLoading } =useGetAllQueryCategoryQuery({});
  const form = useForm<ContentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const onTitleChange = (value: string) => {
    form.setValue("name", value);
    form.setValue("slug", generateSlug(value));
  };

  const onSubmit = async (values: ContentFormData) => {
    if (!selectCategory) {
      toast.warning("Please select category!");
      return;
    }
    const toastId = toast.loading("Creating...");
    let img;
    if (file) {
      const uploadedUrls = await fileUpload([file], "prism-bazar/banner");
      img = uploadedUrls[0];
    }

    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        image: img || null,
        categoryId: selectCategory,
      };
      console.log("Payload", payload)
      const response = await createSubCategory(payload).unwrap();
      console.log("response", response)

      if (response?.statusCode === 201) {
        toast.success(response?.message, { id: toastId, duration: 1000 });
        form.reset();
        setFile(null);
        setSelectCategory("");
      } else {
        toast.error(
          response?.message || response?.data?.message || "Fail to created !",
          { id: toastId, duration: 1000 }
        );
      }
    } catch (err: any) {
      const errMsg =
        err?.data?.message || err?.message || "Something went wrong!";
      toast.error(errMsg, { id: toastId, duration: 1500 });
    }
  };

  if (categoryLoading) {
    return <h1>Loading..</h1>;
  }

  const categoryData: Category[] = data?.data;
  console.log("Category Data", categoryData);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className=" bg-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className=" text-primary">Create Sub Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium pb-2">
                  Select Category <span className=" text-red-500">*</span>
                </label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between py-5"
                    >
                      {categoryData.find(
                        (category) => category.id === selectCategory
                      )?.name ?? "Select Category..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search courses..." />
                      <CommandList>
                        <CommandEmpty>No Category found.</CommandEmpty>
                        <CommandGroup>
                          {categoryData.map((category: Category) => (
                            <CommandItem
                              key={category.id}
                              value={category.name}
                              onSelect={() => {
                                setSelectCategory(category.id);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectCategory === category.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className=" text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter content name"
                        {...field}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className=" py-5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug <span className=" text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="content-slug"
                        {...field}
                        className=" py-5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a brief description (optional)"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SingleFileUploader
                file={file}
                setFile={setFile}
                title="Featured Image"
                required={false}
                maxSizeInMB={10}
                acceptedFileTypes={["image/*"]}
                showPreview={true}
                previewClassName="border border-amber-100"
              />

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  Save Content
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSubCategory;
