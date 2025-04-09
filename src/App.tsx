import { Routes, Route } from "react-router-dom";
import { AppProviders } from "./context/AppProvider";
import useAppInitializer from "./hooks/useAppInitializer";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AccountsPage from "./pages/AccountsPage";
import CategoriesPage from "./pages/CategoriesPage";
import Layout from "./components/Layout";
import useTransactionStore from "./stores/transactions.store";
import Loader from "./components/Loader";

function AppRoutes() {
  useAppInitializer();
  const loading = useTransactionStore((state) => state.loading);

  const routes = [
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/transactions", element: <TransactionsPage /> },
    { path: "/accounts", element: <AccountsPage /> },
    { path: "/categories", element: <CategoriesPage /> },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={<Layout>{route.element}</Layout>} />
      ))}

      {routes.map((route) => (
        <Route
          key={`demo${route.path}`}
          path={`/demo${route.path}`}
          element={<Layout>{route.element}</Layout>}
        />
      ))}
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
