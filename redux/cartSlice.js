import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemsToCart: (state, action) => {
      state.items = action.payload; // replace with new selected items
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItemsToCart, updateQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
