import { useEffect } from "react";
import useTransactionStore from "@/stores/transactions.store";
import useCategories from "./useCategories";
import { useLoadTransactions } from "./useLoadTransactions";

function useAppInitializer() {
  const { loadInitialTransactions } = useLoadTransactions();
  const { preloadDefaultCategories } = useCategories();
  const setLoading = useTransactionStore((state) => state.setLoading);

  useEffect(() => {
    loadInitialTransactions().then(() => setTimeout(() => setLoading(false), 200));
    preloadDefaultCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run onces
}

export default useAppInitializer;
