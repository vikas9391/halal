import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Loader2, LogOut, Mail, Phone, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, loading, updateProfile, logout } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  if (loading) return <main className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></main>;
  if (!user) return <main className="min-h-screen grid place-items-center"><div className="text-center"><h1 className="text-2xl font-semibold">Sign in required</h1><Link href="/login" className="underline mt-3 inline-block">Go to login</Link></div></main>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName.trim(), phone: phone.trim() });
      toast.success("Profile saved");
    } catch {
      toast.error("Couldn't save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <section className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div><p className="text-sm text-primary font-medium">My account</p><h1 className="text-3xl font-semibold">Profile</h1><p className="text-sm text-muted-foreground mt-2">These details are saved to your Halal Tours account and can be reused when you book.</p></div>
          <Button variant="outline" onClick={() => { logout(); window.location.href = "/"; }}><LogOut className="size-4" /> Sign out</Button>
        </div>
        <form onSubmit={submit} className="rounded-2xl border bg-card p-7 shadow-sm space-y-5">
          <div className="flex flex-col gap-1.5"><Label><UserIcon className="inline size-4 mr-1" /> Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
          <div className="flex flex-col gap-1.5"><Label><Mail className="inline size-4 mr-1" /> Email</Label><Input value={user.email} disabled readOnly /><p className="text-xs text-muted-foreground">Email is your login and cannot be changed here.</p></div>
          <div className="flex flex-col gap-1.5"><Label><Phone className="inline size-4 mr-1" /> Phone</Label><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></div>
          <Button type="submit" disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}</Button>
        </form>
      </section>
    </main>
  );
}
