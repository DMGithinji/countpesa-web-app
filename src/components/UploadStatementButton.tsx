import { useState } from "react";
import { Eye, EyeOff, FileDown } from "lucide-react";
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ExtractedTransaction } from "@/types/Transaction"
import transactionRepository from "@/database/TransactionRepository";
import { useTransactions } from "@/hooks/useTransactions";


const UploadStatementButton = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {loadTransactions} = useTransactions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !password) {
      toast.error("Please provide both a statement file and password");
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

      const data = await response.json() as {
        message: string;
        status: string;
        results: {
          transactions: ExtractedTransaction[]
        }
      };

      if (data.status === "success") {
        console.log("API Response:", data);
        await transactionRepository.processMpesaStatementData(data.results.transactions);
        loadTransactions()
        toast("Your statement has been processed successfully");
        setOpen(false);
        setFile(null);
        setPassword("");
      } else {
        throw new Error(data.message || "Failed to process statement");
      }
    } catch (error) {
      console.error("Error processing statement:", error);
      toast("Failed to process statement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-md cursor-pointer"
      >
        <FileDown className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-gray-800 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Upload M-Pesa Statement</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 pb-2">
            <div className="text-gray-300 space-y-4 pb-2">
              <h3 className="font-medium">Below are steps to follow:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Get your full mpesa statement from <span className="font-medium">MySafaricom</span> app
                    or by dialling <span className="font-medium">*334# &gt; My Account &gt; M-PESA Statement &gt;...</span></li>
                <li>Upload the M-Pesa statement emailed to you and enter the password
                    sent to you via SMS.</li>
              </ol>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statement" className="text-gray-300">Mpesa Statement PDF</Label>
                <div className="flex">
                  <Label
                    htmlFor="statement"
                    className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded cursor-pointer hover:bg-gray-700"
                  >
                    <span className="text-gray-400">
                      {file ? file.name : "No file chosen"}
                    </span>
                    <span className="bg-gray-700 px-3 py-1 rounded text-sm">Choose File</span>
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
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-gray-800 border-gray-700 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Process File"
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadStatementButton;