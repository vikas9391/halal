import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { CalendarCog, ChevronLeft, CreditCard, LayoutDashboard, LogOut, MapPin, MessageSquare, PanelLeft, Settings2, UserCog, Users, ImagePlus } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [
  { icon: LayoutDashboard, label: "Bookings desk", path: "/admin" },
  { icon: MapPin, label: "Tours", path: "/admin/tours" },
  { icon: CalendarCog, label: "Departure desk", path: "/admin/departures" },
  { icon: MessageSquare, label: "Enquiries", path: "/admin/enquiries" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: ImagePlus, label: "Media", path: "/admin/media" },
  { icon: Settings2, label: "Settings", path: "/admin/settings" },
  { icon: UserCog, label: "Profile", path: "/admin/profile" },
  { icon: LayoutDashboard, label: "Public site", path: "/" },
];
const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  useEffect(() => { localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()); }, [sidebarWidth]);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <div className="flex items-center justify-center min-h-screen relative"><Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Back to site</Link><div className="flex flex-col items-center gap-8 p-8 max-w-md w-full"><div className="flex flex-col items-center gap-6"><h1 className="text-2xl font-semibold tracking-tight text-center">Sign in to continue</h1><p className="text-sm text-muted-foreground text-center max-w-sm">Administrator access requires a staff account.</p></div><LoginForm /></div></div>;
  if (!user.is_staff) return <div className="min-h-screen grid place-items-center px-6"><div className="text-center max-w-md"><h1 className="text-2xl font-semibold">Admin access required</h1><p className="mt-2 text-sm text-muted-foreground">This account is a customer account. Use your customer profile instead.</p><Link href="/profile" className="inline-block mt-5 underline">Open my profile</Link></div></div>;
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent></SidebarProvider>;
}

type DashboardLayoutContentProps = { children: React.ReactNode; setSidebarWidth: (width: number) => void };
function DashboardLayoutContent({ children, setSidebarWidth }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  useEffect(() => { if (isCollapsed) setIsResizing(false); }, [isCollapsed]);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (!isResizing) return; const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0; const newWidth = e.clientX - sidebarLeft; if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth); };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) { document.addEventListener("mousemove", handleMouseMove); document.addEventListener("mouseup", handleMouseUp); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }
    return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [isResizing, setSidebarWidth]);
  return <><div className="relative" ref={sidebarRef}><Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}><SidebarHeader className="h-16 justify-center"><div className="flex items-center gap-3 px-2 transition-all w-full"><button onClick={toggleSidebar} className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg" aria-label="Toggle navigation"><PanelLeft className="h-4 w-4 text-muted-foreground" /></button>{!isCollapsed ? <div className="flex items-center gap-2 min-w-0"><span className="font-semibold tracking-tight truncate">Halal Tours</span></div> : null}</div></SidebarHeader><SidebarContent className="gap-0"><SidebarMenu className="px-2 py-1">{menuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-10 transition-all font-normal"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 w-full text-left"><Avatar className="h-9 w-9 border shrink-0"><AvatarFallback className="text-xs font-medium">{user?.full_name?.charAt(0).toUpperCase()}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate leading-none">{user?.full_name || "-"}</p><p className="text-xs text-muted-foreground truncate mt-1.5">{user?.email || "-"}</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={() => setLocation("/admin/profile")} className="cursor-pointer"><UserCog className="mr-2 h-4 w-4" />Profile</DropdownMenuItem><DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><div className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }} style={{ zIndex: 50 }} /></div><SidebarInset>{isMobile && <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 sticky top-0 z-40"><div className="flex items-center gap-2"><SidebarTrigger className="h-9 w-9 rounded-lg bg-background" /><span>{activeMenuItem?.label ?? "Menu"}</span></div></div>}<main className="flex-1 p-4">{children}</main></SidebarInset></>;
}
