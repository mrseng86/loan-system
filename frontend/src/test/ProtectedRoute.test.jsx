import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

import ProtectedRoute from "../components/ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderProtectedPath() {
  render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <div>Private Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("renders protected content when token exists", () => {
    mockUseAuth.mockReturnValue({ token: "test-token" });
    renderProtectedPath();
    expect(screen.getByText("Private Content")).toBeInTheDocument();
  });

  it("redirects to login when token missing", () => {
    mockUseAuth.mockReturnValue({ token: null });
    renderProtectedPath();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
