import {
  BarChart3,
  Users,
  ShoppingCart,
  Settings,
  HelpCircle,
  LogOut,
  FileText,
  Bell,
  Package,
  PackagePlus,
  TrendingUp,
  PackageCheck,
  Laptop,
  ImageIcon,
  Folder,
  Laptop2,
  Ticket,
  Combine,
  Folders,
  Truck,
} from "lucide-react";

export const adminRoutes = () => [
  {
    icon: BarChart3,
    label: "Dashboard",
    href: "/admin",
    active: true,
  },
  {
    icon: Users,
    label: "Users",
    href: "/admin/users",
  },
  {
    icon: ImageIcon,
    label: "Banner Management",
    href: "/admin/banner",
  },
  {
    icon: Laptop2,
    label: "Brand Management",
    href: "/admin/brand",
  },
  {
    icon: Combine,
    label: "Collections",
    href: "/admin/collection",
  },
  {
    icon: Folder,
    label: "Category Management",
    href: "/admin/category",
  },
  {
    icon: Folders,
    label: "Sub Category Management",
    href: "/admin/sub-category",
  },
  // {
  //   icon: Folder,
  //   label: "Nested Sub Category",
  //   href: "/admin/nested-sub-category",
  // },
  {
    icon: ShoppingCart,
    label: "Products",
    href: "/admin/products",
    subItems: [
      {
        icon: ShoppingCart,
        label: "Manage Products",
        href: "/admin/products",
      },
      {
        icon: ShoppingCart,
        label: "Create Product",
        href: "/admin/products/create",
      },
      {
        icon: ShoppingCart,
        label: "Add Product Variant",
        href: "/admin/products/add-variant",
      },
      {
        icon: ShoppingCart,
        label: "Product Price Update",
        href: "/admin/products/price-update",
      },
    ],
  },
  // {
  //   icon: ShoppingCart,
  //   label: "Products",
  //   href: "/admin/products",
  //   subItems: [
  //     {
  //       icon: Package,
  //       label: "Product Management",
  //       href: "/admin/products/management",
  //     },
  //     {
  //       icon: PackagePlus,
  //       label: "New Product",
  //       href: "/admin/products/new",
  //     },
  //     {
  //       icon: TrendingUp,
  //       label: "Top Products",
  //       href: "/admin/products/top",
  //     },
  //     {
  //       icon: PackageCheck,
  //       label: "Return Products",
  //       href: "/admin/products/returns",
  //     },
  //   ],
  // },
  {
    icon: FileText,
    label: "Orders",
    href: "/admin/orders",
  },
  {
    icon: Truck,
    label: "Delivery Zones",
    href: "/admin/delivery-zones",
  },
  {
    icon: Ticket,
    label: "Promo Management",
    href: "/admin/promo",
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/admin/notifications",
  },
  {
    icon: FileText,
    label: "Content Management",
    href: "/admin/contents",
  },
  {
    icon: FileText,
    label: "Product Type",
    href: "/admin/product-type",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    href: "/admin/help",
  },
  {
    icon: LogOut,
    label: "Logout",
    href: "/logout",
  },
];
