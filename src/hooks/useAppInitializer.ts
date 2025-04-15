import { useEffect, useRef } from "react";
import useCategories from "./useCategories";
import { useLoadTransactions } from "./useLoadTransactions";

function useAppInitializer() {
  const initialized = useRef(false);
  const { loadInitialTransactions } = useLoadTransactions();
  const { preloadDefaultCategories } = useCategories();

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadInitialTransactions();
      preloadDefaultCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run onces
}

export default useAppInitializer;
