"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type { RootState } from "@/redux/store";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { removeFromCart, updateQuantity } from "@/redux/slice/cartSlice";

export interface IProduct {
  id: number;
  name: string;
  price: number;
  photo: string;
  quantity: number;
}

const ProductInformation = () => {
  const dispatch = useAppDispatch();
  const cartItemData = useAppSelector((state: RootState) => state.cart.items);

  const handleQuantityIncrease = (id: any) => {
    const item = cartItemData.find((item) => item.id === id);
    if (item) {
      dispatch(updateQuantity({ id, quantity: item.quantity + 1 }));
    }
  };

  const handleQuantityDecrease = (id: any) => {
    const item = cartItemData.find((item) => item.id === id);
    if (item && item.quantity > 1) {
      dispatch(updateQuantity({ id, quantity: item.quantity - 1 }));
    }
  };

  const handleRemoveItem = (id: any) => {
    dispatch(removeFromCart({ id }));
  };

  if (cartItemData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500">Add some products to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 h-full flex flex-col rounded-lg sm:p-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className=" text-sm md:text-lg font-semibold primaryColor mb-2">
          Shopping Cart
        </h1>
        <p className="text-gray-600"></p>
      </div>

      {/* Cart Items - Scrollable */}
      <ScrollArea className="h-auto flex-1 pr-0 md:pr-2 lg:max-h-[450px]">
        <div className="space-y-0">
          {cartItemData.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-start gap-2 border border-gray-200 rounded-lg p-2 transition-shadow hover:shadow-sm md:gap-4 md:p-3">
                {/* Product Image */}
                <div className="relative w-12 h-12  md:w-16 md:h-16 shrink-0">
                  <Image
                    src={item.photo || "/placeholder.svg?height=80&width=80"}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 text-xs font-medium text-gray-900 break-words whitespace-normal line-clamp-2 md:text-sm md:font-semibold">
                    {item.name}
                  </h3>

                  {/* Display Color and Options if they exist */}
                  {(item.color ||
                    (item.options && item.options.length > 0)) && (
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500 mb-2">
                      {item.color && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-700">
                            Color:
                          </span>
                          <span>{item.color.name}</span>
                        </div>
                      )}

                      {item.color &&
                        item.options &&
                        item.options.length > 0 && (
                          <span className="text-gray-300">|</span>
                        )}

                      {item.options &&
                        item.options.map((opt: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="font-medium text-gray-700">
                              {opt.type}:
                            </span>
                            <span>{opt.value}</span>
                            {idx < (item.options?.length ?? 0) - 1 && (
                              <span className="text-gray-300 ml-2">|</span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => handleQuantityDecrease(item.id)}
                        disabled={item.quantity <= 1}
                        className=" h-6  w-6 md:h-8 md:w-8 p-0 hover:bg-gray-100"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => handleQuantityIncrease(item.id)}
                        className="h-6  w-6 md:h-8 md:w-8 p-0 hover:bg-gray-100"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="block shrink-0 md:hidden">
                  <div className="w-full flex justify-end items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className={` text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 ${
                        item.quantity > 1 ? "-mt-2" : ""
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className=" text-xs font-medium md:font-semibold text-gray-900">
                    TK- {Math.round(item.price * item.quantity)}
                  </p>
                  {item.deliveryCharge && (
                    <p className="text-xs text-gray-500">
                      Shipping: {Math.round(item.deliveryCharge)}
                    </p>
                  )}
                </div>
                {/* Price */}
                <div className="text-right hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className={`text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 ${
                      item.quantity > 1 ? "-mt-2" : ""
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <p className="font-semibold text-gray-900">
                    ৳ {Math.round(item.price * item.quantity)}
                  </p>
                  {item.deliveryCharge && (
                    <p className="text-xs text-gray-500">
                      Shipping: ৳ {Math.round(item.deliveryCharge)}
                    </p>
                  )}
                </div>
              </div>
              {index < cartItemData.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProductInformation;
