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

  const routes = [
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/transactions", element: <TransactionsPage /> },
    { path: "/accounts", element: <AccountsPage /> },
    { path: "/categories", element: <CategoriesPage /> }
  ];

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {routes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={<MainLayout>{route.element}</MainLayout>}
        />
      ))}

      {routes.map(route => (
        <Route
          key={`demo${route.path}`}
          path={`/demo${route.path}`}
          element={<MainLayout>{route.element}</MainLayout>}
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
