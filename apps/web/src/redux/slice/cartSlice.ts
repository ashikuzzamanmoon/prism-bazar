import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    photo: string;
    quantity: number;
    deliveryCharge: number;
    isDigital?: boolean;
    color?: {
        id: string;
        name: string;
    };
    options?: {
        id: string;
        type: string;
        value: string;
    }[];
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (
            state,
            action: PayloadAction<Omit<CartItem, "quantity"> & { quantity: number }>
        ) => {
            const { id, quantity } = action.payload;

            const existingItem = state.items.find((item) => item.id === id);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ ...action.payload, quantity });
            }
        },

        removeFromCart: (state, action: PayloadAction<{ id: string }>) => {
            state.items = state.items.filter((item) => item.id !== action.payload.id);
        },

        clearCart: (state) => {
            state.items = [];
        },
        // Add this reducer in cartSlice
        updateQuantity: (
            state,
            action: PayloadAction<{ id: string; quantity: number }>
        ) => {
            const item = state.items.find((item) => item.id === action.payload.id);
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },

    },
});

export const { addToCart, removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;