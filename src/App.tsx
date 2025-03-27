import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AccountsPage from "./pages/AccountsPage";
import CategoriesPage from "./pages/CategoriesPage";
import MainLayout from "./components/Layout";
import useCategories from "./hooks/useCategories";
import { TransactionDataProvider } from "./context/TransactionDataContext";
import { AIContextProvider } from "./context/AIContext";

function App() {
  useCategories();

  return (
    <TransactionDataProvider>
      <AIContextProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              }
            />
            <Route
              path="/transactions"
              element={
                <MainLayout>
                  <TransactionsPage />
                </MainLayout>
              }
            />
            <Route
              path="/accounts"
              element={
                <MainLayout>
                  <AccountsPage />
                </MainLayout>
              }
            />
            <Route
              path="/categories"
              element={
                <MainLayout>
                  <CategoriesPage />
                </MainLayout>
              }
            />
          </Routes>
        </Router>
      </AIContextProvider>
    </TransactionDataProvider>
  );
}

export default App;
