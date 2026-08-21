import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LoginForm({
  onSuccess,
  className,
}: {
  onSuccess?: () => void;
  className?: string;
}) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const me = await login(email, password);
      if (me) {
        onSuccess?.();
      } else {
        toast.error("Sign in failed", {
          description: "Check your email and password and try again.",
        });
      }
    } catch {
      toast.error("Sign in failed", {
        description: "Check your email and password and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className={className ?? "flex flex-col gap-4 w-full"}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}
