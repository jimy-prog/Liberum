import { useState } from "react";
import { useMock } from "./store";
import { Avatar, Btn, Card, Field, Input } from "@/components/ui-kit";

export function MockSettingsPage() {
  const { user, signIn } = useMock();
  const [name, setName] = useState(user?.name ?? "");
  const [targetBand, setTargetBand] = useState("7.5");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState({ results: true, deadlines: true, product: false });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/mock/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, target_band: targetBand }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          signIn(data.user);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.warn("Could not save profile:", e);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Account Settings</h1>
      <p className="mt-1 text-sm text-ink-500">Manage your profile, target band, and notifications.</p>

      <Card className="mt-5 p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <Avatar initials={user?.initials ?? "U"} color="#7B61FF" size="lg" className="ring-2 ring-brand-200" />
          <div>
            <p className="font-display text-[16px] font-bold text-ink">{user?.name}</p>
            <p className="text-xs capitalize text-ink-400">{user?.role} account · {user?.email}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </Field>
          <Field label="Target IELTS Band">
            <Input value={targetBand} onChange={(e) => setTargetBand(e.target.value)} placeholder="e.g. 7.5 or 8.0" />
          </Field>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Btn size="sm" disabled={saving} onClick={handleSave}>
            {saved ? "Saved ✓" : saving ? "Saving…" : "Save changes"}
          </Btn>
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Notifications</h2>
        <div className="mt-4 space-y-3">
          {([
            ["results", "Test results", "When a score or AI estimate is ready"],
            ["deadlines", "Deadline reminders", "Before an assigned test is due"],
            ["product", "Product updates", "New tests and features"],
          ] as const).map(([key, label, sub]) => (
            <button key={key} onClick={() => setNotif((n) => ({ ...n, [key]: !n[key] }))}
              className="flex w-full items-center justify-between rounded-xl border border-line p-4 text-left transition hover:border-ink-300">
              <span>
                <span className="block text-sm font-semibold text-ink">{label}</span>
                <span className="block text-xs text-ink-400">{sub}</span>
              </span>
              <span className={`relative h-6 w-11 rounded-full transition ${notif[key] ? "bg-brand-500" : "bg-line"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${notif[key] ? "left-[22px]" : "left-0.5"}`} />
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
