import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDashboardEkzekutiv from "./pages/AdminDashboardEkzekutiv";

import AdminAplikimet from "./pages/AdminAplikimet";
import AplikimeteMia from "./pages/AplikimeteMia";
import NotFound from "./pages/NotFound";
import { useEffect, useRef } from 'react';

const queryClient = new QueryClient();

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const trail = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    // Only show on desktop
    if (window.matchMedia('(pointer: fine)').matches) {
      const moveCursor = (e: MouseEvent) => {
        mouse.current = { x: e.clientX, y: e.clientY };
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${e.clientX - 9}px, ${e.clientY - 9}px, 0)`;
        }
      };
      const animateTrail = () => {
        trail.current.x += (mouse.current.x - trail.current.x) * 0.18;
        trail.current.y += (mouse.current.y - trail.current.y) * 0.18;
        if (trailRef.current) {
          trailRef.current.style.transform = `translate3d(${trail.current.x - 14}px, ${trail.current.y - 14}px, 0)`;
        }
        requestRef.current = requestAnimationFrame(animateTrail);
      };
      document.addEventListener('mousemove', moveCursor);
      requestRef.current = requestAnimationFrame(animateTrail);

      // Hover effect for clickable elements
      const activate = (e: Event) => {
        if (cursorRef.current) cursorRef.current.classList.add('custom-cursor--active');
      };
      const deactivate = (e: Event) => {
        if (cursorRef.current) cursorRef.current.classList.remove('custom-cursor--active');
      };
      const selectors = 'button, a, [role="button"], [tabindex], .card, .shadcn-card';
      document.querySelectorAll(selectors).forEach(el => {
        el.addEventListener('mouseenter', activate);
        el.addEventListener('mouseleave', deactivate);
      });

      return () => {
        document.removeEventListener('mousemove', moveCursor);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        document.querySelectorAll(selectors).forEach(el => {
          el.removeEventListener('mouseenter', activate);
          el.removeEventListener('mouseleave', deactivate);
        });
      };
    }
  }, []);

  // Hide on mobile
  if (!window.matchMedia('(pointer: fine)').matches) return null;
  return (
    <>
      <div ref={trailRef} className="custom-cursor-trail" aria-hidden="true" />
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CustomCursor />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dashboard-ekzekutiv" element={<AdminDashboardEkzekutiv />} />
            <Route path="/aplikimet" element={<AplikimeteMia />} />
            <Route path="/admin/aplikimet" element={<AdminAplikimet />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
