import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout";
import { AppProviders } from "./context/AppProvider";
import useAppInitializer from "./hooks/useAppInitializer";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AccountsPage from "./pages/AccountsPage";
import CategoriesPage from "./pages/CategoriesPage";

function AppRoutes() {
  useAppInitializer();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
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
  );
}

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
