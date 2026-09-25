import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import BotConnections from "./pages/BotConnections";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import SlipVerifier from "./pages/SlipVerifier";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/workspace"} component={Dashboard} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/dashboard/orders"} component={Orders} />
      <Route path={"/dashboard/products"} component={Products} />
      <Route path={"/dashboard/slip-verifier"} component={SlipVerifier} />
      <Route path={"/dashboard/bots"} component={BotConnections} />
      <Route path={"/dashboard/bot-settings"} component={BotConnections} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
