import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.toymarket.site";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/`,
  prepareHeaders: (headers) => {
    headers.set("Cache-Control", "no-cache");
    return headers;
  },
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 2 });

export const api = createApi({
  reducerPath: "splitApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: [],
  endpoints: () => ({}),
});
