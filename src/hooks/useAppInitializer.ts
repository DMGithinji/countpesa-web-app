import { useEffect } from "react";
import useCategories from "./useCategories";
import { useLoadInitialTransactions } from "./useTransactions";

function useAppInitializer() {
  const { loadInitialTransactions } = useLoadInitialTransactions();
  const { preloadDefaultCategories } = useCategories();

  useEffect(() => {
    loadInitialTransactions();
    preloadDefaultCategories();
  }, [loadInitialTransactions, preloadDefaultCategories]);

}

export default useAppInitializer;
