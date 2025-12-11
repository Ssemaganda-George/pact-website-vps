import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProjectsProvider } from "@/context/ProjectsContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { smoothScrollToTop } from "@/lib/smoothScroll";

// Public Pages
import HomePage from "@/pages/HomePage";
import ServicesPage from "@/pages/ServicesPage";
import ServiceDetailPage from "@/pages/ServiceDetailPage";
import ExpertisePage from "@/pages/ExpertisePage";
import ClientsPage from "@/pages/ClientsPage";
import NewsPage from "@/pages/NewsPage";
import NewsDetailPage from "@/pages/NewsDetailPage";
import ContactPage from "@/pages/ContactPage";
import TeamPage from "@/pages/TeamPage";
import TeamMemberDetail from "@/pages/TeamMemberDetail";
import PublicLocationsPage from "@/pages/LocationsPage";
import AboutPage from "@/pages/AboutPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";

// Admin Pages
import AdminLoginPage from "@/pages/admin/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import AdminExpertisePage from "@/pages/admin/ExpertisePage";
import AdminServicesPage from "@/pages/admin/ServicesPage";
import AdminClientsPage from "@/pages/admin/ClientsPage";
import AdminProjectsPage from "@/pages/admin/ProjectsPage";
import BlogPage from "@/pages/admin/BlogPage";
import ContactMessagesPage from "@/pages/admin/ContactMessagesPage";
import RegisterPage from '@/pages/admin/RegisterPage';
import AdminTeamPage from '@/pages/admin/TeamPage';
import HeroSlidesPage from '@/pages/admin/HeroSlidesPage';
import AdminAboutPage from '@/pages/admin/AboutPage';
import ImpactStatsPage from '@/pages/admin/ImpactStatsPage';
import FooterSettingsPage from '@/pages/admin/FooterSettingsPage';
import AdminLocationsPage from '@/pages/admin/LocationsPage';

function PublicRouter() {
  const [location] = useLocation();
  
  // Smooth scroll to top on route change with professional animation
  useEffect(() => {
    // Use custom smooth scroll for better UX
    smoothScrollToTop({ duration: 600 });
  }, [location]);
  
  return (
    <div className="font-sans text-secondary bg-light">
      <Header />
      <main className="page-transition">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/service/:id" component={ServiceDetailPage} />
          <Route path="/expertise" component={ExpertisePage} />
          <Route path="/clients" component={ClientsPage} />
          <Route path="/projects" component={ProjectsPage} />
          <Route path="/projects/:id" component={ProjectDetailsPage} />
          <Route path="/news" component={NewsPage} />
          <Route path="/news/:slug" component={NewsDetailPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/team" component={TeamPage} />
          <Route path="/team/:slug" component={TeamMemberDetail} />
          <Route path="/locations" component={PublicLocationsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

// Import the AdminSidebar component
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from 'lucide-react';

// Admin layout with sidebar
function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md hover:bg-gray-50"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 lg:ml-64 p-4 lg:p-8 w-full">
        {children}
      </div>
    </div>
  );
}

function AdminRouter() {
  const [location] = useLocation();
  
  // If we're on the login page or register page, don't show the admin layout
  if (location === '/admin' || location === '/admin/login' || location === '/admin/register') {
    if (location === '/admin' || location === '/admin/login') {
      return <AdminLoginPage />;
    } else {
      return <RegisterPage />;
    }
  }

  // For all other admin routes, wrap with AdminLayout and ProtectedRoute
  return (
    <ProtectedRoute>
    <AdminLayout>
      <Switch>
        <Route path="/admin/dashboard" component={DashboardPage} />
        <Route path="/admin/content/hero-slides" component={HeroSlidesPage} />
        <Route path="/admin/content/about" component={AdminAboutPage} />
        <Route path="/admin/content/impact" component={ImpactStatsPage} />
        <Route path="/admin/content/team" component={AdminTeamPage} />
        <Route path="/admin/content/expertise" component={AdminExpertisePage} />
        <Route path="/admin/content/services" component={AdminServicesPage} />
        <Route path="/admin/content/clients" component={AdminClientsPage} />
        <Route path="/admin/content/projects" component={AdminProjectsPage} />
        <Route path="/admin/content/blog" component={BlogPage} />
        <Route path="/admin/content/footer" component={FooterSettingsPage} />
        <Route path="/admin/messages" component={ContactMessagesPage} />
        <Route path="/admin/locations" component={AdminLocationsPage} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
    </ProtectedRoute>
  );
}

function Router() {
  const [location] = useLocation();
  
  // Check if we're on an admin route
  const isAdminRoute = location.startsWith('/admin');
  
  // Separate routers for admin and public
  return isAdminRoute ? <AdminRouter /> : <PublicRouter />;
}

function App() {
  // Initialize AOS when App component mounts
  useEffect(() => {
    // @ts-ignore
    if (typeof AOS !== 'undefined') {
      // @ts-ignore
      AOS.init({
        duration: 800,
        once: true,
        offset: 100
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
        <ProjectsProvider>
          <Toaster />
          <Router />
        </ProjectsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
