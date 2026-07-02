import { createSlice } from "@reduxjs/toolkit";

interface SearchState {
  searchQuery: string;
}

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchQuery: "",
  } as SearchState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = "";
    },
  },
});

export const { setSearchQuery, clearSearchQuery } = searchSlice.actions;
export default searchSlice.reducer;
