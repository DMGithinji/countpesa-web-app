import { useEffect } from 'react';
import useCategories from './useCategories';


export function useAppInitializer() {
  const {preloadDefaultCategories} = useCategories();

  useEffect(() => {
    preloadDefaultCategories();
  }, [preloadDefaultCategories]);
}

export default useAppInitializer;
