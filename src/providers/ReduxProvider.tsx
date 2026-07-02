"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";

/**
 * Оборачивает Redux store для App Router.
 * По гайду Redux + Next.js (https://redux.js.org/usage/nextjs) стор создаётся
 * один раз на клиенте и передаётся через Provider.
 */
export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
