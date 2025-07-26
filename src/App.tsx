import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import AIStylist from "./pages/AIStylist";
import Dashboard from "./pages/Dashboard";
import SwapMarket from "./pages/SwapMarket";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Store from "./pages/Store";
import NotFound from "./pages/NotFound";
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

const queryClient = new QueryClient();

const isAuthenticated = () => {
  return Boolean(localStorage.getItem('jwt'));
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated() ? <Index /> : <Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/ai-stylist" element={<AIStylist />} />
          <Route path="/swap" element={<SwapMarket />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/store" element={<Store />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
