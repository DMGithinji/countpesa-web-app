import { useEffect } from "react";
import useCategories from "./useCategories";
import { useLoadTransactions } from "./useLoadTransactions";

function useAppInitializer() {
  const { loadInitialTransactions } = useLoadTransactions();
  const { preloadDefaultCategories } = useCategories();

  useEffect(() => {
    loadInitialTransactions();
    preloadDefaultCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run onces
}

export default useAppInitializer;
