import { useEffect } from "react";
import useCategories from "./useCategories";
import { useLoadTransactions } from "./useLoadTransactions";
import useTransactionStore from "@/stores/transactions.store";

function useAppInitializer() {
  const { loadInitialTransactions } = useLoadTransactions();
  const { preloadDefaultCategories } = useCategories();
  const setLoading = useTransactionStore(state => state.setLoading);

  useEffect(() => {
    loadInitialTransactions().then(() => setTimeout(() => setLoading(false), 200));
    preloadDefaultCategories();
  }, []);

}

export default useAppInitializer;
