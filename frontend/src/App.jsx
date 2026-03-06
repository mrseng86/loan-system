import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import LoansPage from "./pages/LoansPage";
import RepaymentsPage from "./pages/RepaymentsPage";
import CollectionsPage from "./pages/CollectionsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="loans" element={<LoansPage />} />
        <Route path="repayments" element={<RepaymentsPage />} />
        <Route path="collections" element={<CollectionsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
