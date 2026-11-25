"use client";
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { closeDrawer } from "@/redux/slice/drawerSlice";
import { removeFromCart } from "@/redux/slice/cartSlice";
import Image from "next/image";
import { Trash } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarProvider,
    useSidebar,
} from "@/components/ui/sidebar";

const CartSidebarContent = () => {
    const isDrawerOpen = useAppSelector(
        (state: RootState) => state.drawer.isOpen
    );
    const cartItems = useAppSelector((state: RootState) => state.cart.items);
    const dispatch = useDispatch();
    const sidebarRef = useRef<HTMLDivElement>(null);

    const { setOpen, setOpenMobile, open, openMobile, isMobile } = useSidebar();

    // Sync Redux -> Sidebar
    useEffect(() => {
        if (isMobile) {
            setOpenMobile(isDrawerOpen);
        } else {
            setOpen(isDrawerOpen);
        }
    }, [isDrawerOpen, isMobile, setOpen, setOpenMobile]);

    // Handle closing the sidebar from UI (e.g., clicking overlay or pressing escape on mobile)
    const prevOpenMobile = useRef(openMobile);
    useEffect(() => {
        if (isMobile && prevOpenMobile.current && !openMobile) {
            dispatch(closeDrawer());
        }
        prevOpenMobile.current = openMobile;
    }, [openMobile, isMobile, dispatch]);

    const prevOpen = useRef(open);
    useEffect(() => {
        if (!isMobile && prevOpen.current && !open) {
            dispatch(closeDrawer());
        }
        prevOpen.current = open;
    }, [open, isMobile, dispatch]);

    // Handle outside clicks (needed for desktop where it renders as a fixed div, not a Dialog)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Only fire if the drawer is actually open
            if (!isDrawerOpen) return;
            // Native Dialog on mobile handles its own outside clicks correctly
            if (isMobile) return;

            // Check if the click was outside the sidebar area
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                // Ignore clicks that are inside the header cart button
                const target = event.target as Element;
                if (!target.closest('[aria-label="Cart"]')) {
                    dispatch(closeDrawer());
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDrawerOpen, isMobile, dispatch]);

    const handleClose = () => {
        dispatch(closeDrawer());
    };

    const handleRemoveItem = (itemId: string) => {
        dispatch(removeFromCart({ id: itemId }));
    };

    return (
        <div ref={sidebarRef}>
            <Sidebar side="right" className="cart-sidebar z-[100] border-l" variant="sidebar" collapsible="offcanvas">
                <SidebarHeader className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Your Cart</h2>
                </SidebarHeader>

                {/* Cart Items */}
                <SidebarContent className="flex-1 overflow-y-auto p-4 shrink-0 grow">
                    {cartItems.length > 0 ? (
                        cartItems.map((item, index) => (
                            <div key={index} className="relative border-b py-2 flex gap-5">
                                <Image
                                    src={
                                        item.photo ||
                                        "https://img.freepik.com/free-photo/indoor-plants-studio_23-2151022044.jpg?ga=GA1.1.406508785.1728154460&semt=ais_hybrid"
                                    }
                                    alt={item.name}
                                    width={100}
                                    height={100}
                                    className="h-12 w-12"
                                />
                                <div className="w-full text-sm">
                                    <div className="flex justify-between items-center">
                                        <h2 className="font-medium primaryColor">{item.name}</h2>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <h2 className="font-medium">Qty: {item.quantity}</h2>
                                        <p className="font-medium">TK: {item.price}</p>
                                    </div>
                                </div>
                                <button
                                    className="h-5 w-5 rounded-full flex justify-center items-center absolute top-1.5 right-0 bg-red-100 text-red-500 p-0.5 cursor-pointer"
                                    onClick={() => handleRemoveItem(item.id)}
                                >
                                    <Trash size={12} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-4">
                            Your cart is empty.
                        </p>
                    )}
                </SidebarContent>

                {/* Checkout Button */}
                <SidebarFooter className="p-4 bg-background">
                    {cartItems.length > 0 ? (
                        <Link href={"/checkout"} className="w-full" onClick={handleClose}>
                            <button className="bg-[#ff7200] text-white py-2 px-4 rounded-full w-full">
                                Checkout
                            </button>
                        </Link>
                    ) : (
                        <button className="bg-[#ff7200] text-white py-2 px-4 rounded-full w-full">
                            Add Some Product
                        </button>
                    )}
                </SidebarFooter>
            </Sidebar>
        </div>
    );
};

const AddToCartDrawer = () => {
    const isDrawerOpen = useAppSelector(
        (state: RootState) => state.drawer.isOpen
    );

    return (
        <SidebarProvider defaultOpen={false} open={isDrawerOpen} style={{ width: 0, minHeight: 0 }} className="absolute">
            <style>{`
                .cart-sidebar[data-variant="sidebar"] {
                    position: fixed;
                }
            `}</style>
            <CartSidebarContent />
        </SidebarProvider>
    );
};

export default AddToCartDrawer;
