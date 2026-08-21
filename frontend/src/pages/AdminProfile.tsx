import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, User as UserIcon, UserCog } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function AdminProfile() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  const dirty =
    !!user && (fullName !== (user.full_name ?? "") || phone !== (user.phone ?? ""));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dirty) return;
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, phone });
      toast.success("Profile updated");
    } catch {
      toast.error("Couldn't save profile", {
        description: "Check the fields and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <main className="admin-shell">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Administrator</p>
            <h1>Your profile</h1>
            <p>
              Update the name and phone number attached to your admin account. Email is
              tied to your login and can't be changed here.
            </p>
          </div>
          <div className="admin-title-icon"><UserCog /></div>
        </div>

        <section className="settings-panel">
          <form className="settings-form" onSubmit={submit}>
            <label>
              <UserIcon size={14} />
              Full name
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </label>

            <label>
              <Phone size={14} />
              Phone
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </label>

            <label>
              <Mail size={14} />
              Email
              <input type="email" value={user?.email ?? ""} disabled readOnly />
              <small>Email is your login and can't be edited here.</small>
            </label>

            <button type="submit" className="admin-save" disabled={!dirty || saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
            </button>
          </form>
        </section>
      </main>
    </DashboardLayout>
  );
}
