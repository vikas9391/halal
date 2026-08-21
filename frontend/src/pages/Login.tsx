import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        await register(fullName, email, password, confirmPassword);
        toast.success("Account created", { description: "Your profile is now saved to your account." });
      } else {
        await login(email, password);
        toast.success("Welcome back");
      }
      setLocation("/traveler");
    } catch {
      toast.error(mode === "register" ? "Couldn't create account" : "Sign in failed", {
        description: "Please check your details and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      <section className="w-full max-w-md rounded-2xl border bg-card p-7 shadow-sm">
        <div className="mb-7">
          <p className="text-sm font-medium text-primary mb-2">Halal Tours</p>
          <h1 className="text-3xl font-semibold tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Sign in to save your profile and manage your journeys." : "Create an account so your contact and booking details can be saved for future journeys."}
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer-name">Full name</Label>
              <Input id="customer-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-email">Email</Label>
            <Input id="customer-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-password">Password</Label>
            <div className="relative">
              <Input id="customer-password" type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} className="pr-10" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-0 top-0 h-full px-3 text-muted-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {mode === "register" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer-confirm">Confirm password</Label>
              <Input id="customer-confirm" type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            </div>
          )}
          <Button type="submit" size="lg" disabled={submitting} className="w-full mt-2">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : mode === "login" ? "Sign in" : <><UserPlus className="size-4" /> Create account</>}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" className="font-medium text-foreground underline underline-offset-4" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </div>
        <Link href="/" className="block text-center mt-4 text-sm text-muted-foreground hover:text-foreground">Back to site</Link>
      </section>
    </main>
  );
}
