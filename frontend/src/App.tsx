import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./hooks/useAuth";
import Admin from "./pages/Admin";
import AdminCustomers from "./pages/AdminCustomers";
import AdminDepartures from "./pages/AdminDepartures";
import AdminEnquiries from "./pages/AdminEnquiries";
import AdminGallery from "./pages/AdminGallery";
import AdminPayments from "./pages/AdminPayments";
import AdminSettings from "./pages/AdminSettings";
import AdminProfile from "./pages/AdminProfile";
import AdminTours from "./pages/AdminTours";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Journey from "./pages/Journey";
import Traveler from "./pages/Traveler";
import UmrahRegistration from "./pages/UmrahRegistration";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/profile" component={Profile} />
    <Route path="/destinations" component={Destinations} />
    <Route path="/about" component={About} />
    <Route path="/contact" component={Contact} />
    <Route path="/register/thanksgiving-umrah-2026" component={UmrahRegistration} />
    <Route path="/admin" component={Admin} />
    <Route path="/admin/tours" component={AdminTours} />
    <Route path="/admin/departures" component={AdminDepartures} />
    <Route path="/admin/enquiries" component={AdminEnquiries} />
    <Route path="/admin/customers" component={AdminCustomers} />
    <Route path="/admin/payments" component={AdminPayments} />
    <Route path="/admin/media" component={AdminGallery} />
    <Route path="/admin/settings" component={AdminSettings} />
    <Route path="/admin/profile" component={AdminProfile} />
    <Route path="/journeys/:slug" component={Journey} />
    <Route path="/traveler" component={Traveler} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><AuthProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></AuthProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
