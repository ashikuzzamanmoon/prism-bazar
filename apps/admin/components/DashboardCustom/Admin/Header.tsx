"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMobile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useMyProfileQuery } from "@/redux/Api/userApi";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;

  className?: string;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

const Header = ({
  onMenuClick,
  showMenuButton = true,
  className,
  mobileOpen = false,
  setMobileOpen,
  collapsed = false,
  setCollapsed,
}: HeaderProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { theme, setTheme } = useTheme();
  const breadcrumbs = useAppSelector(
    (state: RootState) => state.breadcrumb.breadcrumbs
  );
  const router = useRouter();
  // const { data, isLoading } = useMyProfileQuery({});
  // if (isLoading) {
  //   return (
  //     <header className="flex h-16 items-center px-6 border-b bg-white dark:bg-black">
  //       <p className="text-sm text-muted-foreground">Loading header...</p>
  //     </header>
  //   );
  // }

  // console.log("Data", data);

  useEffect(() => {
    setInternalCollapsed(collapsed);
  }, [collapsed]);

  const toggleCollapse = () => {
    if (setCollapsed) {
      setCollapsed(!collapsed);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    Cookies.remove("pbAdminToken");
    router.push("/");
  };

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b bg-white dark:bg-black dark:text-white px-6",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className={cn(
            "h-8 w-8 bg-gray-100 text-slate-700 p-0 hidden md:flex cursor-pointer",
            collapsed ? "rotate-180" : ""
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div>
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 || crumb.active ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href || crumb.path || "#"}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className=" bg-gray-100 cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    "https://cdn-icons-png.flaticon.com/128/2202/2202112.png"
                  }
                  alt={"admin"}
                />
                <AvatarFallback>{"Admin back"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {"admin name"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {"admin email"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
