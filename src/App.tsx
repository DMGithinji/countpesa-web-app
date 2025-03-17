import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import CategoriesPage from './pages/CategoriesPage';
import MainLayout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        } />
        <Route path="/transactions" element={
          <MainLayout>
            <TransactionsPage />
          </MainLayout>
        } />
        <Route path="/accounts" element={
          <MainLayout>
            <AccountsPage />
          </MainLayout>
        } />
        <Route path="/categories" element={
          <MainLayout>
            <CategoriesPage />
          </MainLayout>
        } />
      </Routes>
    </Router>
  )
}

export default App
