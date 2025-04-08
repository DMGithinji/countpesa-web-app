import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ExtractedTransaction } from "@/types/Transaction";
import { useLoadTransactions } from "@/hooks/useLoadTransactions";
import { useTransactionRepository } from "@/context/RepositoryContext";
import useTransactionStore from "@/stores/transactions.store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function MpesaUploadSection({ setOpen }: { setOpen: (open: boolean) => void }) {
  const db = useTransactionRepository();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const { loadInitialTransactions } = useLoadTransactions();
  const setLoading = useTransactionStore((state) => state.setLoading);
  const accountTransactionDict = useTransactionStore((state) => state.accountCategoryDict);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !password) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("statement", file);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/process_pdf/", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        message: string;
        status: string;
        results: {
          transactions: ExtractedTransaction[];
        };
      };

      if (data.status === "success") {
        await db.processMpesaStatementData(data.results.transactions, accountTransactionDict);
        loadInitialTransactions().then(() => {
          const isBaseUrl = location.pathname === "/";
          if (isBaseUrl) {
            navigate("/dashboard");
            setTimeout(() => {
              setLoading(false);
            }, 200);
          }
        });

        setOpen(false);
        setFile(null);
        setPassword("");
      } else {
        throw new Error(data.message || "Failed to process statement");
      }
    } catch (err) {
      console.error("Error processing statement:", err);
      setError("Error processing statement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="space-y-4 pb-8">
          <h3 className="font-medium">Below are steps to follow:</h3>
          <ol className="list-decimal pl-5 text-[15px]">
            <li>
              Get your full mpesa statement from <span className="font-medium">MySafaricom</span>{" "}
              app or by dialling{" "}
              <span className="font-medium">
                *334# &gt; My Account &gt; M-PESA Statement &gt;...
              </span>
            </li>
            <li>
              Upload the M-Pesa statement emailed to you and enter the password sent to you via SMS.
            </li>
          </ol>
        </div>
        <Label htmlFor="statement">Statement</Label>
        <div className="flex">
          <Label
            htmlFor="statement"
            className="flex items-center justify-between w-full px-4 py-1 rounded cursor-pointer border border-foreground/20 text-foreground/60"
          >
            <span>{file ? file.name : "No file chosen"}</span>
            <span className="px-3 py-1 rounded text-sm">Choose File</span>
          </Label>
          <Input
            id="statement"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <Button disabled={isLoading} type="submit" className="w-full font-medium py-2 mt-2">
        {isLoading ? "Processing..." : "Process File"}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}

export default MpesaUploadSection;
