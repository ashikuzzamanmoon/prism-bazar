"use client";

import { ICollection, ICategory } from "@/types/collectionTypes";
import { useState, useRef, useEffect } from "react";
import { ChevronRight, Search, ShoppingCart, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/utils";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleDrawer } from "@/redux/slice/drawerSlice";
import { useAuth } from "@/hooks/useAuth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import HeaderSearch from "./HeaderSearch";

const Header = ({ collectionData }: { collectionData: ICollection[] }) => {
  console.log("Collection Data in Header:", collectionData);
  const { token, setToken, user } = useAuth();
  const router = useRouter();
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const badgeLabel = cartCount > 99 ? "99+" : cartCount;
  const dispatch = useDispatch();
  const handleCartToggle = () => dispatch(toggleDrawer());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    Cookies.remove("pbToken");
    router.refresh();
    router.push("/");
    setToken(null);
  };

  return (
    <div className="sticky top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <header className="w-full  ">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-3 py-3 relative sm:px-4 ">
          {/* Left: Hamburger */}
          <button
            className="p-2 rounded-md text-gray-700 hover:bg-green-50 hover:text-[#16a34a] transition-colors duration-150 z-10"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex max-w-[calc(100%-7rem)] items-center justify-center h-12"
            onClick={() => setMobileOpen(false)}
          >
            <Image
              src="/prism-bazar-logo.svg"
              alt="Prism Bazar Logo"
              width={240}
              height={80}
              className="h-auto w-28 object-contain sm:w-36"
              priority
            />
          </Link>

          {/* Right: Cart & User Icon / Login */}
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="inline-flex relative p-2 rounded-md text-gray-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={handleCartToggle}
              className="inline-flex relative p-2 rounded-md text-gray-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#16a34a] text-white text-[10px] font-bold leading-none">
                  {badgeLabel}
                </span>
              )}
            </button>
            {user.id && token ? (
              <Popover>
                <PopoverTrigger className="cursor-pointer">
                  <Avatar>
                    <AvatarImage
                      src="https://cdn-icons-png.flaticon.com/128/15678/15678795.png"
                      className="h-6 w-6"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent
                  className="w-48 border-0"
                  align="end"
                  side="bottom"
                >
                  <Link href="/profile">
                    <h1 className="px-2 py-1.5 hover:bg-primary/10 hover:text-primary cursor-pointer rounded">
                      Profile
                    </h1>
                  </Link>
                  <Link href="/dashboard">
                    <h1 className="px-2 py-1.5 hover:bg-primary/10 hover:text-primary cursor-pointer rounded">
                      Dashboard
                    </h1>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-2 w-full mt-2.5 py-1 bg-red-100 text-red-500 hover:bg-primary/10 hover:text-primary cursor-pointer rounded"
                  >
                    Logout
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <Link
                href="/login"
                className="p-2 rounded-md text-gray-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Expandable Box */}
        {showMobileSearch && (
          <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
            <HeaderSearch />
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden md:block ">
          <div className="max-w-7xl mx-auto px-4 md:px-0 flex items-center justify-between py-3 gap-4 lg:gap-6">
            <Link
              href="/"
              className="shrink-0 flex items-center h-10 ml-0 md:-ml-6"
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src="/prism-bazar-logo.svg"
                alt="Prism Bazar Logo"
                width={200}
                height={60}
                className="w-48 lg:w-52 h-auto object-contain"
                priority
              />
            </Link>

            <div className="flex-1 min-w-0 flex justify-center px-2 lg:px-6">
              <HeaderSearch className="w-full max-w-2xl" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden xl:flex items-center gap-4 mr-2">
                <Link
                  href="/about"
                  className="text-sm font-medium text-gray-700 hover:text-[#16a34a] transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-gray-700 hover:text-[#16a34a] transition-colors"
                >
                  Contact
                </Link>
              </div>
              <button
                onClick={handleCartToggle}
                className="inline-flex relative p-2 rounded-md text-gray-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#16a34a] text-white text-[10px] font-bold leading-none">
                    {badgeLabel}
                  </span>
                )}
              </button>

              {user.id && token ? (
                <Popover>
                  <PopoverTrigger className="cursor-pointer mt-2">
                    <Avatar>
                      <AvatarImage
                        src="https://cdn-icons-png.flaticon.com/128/15678/15678795.png"
                        className="h-6 w-6"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-48 border-0"
                    align="end"
                    side="bottom"
                  >
                    <Link href="/profile">
                      <h1 className="px-2 py-1.5 hover:bg-primary/10 hover:text-primary cursor-pointer rounded">
                        Profile
                      </h1>
                    </Link>
                    <Link href="/dashboard">
                      <h1 className="px-2 py-1.5 hover:bg-primary/10 hover:text-primary cursor-pointer rounded">
                        Dashboard
                      </h1>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-2 w-full mt-2.5 py-1 bg-red-100 text-red-500 hover:bg-primary/10 hover:text-primary cursor-pointer rounded"
                    >
                      Logout
                    </button>
                  </PopoverContent>
                </Popover>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex px-4 py-2 bg-[#16a34a] text-white text-sm font-medium rounded-md hover:bg-[#15803d] active:scale-95 transition-all duration-150"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Nav Row */}
          <nav className=" border border-b border-gray-50 pb-1">
            <div className="max-w-7xl mx-auto px-4">
              <ul className="flex items-center justify-center gap-1 overflow-visible py-1 whitespace-nowrap">
                {collectionData?.slice(0, 7).map((collection) => (
                  <CollectionItem key={collection.id} collection={collection} />
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 shadow-xl flex flex-col md:hidden overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <Link
                href="/"
                className="shrink-0"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src="/prism-bazar-logo.svg"
                  alt="Prism Bazar Logo"
                  width={180}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <button
                className="p-2 rounded-md text-gray-700 hover:bg-green-50 hover:text-[#16a34a] transition-colors duration-150"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="flex-1 px-3 py-3 space-y-1">
              {collectionData?.slice(0, 7).map((collection) => (
                <MobileCollectionItem
                  key={collection.id}
                  collection={collection}
                  onClose={() => setMobileOpen(false)}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Desktop: Collection Item ─────────────────────────────────────────────────
const CollectionItem = ({ collection }: { collection: ICollection }) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ICategory | null>(null);
  const [submenuDirection, setSubmenuDirection] = useState<"right" | "left">(
    "right",
  );
  const closeDropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const closeCategoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const categoryPanelRef = useRef<HTMLDivElement | null>(null);
  const hasCategories = collection.categories.length > 0;

  const clearCloseDropdownTimeout = () => {
    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }
  };

  const clearCloseCategoryTimeout = () => {
    if (closeCategoryTimeoutRef.current) {
      clearTimeout(closeCategoryTimeoutRef.current);
      closeCategoryTimeoutRef.current = null;
    }
  };

  const openDropdown = () => {
    clearCloseDropdownTimeout();
    setOpen(true);
  };

  const scheduleCloseDropdown = () => {
    clearCloseDropdownTimeout();
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setActiveCategory(null);
      setSubmenuDirection("right");
    }, 180);
  };

  const scheduleCloseCategory = () => {
    clearCloseCategoryTimeout();
    closeCategoryTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 140);
  };

  useEffect(() => {
    return () => {
      clearCloseDropdownTimeout();
      clearCloseCategoryTimeout();
    };
  }, []);

  useEffect(() => {
    if (
      !open ||
      !activeCategory?.subCategories?.length ||
      !categoryPanelRef.current
    ) {
      return;
    }

    const updateDirection = () => {
      if (!categoryPanelRef.current) return;

      const panelRect = categoryPanelRef.current.getBoundingClientRect();
      const submenuWidth = 208;
      const spaceOnRight = window.innerWidth - panelRect.right;
      const spaceOnLeft = panelRect.left;

      if (spaceOnRight < submenuWidth && spaceOnLeft > spaceOnRight) {
        setSubmenuDirection("left");
        return;
      }

      setSubmenuDirection("right");
    };

    updateDirection();
    window.addEventListener("resize", updateDirection);

    return () => {
      window.removeEventListener("resize", updateDirection);
    };
  }, [open, activeCategory?.id, activeCategory?.subCategories?.length]);

  if (!hasCategories) {
    return (
      <li>
        <Link
          href={`/products?collection=${collection.slug}`}
          className="text-sm font-medium px-3 py-2 rounded-md text-gray-700 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150 inline-block"
        >
          {collection.name}
        </Link>
      </li>
    );
  }

  return (
    <li
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={scheduleCloseDropdown}
    >
      <Link
        href={`/products?collection=${collection.slug}`}
        className={cn(
          "text-sm font-medium px-3 py-2 rounded-md flex items-center gap-1 transition-colors duration-150",
          open
            ? "bg-[#16a34a] text-white"
            : "text-gray-700 hover:text-[#16a34a] hover:bg-green-50",
        )}
      >
        {collection.name}
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-150",
            open ? "rotate-90 text-white" : "text-gray-400",
          )}
        />
      </Link>
      {open && (
        <div
          className="absolute top-full left-0 pt-1 z-50"
          onMouseEnter={() => {
            clearCloseDropdownTimeout();
            clearCloseCategoryTimeout();
          }}
          onMouseLeave={scheduleCloseDropdown}
        >
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-100 overflow-visible">
            <div ref={categoryPanelRef} className="w-52 py-2 shrink-0">
              {collection.categories.map((category) => (
                <div
                  key={category.id}
                  onMouseEnter={() => {
                    clearCloseCategoryTimeout();
                    setActiveCategory(category);
                  }}
                  onMouseLeave={scheduleCloseCategory}
                >
                  <Link
                    href={`/products?collection=${collection.slug}&category=${category.slug}`}
                    className={cn(
                      "flex items-center justify-between gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150",
                      activeCategory?.id === category.id &&
                        "text-[#16a34a] bg-green-50",
                    )}
                  >
                    <span>{category.name}</span>
                    {category.subCategories?.length > 0 && (
                      <ChevronRight
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          activeCategory?.id === category.id
                            ? "text-[#16a34a]"
                            : "text-gray-400",
                        )}
                      />
                    )}
                  </Link>
                </div>
              ))}
            </div>

            {activeCategory && activeCategory.subCategories?.length > 0 && (
              <div
                className={cn(
                  "absolute top-0 z-10 w-52 py-2 bg-white border border-gray-100 shadow-lg rounded-lg",
                  submenuDirection === "left"
                    ? "right-full mr-1"
                    : "left-full ml-1",
                )}
                onMouseEnter={() => {
                  clearCloseCategoryTimeout();
                }}
                onMouseLeave={scheduleCloseCategory}
              >
                {activeCategory.subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/products?collection=${collection.slug}&category=${activeCategory.slug}&subCategory=${sub.slug}`}
                    className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
};

// ─── Mobile: Collection Item ──────────────────────────────────────────────────
const MobileCollectionItem = ({
  collection,
  onClose,
}: {
  collection: ICollection;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ICategory | null>(null);
  const hasCategories = collection.categories.length > 0;

  if (!hasCategories) {
    return (
      <li>
        {/* short param */}
        <Link
          href={`/products?collection=${collection.slug}`}
          onClick={onClose}
          className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150"
        >
          {collection.name}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div
        className={cn(
          "w-full flex items-center justify-between rounded-md transition-colors duration-150",
          open ? "bg-green-50" : "hover:bg-green-50",
        )}
      >
        <Link
          href={`/products?collection=${collection.slug}`}
          onClick={onClose}
          className={cn(
            "flex-1 px-3 py-2.5 text-sm font-medium transition-colors duration-150",
            open ? "text-[#16a34a]" : "text-gray-700 hover:text-[#16a34a]",
          )}
        >
          {collection.name}
        </Link>
        <button
          onClick={() => {
            setOpen((v) => !v);
            setActiveCategory(null);
          }}
          className="px-3 py-2.5"
        >
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              open ? "rotate-90 text-[#16a34a]" : "text-gray-400",
            )}
          />
        </button>
      </div>

      {open && (
        <ul className="mt-1 ml-3 pl-3 border-l-2 border-orange-100 space-y-0.5">
          {collection.categories.map((category) => (
            <li key={category.id}>
              <div className="flex items-center">
                <Link
                  href={`/products?collection=${collection.slug}&category=${category.slug}`}
                  onClick={onClose}
                  className="flex-1 block px-2 py-2 rounded-md text-sm text-gray-600 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150"
                >
                  {category.name}
                </Link>
                {category.subCategories?.length > 0 && (
                  <button
                    onClick={() =>
                      setActiveCategory((prev) =>
                        prev?.id === category.id ? null : category,
                      )
                    }
                    className="p-1.5 text-gray-400 hover:text-[#16a34a] transition-colors"
                  >
                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        activeCategory?.id === category.id &&
                          "rotate-90 text-[#16a34a]",
                      )}
                    />
                  </button>
                )}
              </div>

              {activeCategory?.id === category.id &&
                category.subCategories?.length > 0 && (
                  <ul className="mt-0.5 ml-3 pl-3 border-l-2 border-green-50 space-y-0.5">
                    {category.subCategories.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/products?collection=${collection.slug}&category=${activeCategory.slug}&subCategory=${sub.slug}`}
                          onClick={onClose}
                          className="block px-2 py-1.5 rounded-md text-sm text-gray-500 hover:text-[#16a34a] hover:bg-green-50 transition-colors duration-150"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Header;
