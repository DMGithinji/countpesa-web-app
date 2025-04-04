import React, { useState } from "react";
import { useLoadInitialTransactions } from "@/hooks/useTransactions";
import { getDecrypted } from "@/lib/encryptionUtils";
import { Category, Subcategory, UNCATEGORIZED } from "@/types/Categories";
import { ExtractedTransaction, TransactionTypes } from "@/types/Transaction";
import transactionRepository from "@/database/TransactionRepository";
import categoryRepository from "@/database/CategoryRepository";
import backupHint from "../../assets/backup-hint.png";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Define types at the top for better organization
type CategoryData = {
  categoryName: string;
  subcategories: Record<string, string>;
};

type PhoneBackupFormat = {
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

type BrowserBackupFormat = {
  transactions: {
    mpesaCode: string;
    date: number;
    transactionDescription: string;
    amount: number;
    account: string;
    balance: number;
    category?: string;
    subcategory?: string;
    transactionType: TransactionTypes;
  }[];
};

type BackupFormat = PhoneBackupFormat | BrowserBackupFormat | unknown;

// Utility functions to process different backup formats
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
      } as ExtractedTransaction)
  );

  // Process categories and subcategories
  const categories = data.categories.map((c) => ({ name: c.name, id: c.id } as Category));

  const subcategories = data.sub_categories.map(
    (subcat) =>
      ({
        name: subcat.name,
        id: subcat.id,
        categoryId: subcat.category_id,
      } as Subcategory)
  );

  // Save to database
  await transactionRepository.processMpesaStatementData(transactions);
  await Promise.all(categories.map(categoryRepository.addCategory));
  await Promise.all(subcategories.map(categoryRepository.addSubcategory));
};

const processBrowserBackup = async (
  data: BrowserBackupFormat
): Promise<void> => {
  const transactions = data.transactions.map(
    (tx) =>
      ({
        code: tx.mpesaCode,
        date: tx.date * 1000, // Convert to milliseconds
        description: tx.transactionDescription,
        amount: tx.amount,
        account: tx.account,
        balance: tx.balance,
        category:
          tx.category && tx.subcategory
            ? `${tx.category}: ${tx.subcategory}`
            : UNCATEGORIZED,
        type: tx.transactionType,
        status: "Completed",
      } as ExtractedTransaction)
  );

  // Extract categories and subcategories from transactions
  const categoryData = data.transactions.reduce(
    (acc: Record<string, CategoryData>, tr) => {
      if (!tr.category) return acc;

      const category = tr.category;
      const subcategory = tr.subcategory;

      if (!acc[category]) {
        acc[category] = { categoryName: category, subcategories: {} };
      }

      if (subcategory && !acc[category].subcategories[subcategory]) {
        acc[category].subcategories[subcategory] = subcategory;
      }

      return acc;
    },
    {}
  );

  // Save transactions to database
  await transactionRepository.processMpesaStatementData(transactions);

  // Save categories and subcategories
  for (const data of Object.values(categoryData)) {
    const { categoryName, subcategories } = data;
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

    await Promise.all(subs.map(categoryRepository.addSubcategory));
  }
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

const BackupRestoreSection: React.FC<{ setOpen: (open: boolean) => void }> = ({
  setOpen,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const { fetchTransactions } = useLoadInitialTransactions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(""); // Clear previous errors when file changes
    }
  };

  const handleRestore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a backup file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const fileContent = await readFileAsText(file);
      const decrypted = getDecrypted(fileContent);
      const jsonData = JSON.parse(decrypted) as BackupFormat;
      const backupType = getBackupType(jsonData);

      switch (backupType) {
        case "phone":
          await processPhoneBackup(jsonData as PhoneBackupFormat);
          fetchTransactions();
          setOpen(false);
          break;

        case "browser":
          await processBrowserBackup(jsonData as BrowserBackupFormat);
          fetchTransactions();
          setOpen(false);
          break;

        default:
          setError(
            "Invalid backup file format. Please ensure you're using a valid backup from CountPesa."
          );
      }
    } catch (err) {
      console.error("Error restoring backup:", err);
      setError(
        err instanceof Error ? err.message : "Error processing backup file"
      );
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <form onSubmit={handleRestore} className="space-y-4">
      <img src={backupHint} alt="Backup Guide" className="w-80 mx-auto" />

      <p className="text-sm">
        Backups can be downloaded from:
        <br />
        <strong>1. Top Menu Section of the Web App</strong>
        <br />
        <strong>2. Homescreen of your CountPesa App</strong>
        <br />
        This is especially useful if you have been categorizing transactions.
      </p>

      <div className="space-y-2">
        <Input
          id="backup"
          type="file"
          accept=".json"
          onChange={handleFileChange}
        />
      </div>

      <Button
        disabled={uploading}
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
      >
        {uploading ? "Uploading..." : "Load Data"}
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <p className="text-xs text-gray-500">
        Your data is stored locally on your browser.
      </p>
    </form>
  );
};

export default BackupRestoreSection;
