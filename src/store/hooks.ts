import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// Типизированные хуки Redux (рекомендуемый паттерн RTK).
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: <TSelected>(
  selector: (state: RootState) => TSelected,
) => TSelected = useSelector;
