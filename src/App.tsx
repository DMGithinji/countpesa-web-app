import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AccountsPage from "./pages/AccountsPage";
import CategoriesPage from "./pages/CategoriesPage";
import Layout from "./components/Layout";
import { AppProviders } from "./context/AppProvider";
import useAppInitializer from "./hooks/useAppInitializer";
import LandingPage from "./pages/LandingPage";
import useTransactionStore from "./stores/transactions.store";
import Loader from "./components/Loader";

// A component that handles initialization for app routes
function AppInitializer({ children }: { children: React.ReactNode }) {
  useAppInitializer();
  const loading = useTransactionStore((state) => state.loading);
  if (loading) {
    return <Loader />;
  }
  return children;
}

function AppRoutes() {
  const routes = [
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/transactions", element: <TransactionsPage /> },
    { path: "/accounts", element: <AccountsPage /> },
    { path: "/categories", element: <CategoriesPage /> },
  ];

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <AppInitializer>
              <Layout>{route.element}</Layout>
            </AppInitializer>
          }
        />
      ))}

      {routes.map((route) => (
        <Route
          key={`demo${route.path}`}
          path={`/demo${route.path}`}
          element={
            <AppInitializer>
              <Layout>{route.element}</Layout>
            </AppInitializer>
          }
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
