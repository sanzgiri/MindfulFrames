import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/Welcome";
import Home from "@/pages/Home";
import PauseDetail from "@/pages/PauseDetail";
import Gallery from "@/pages/Gallery";
import Settings from "@/pages/Settings";
import { Home as HomeIcon, Camera, Settings as SettingsIcon } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/dashboard" component={Home} />
      <Route path="/pause/:weekNumber" component={PauseDetail} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function BottomNav() {
  const [location] = useLocation();
  
  if (location === '/') return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon, testId: 'nav-dashboard' },
    { path: '/gallery', label: 'Gallery', icon: Camera, testId: 'nav-gallery' },
    { path: '/settings', label: 'Settings', icon: SettingsIcon, testId: 'nav-settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location === item.path || (item.path === '/dashboard' && location.startsWith('/pause'));
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover-elevate'
                  }`}
                  data-testid={item.testId}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="pb-16 md:pb-0">
            <Router />
            <BottomNav />
          </div>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
