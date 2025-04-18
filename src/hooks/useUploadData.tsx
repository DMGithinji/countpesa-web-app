import { useLocation, useNavigate } from "react-router-dom";
import { useCategoryRepository, useTransactionRepository } from "@/context/RepositoryContext";
import { getDecrypted } from "@/lib/encryptionUtils";
import { Category, Subcategory, UNCATEGORIZED } from "@/types/Categories";
import { ExtractedTransaction, TransactionTypes } from "@/types/Transaction";
import useTransactionStore from "@/stores/transactions.store";
import { deconstructTrCategory } from "@/lib/categoryUtils";
import { useLoadTransactions } from "./useLoadTransactions";

type CategoryData = {
  categoryName: string;
  subcategories: Record<string, string>;
};

export type PhoneBackupFormat = {
  categories: Category[];
  sub_categories: {
    name: string;
    id: string;
    category_id: string;
  }[];
  mpesaTrs: {
    mpesaCode: string;
    date: number;
    transaction_description: string;
    amount: number;
    account?: string;
    balance: number;
    category?: string;
    transaction_type: TransactionTypes;
  }[];
};

export type BrowserBackupFormat = {
  transactions: {
    code: string;
    date: number;
    transactionDescription: string;
    amount: number;
    account: string;
    balance: number;
    category?: string;
    transactionType: TransactionTypes;
  }[];
};

export type BackupFormat = PhoneBackupFormat | BrowserBackupFormat | unknown;

// Helper function to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

// Function to determine backup format type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getBackupType = (data: any): "phone" | "browser" | "unknown" => {
  if (
    data &&
    Array.isArray(data.categories) &&
    Array.isArray(data.sub_categories) &&
    Array.isArray(data.mpesaTrs)
  ) {
    return "phone";
  }

  if (data && Array.isArray(data.transactions)) {
    return "browser";
  }

  return "unknown";
};

export function useUploadData() {
  const transactionRepository = useTransactionRepository();
  const categoryRepository = useCategoryRepository();
  const { loadInitialTransactions } = useLoadTransactions();
  const setLoading = useTransactionStore((state) => state.setLoading);

  const navigate = useNavigate();
  const location = useLocation();

  const processPhoneBackup = async (data: PhoneBackupFormat): Promise<void> => {
    const transactions = data.mpesaTrs.map(
      (tx) =>
        ({
          code: tx.mpesaCode,
          date: tx.date * 1000, // Convert to milliseconds
          description: tx.transaction_description,
          amount: tx.amount,
          account: tx.account || "Unknown",
          balance: tx.balance,
          category: tx.category || UNCATEGORIZED,
          type: tx.transaction_type,
          status: "Completed",
        }) as ExtractedTransaction
    );

    const categories = data.categories.map((c) => ({ name: c.name, id: c.id }) as Category);

    const subcategories = data.sub_categories.map(
      (subcat) =>
        ({
          name: subcat.name,
          id: subcat.id,
          categoryId: subcat.category_id,
        }) as Subcategory
    );

    // Save to database
    await transactionRepository.processMpesaStatementData(transactions);
    await categoryRepository.bulkAddCategories(categories);
    await categoryRepository.bulkAddSubcategories(subcategories);
  };

  const processBrowserBackup = async (data: BrowserBackupFormat): Promise<void> => {
    const transactions = data.transactions.map(
      (tx) =>
        ({
          code: tx.code,
          date: tx.date,
          description: tx.transactionDescription,
          amount: tx.amount,
          account: tx.account,
          balance: tx.balance,
          category: tx.category || UNCATEGORIZED,
          type: tx.transactionType,
          status: "Completed",
        }) as ExtractedTransaction
    );

    // Extract categories and subcategories from transactions
    const categoryData = data.transactions.reduce((acc: Record<string, CategoryData>, tr) => {
      if (!tr.category) return acc;

      const { category, subcategory } = deconstructTrCategory(tr.category);

      if (!acc[category]) {
        acc[category] = { categoryName: category, subcategories: {} };
      }

      if (subcategory && !acc[category].subcategories[subcategory]) {
        acc[category].subcategories[subcategory] = subcategory;
      }

      return acc;
    }, {});

    // Save transactions to database
    await transactionRepository.processMpesaStatementData(transactions);

    // Save categories and subcategories
    await Object.values(categoryData).reduce(async (previousPromise, categoryItem) => {
      // Wait for the previous promise to complete
      await previousPromise;

      const { categoryName, subcategories } = categoryItem;

      const id = await categoryRepository.addCategory({
        name: categoryName,
        id: categoryName,
      });

      if (!id) {
        throw new Error(`Failed to add category: ${categoryName}`);
      }

      const subs = Object.keys(subcategories).map((s) => ({
        name: s,
        categoryId: id,
        id: `${id}:${s}`,
      }));

      await categoryRepository.bulkAddSubcategories(subs);

      // Return a resolved promise for the next iteration
      return Promise.resolve();
    }, Promise.resolve());
  };

  const uploadData = async (file: File) => {
    const fileContent = await readFileAsText(file);
    const decrypted = getDecrypted(fileContent);
    const jsonData = JSON.parse(decrypted) as BackupFormat;
    const backupType = getBackupType(jsonData);

    switch (backupType) {
      case "phone":
        await processPhoneBackup(jsonData as PhoneBackupFormat);
        break;

      case "browser":
        await processBrowserBackup(jsonData as BrowserBackupFormat);
        break;
      default:
        throw new Error("Invalid backup format");
    }
    await loadInitialTransactions();
    const isBaseUrl = location.pathname === "/";
    if (isBaseUrl) {
      navigate("/dashboard");
    } else {
      setLoading(false);
    }
  };

  return {
    uploadData,
  };
}
