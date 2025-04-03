import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout";
import { AppProviders } from "./context/AppProvider";
import useAppInitializer from "./hooks/useAppInitializer";

const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const TransactionsPage = React.lazy(() => import("./pages/TransactionsPage"));
const AccountsPage = React.lazy(() => import("./pages/AccountsPage"));
const CategoriesPage = React.lazy(() => import("./pages/CategoriesPage"));

function AppRoutes() {
  useAppInitializer();

  return (
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
