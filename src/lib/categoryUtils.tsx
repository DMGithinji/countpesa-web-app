export const formatTrCategory = (category: string, subcategory: string) => {
  if (!subcategory) return category;
  return `${category}: ${subcategory}`;
};

export const deconstructTrCategory = (categoryStr: string) => {
  if (!categoryStr) {
    return { category: "", subcategory: "" };
  }

  const parts = categoryStr.split(":");
  return {
    category: parts[0]?.trim() || "",
    subcategory: parts.length > 1 ? parts[1]?.trim() || "" : "",
  };
};
