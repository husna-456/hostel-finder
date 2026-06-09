import { useState, useEffect } from "react";
import { fetchClient } from "../../api/fetchClient";
import { toast } from "react-toastify";
import { Save, Settings as SettingsIcon } from "lucide-react";

const TABS = ["General", "Booking & Payments", "Access Control", "Reviews", "Legal"];

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-purple-600" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function Field({ label, description, type = "text", value, onChange, ...rest }) {
  const baseClass = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition";
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {description && <p className="text-xs text-gray-500 mb-1.5">{description}</p>}
      {type === "textarea" ? (
        <textarea
          className={`${baseClass} resize-y`}
          rows={6}
          value={value}
          onChange={e => onChange(e.target.value)}
          {...rest}
        />
      ) : (
        <input
          type={type}
          className={baseClass}
          value={value}
          onChange={e => onChange(e.target.value)}
          {...rest}
        />
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [tab,     setTab]     = useState(0);
  const [form,    setForm]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetchClient("/admin/settings")
      .then(data => setForm(data))
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await fetchClient("/admin/settings", { method: "PUT", body: JSON.stringify(form) });
      toast.success("Settings saved!");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <SettingsIcon size={22} className="text-purple-600" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Platform Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-60 w-full sm:w-auto justify-center"
        >
          <Save size={15} />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                tab === i ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">

        {/* ── General / Branding ── */}
        {tab === 0 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-700 mb-1">General &amp; Branding</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Site Name" value={form.siteName || ""} onChange={set("siteName")} />
              <Field label="Logo URL" value={form.logoUrl || ""} onChange={set("logoUrl")} placeholder="https://…" />
              <Field label="Support Email" type="email" value={form.supportEmail || ""} onChange={set("supportEmail")} />
              <Field label="Support Phone" value={form.supportPhone || ""} onChange={set("supportPhone")} />
              <Field label="Primary City" value={form.primaryCity || ""} onChange={set("primaryCity")} />
              <Field label="Featured Hostels on Homepage" type="number" value={form.featuredHostelLimit ?? 6} onChange={v => set("featuredHostelLimit")(Number(v))} min={1} max={50} />
            </div>
          </div>
        )}

        {/* ── Booking & Payments ── */}
        {tab === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-700 mb-1">Booking &amp; Payments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Advance Payment (%)"
                description="Percentage of seat price taken as advance from the student"
                type="number"
                value={form.advancePercent ?? 30}
                onChange={v => set("advancePercent")(Number(v))}
                min={1} max={100}
              />
              <Field
                label="Platform Commission (%)"
                description="Commission % deducted from owner payouts"
                type="number"
                value={form.platformCommission ?? 0}
                onChange={v => set("platformCommission")(Number(v))}
                min={0} max={100}
              />
            </div>

            <div className="mt-2">
              <p className="text-sm font-semibold text-gray-700 mb-1">Payment Methods</p>
              <p className="text-xs text-gray-500 mb-3">Disable a method to hide and reject it during checkout.</p>
              <Toggle
                label="Stripe (Card Payments)"
                description="Credit / debit card payments via Stripe"
                checked={!!form.stripeEnabled}
                onChange={set("stripeEnabled")}
              />
              <Toggle
                label="JazzCash"
                description="Mobile wallet — manual receipt upload"
                checked={!!form.jazzCashEnabled}
                onChange={set("jazzCashEnabled")}
              />
              <Toggle
                label="Easypaisa"
                description="Mobile wallet — manual receipt upload"
                checked={!!form.easypaisaEnabled}
                onChange={set("easypaisaEnabled")}
              />
            </div>
          </div>
        )}

        {/* ── Access Control ── */}
        {tab === 2 && (
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-700 mb-3">Access Control</h2>
            <Toggle
              label="Maintenance Mode"
              description="When ON, only admins can access the site. All other users see a maintenance message."
              checked={!!form.maintenanceMode}
              onChange={set("maintenanceMode")}
            />
            <Toggle
              label="Allow User (Client) Registration"
              description="When OFF, new client sign-ups are rejected."
              checked={!!form.allowUserRegistration}
              onChange={set("allowUserRegistration")}
            />
            <Toggle
              label="Allow Hostel Owner Registration"
              description="When OFF, new owner sign-ups are rejected."
              checked={!!form.allowOwnerRegistration}
              onChange={set("allowOwnerRegistration")}
            />
          </div>
        )}

        {/* ── Reviews ── */}
        {tab === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-700 mb-1">Student Reviews</h2>
            <Toggle
              label="Enable Reviews Section"
              description="Show the 'What Students Say' section on the homepage"
              checked={!!form.reviewsEnabled}
              onChange={set("reviewsEnabled")}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Reviews on Homepage"
                description="Max number of approved reviews shown on the homepage"
                type="number"
                value={form.reviewsLimit ?? 6}
                onChange={v => set("reviewsLimit")(Number(v))}
                min={1} max={20}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sort Reviews By</label>
                <p className="text-xs text-gray-500 mb-1.5">Order of reviews shown on the homepage</p>
                <select
                  value={form.reviewsSortBy || "latest"}
                  onChange={e => set("reviewsSortBy")(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                >
                  <option value="latest">Latest First</option>
                  <option value="highest_rated">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Legal ── */}
        {tab === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-700 mb-1">Legal Texts</h2>
            <Field
              label="Terms &amp; Conditions"
              description="Shown on the signup page and footer"
              type="textarea"
              value={form.termsAndConditions || ""}
              onChange={set("termsAndConditions")}
              placeholder="Enter Terms & Conditions here…"
            />
            <Field
              label="Privacy Policy"
              type="textarea"
              value={form.privacyPolicy || ""}
              onChange={set("privacyPolicy")}
              placeholder="Enter Privacy Policy here…"
            />
          </div>
        )}
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-60 w-full sm:w-auto justify-center"
        >
          <Save size={15} />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
