import { useState, useEffect, useCallback } from "react";
import { fetchClient } from "../../api/fetchClient";
import { toast } from "react-toastify";
import { Plus, Trash2, Save, RotateCcw, Loader2, Globe, Phone, Mail, MapPin, Clock, HelpCircle, BarChart2 } from "lucide-react";

// ── Shared field component ─────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text", className = "" }) => (
  <input
    type={type}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-100 transition-all ${className}`}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-100 transition-all resize-none"
  />
);

// ── Contact tab ────────────────────────────────────────────────────────────
function ContactTab({ data, onChange }) {
  const set = (path, val) => {
    const parts = path.split(".");
    const next  = JSON.parse(JSON.stringify(data));
    let obj = next;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = val;
    onChange(next);
  };

  const addFaq    = () => onChange({ ...data, faqs: [...(data.faqs || []), { q: "", a: "" }] });
  const removeFaq = (i) => onChange({ ...data, faqs: data.faqs.filter((_, idx) => idx !== i) });
  const setFaq    = (i, field, val) => {
    const faqs = data.faqs.map((f, idx) => idx === i ? { ...f, [field]: val } : f);
    onChange({ ...data, faqs });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Section icon={Globe} title="Hero Section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Badge Text">
            <Input value={data?.hero?.badge} onChange={(v) => set("hero.badge", v)} placeholder="GET IN TOUCH" />
          </Field>
          <Field label="Response Time">
            <Input value={data?.responseTime} onChange={(v) => set("responseTime", v)} placeholder="Within 24 hours" />
          </Field>
        </div>
        <Field label="Hero Title">
          <Input value={data?.hero?.title} onChange={(v) => set("hero.title", v)} placeholder="We're here to help..." />
        </Field>
        <Field label="Hero Subtitle">
          <Textarea value={data?.hero?.subtitle} onChange={(v) => set("hero.subtitle", v)} placeholder="Describe your support offer..." />
        </Field>
      </Section>

      {/* Contact details */}
      <Section icon={Phone} title="Contact Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email"><Input type="email" value={data?.email} onChange={(v) => set("email", v)} placeholder="support@example.com" /></Field>
          <Field label="Phone"><Input value={data?.phone} onChange={(v) => set("phone", v)} placeholder="+92 (300) 0123-4567" /></Field>
          <Field label="Support Hours"><Input value={data?.supportHours} onChange={(v) => set("supportHours", v)} placeholder="Mon–Sun, 9AM–9PM" /></Field>
          <Field label="Google Maps URL"><Input value={data?.mapUrl} onChange={(v) => set("mapUrl", v)} placeholder="https://maps.google.com/..." /></Field>
        </div>
        <Field label="Address">
          <Textarea value={data?.address} onChange={(v) => set("address", v)} placeholder="Street, City, Province, Country" rows={2} />
        </Field>
      </Section>

      {/* FAQs */}
      <Section icon={HelpCircle} title="FAQ Items">
        <div className="space-y-3">
          {(data?.faqs || []).map((faq, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500">FAQ #{i + 1}</span>
                <button
                  onClick={() => removeFaq(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <Field label="Question">
                <Input value={faq.q} onChange={(v) => setFaq(i, "q", v)} placeholder="What is your question?" />
              </Field>
              <Field label="Answer">
                <Textarea value={faq.a} onChange={(v) => setFaq(i, "a", v)} placeholder="Your detailed answer..." />
              </Field>
            </div>
          ))}
        </div>
        <button
          onClick={addFaq}
          className="mt-3 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium px-3 py-2 rounded-xl hover:bg-purple-50 transition-colors"
        >
          <Plus size={15} /> Add FAQ
        </button>
      </Section>
    </div>
  );
}

// ── Facts tab ──────────────────────────────────────────────────────────────
function FactsTab({ data, onChange }) {
  const set = (path, val) => {
    const parts = path.split(".");
    const next  = JSON.parse(JSON.stringify(data));
    let obj = next;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = val;
    onChange(next);
  };

  const setStatField = (i, field, val) => {
    const stats = (data.stats || []).map((s, idx) => idx === i ? { ...s, [field]: field === "value" ? Number(val) || 0 : val } : s);
    onChange({ ...data, stats });
  };
  const addStat    = () => onChange({ ...data, stats: [...(data.stats || []), { value: 0, suffix: "+", label: "", description: "", icon: "building" }] });
  const removeStat = (i) => onChange({ ...data, stats: (data.stats || []).filter((_, idx) => idx !== i) });

  const setAchField = (i, field, val) => {
    const achievements = (data.achievements || []).map((a, idx) => idx === i ? { ...a, [field]: val } : a);
    onChange({ ...data, achievements });
  };
  const addAch    = () => onChange({ ...data, achievements: [...(data.achievements || []), { title: "", description: "", icon: "award" }] });
  const removeAch = (i) => onChange({ ...data, achievements: (data.achievements || []).filter((_, idx) => idx !== i) });

  const iconOptions = ["building", "users", "map", "star"];
  const achIconOptions = ["award", "shield", "zap", "trend"];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Section icon={Globe} title="Hero Section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Badge Text"><Input value={data?.hero?.badge} onChange={(v) => set("hero.badge", v)} placeholder="BY THE NUMBERS" /></Field>
        </div>
        <Field label="Hero Title"><Input value={data?.hero?.title} onChange={(v) => set("hero.title", v)} placeholder="Trusted by students..." /></Field>
        <Field label="Hero Subtitle"><Textarea value={data?.hero?.subtitle} onChange={(v) => set("hero.subtitle", v)} /></Field>
      </Section>

      {/* Stats */}
      <Section icon={BarChart2} title="Statistics Cards">
        <div className="space-y-3">
          {(data?.stats || []).map((stat, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500">Stat #{i + 1}</span>
                <button onClick={() => removeStat(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="Value (number)">
                  <Input type="number" value={stat.value} onChange={(v) => setStatField(i, "value", v)} placeholder="500" />
                </Field>
                <Field label="Suffix">
                  <Input value={stat.suffix} onChange={(v) => setStatField(i, "suffix", v)} placeholder="+" />
                </Field>
                <Field label="Label">
                  <Input value={stat.label} onChange={(v) => setStatField(i, "label", v)} placeholder="Hostels Listed" />
                </Field>
                <Field label="Icon">
                  <select
                    value={stat.icon}
                    onChange={(e) => setStatField(i, "icon", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-white"
                  >
                    {iconOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Description">
                  <Input value={stat.description} onChange={(v) => setStatField(i, "description", v)} placeholder="Verified and quality-checked" />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addStat} className="mt-3 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium px-3 py-2 rounded-xl hover:bg-purple-50 transition-colors">
          <Plus size={15} /> Add Stat Card
        </button>
      </Section>

      {/* Achievements */}
      <Section icon={Globe} title="Achievement Cards">
        <div className="space-y-3">
          {(data?.achievements || []).map((a, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500">Achievement #{i + 1}</span>
                <button onClick={() => removeAch(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Title"><Input value={a.title} onChange={(v) => setAchField(i, "title", v)} placeholder="Achievement title" /></Field>
                <Field label="Icon">
                  <select value={a.icon} onChange={(e) => setAchField(i, "icon", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-white">
                    {achIconOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Description"><Textarea value={a.description} onChange={(v) => setAchField(i, "description", v)} placeholder="Describe this achievement..." /></Field>
            </div>
          ))}
        </div>
        <button onClick={addAch} className="mt-3 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium px-3 py-2 rounded-xl hover:bg-purple-50 transition-colors">
          <Plus size={15} /> Add Achievement
        </button>
      </Section>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
          <Icon size={15} className="text-purple-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
const TABS = [
  { key: "contact", label: "Contact Page" },
  { key: "facts",   label: "Facts Page"   },
];

export default function SiteContentPage() {
  const [activeTab, setActiveTab] = useState("contact");
  const [data,      setData]      = useState({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async (section) => {
    setLoading(true);
    try {
      const d = await fetchClient(`/admin/site-content/${section}`);
      setData(d);
    } catch {
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await fetchClient(`/admin/site-content/${activeTab}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      // Reload from the confirmed saved value so admin sees exactly what's stored
      setData(saved);
      toast.success("Content saved and published");
    } catch {
      toast.error("Failed to save — check your connection and try again");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset this section to defaults? All changes will be lost.")) return;
    setSaving(true);
    try {
      await fetchClient(`/admin/site-content/${activeTab}`, { method: "DELETE" });
      toast.success("Reset to defaults");
      load(activeTab);
    } catch {
      toast.error("Failed to reset");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Site Content</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage public-facing content for Contact and Facts pages</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 shadow-sm"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === t.key ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
        </div>
      ) : (
        <div>
          {activeTab === "contact" && <ContactTab data={data} onChange={setData} />}
          {activeTab === "facts"   && <FactsTab   data={data} onChange={setData} />}
        </div>
      )}
    </div>
  );
}
