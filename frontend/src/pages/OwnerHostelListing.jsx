import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchClient } from "../api/fetchClient";
import { FaEdit, FaTrash, FaHome, FaBed, FaMapMarkerAlt, FaPlus, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";

const FACILITIES_OPTIONS = [
  "WiFi", "AC", "Laundry", "Parking", "Meals", "Security", "Generator", "Water",
  "Study Room", "CCTV", "Gym", "Cleaning",
];

const MAX_HOSTEL_IMAGES = 6;

// Turns a Supabase public URL back into the storage path so it can be removed
function supabasePathFromUrl(url) {
  const marker = "/object/public/hostel-images/";
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

function EditModal({ hostel, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: hostel.name || "",
    description: hostel.description || "",
    address: hostel.address || "",
    startingRent: hostel.startingRent || "",
    jazzCashNumber: hostel.jazzCashNumber || "",
    easypaisaNumber: hostel.easypaisaNumber || "",
    facilities: hostel.facilities || [],
    images: hostel.images || [],
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const removedImagesRef = useRef([]); // URLs removed this session, deleted from storage on save

  const toggleFacility = (f) =>
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file later
    if (files.length === 0) return;

    if (form.images.length + files.length > MAX_HOSTEL_IMAGES) {
      toast.warn(`You can upload a maximum of ${MAX_HOSTEL_IMAGES} images.`);
      return;
    }

    setUploadingImages(true);
    try {
      for (const file of files) {
        const fileName = `hostels/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("hostel-images").upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from("hostel-images").getPublicUrl(fileName);
        setForm((prev) => ({ ...prev, images: [...prev.images, data.publicUrl] }));
      }
      toast.success(files.length > 1 ? "Images uploaded!" : "Image uploaded!");
    } catch (err) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (url) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((img) => img !== url) }));
    removedImagesRef.current.push(url);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await fetchClient(`/hostels/${hostel._id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      toast.success("Hostel updated!");
      onSaved({ ...hostel, ...form });

      // Best-effort cleanup — DB is already the source of truth at this point
      if (removedImagesRef.current.length > 0) {
        const paths = removedImagesRef.current.map(supabasePathFromUrl).filter(Boolean);
        if (paths.length > 0) {
          supabase.storage.from("hostel-images").remove(paths).catch(() => {});
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to update hostel");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
        <div className="sticky top-0 bg-purple-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-bold">Edit Hostel</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hostel Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Starting Rent (PKR)</label>
              <input
                type="number"
                value={form.startingRent}
                onChange={(e) => setForm({ ...form, startingRent: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">JazzCash Number</label>
              <input
                value={form.jazzCashNumber}
                onChange={(e) => setForm({ ...form, jazzCashNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Easypaisa Number</label>
              <input
                value={form.easypaisaNumber}
                onChange={(e) => setForm({ ...form, easypaisaNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Hostel Images ({form.images.length}/{MAX_HOSTEL_IMAGES})
              </label>
              <label
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  uploadingImages || form.images.length >= MAX_HOSTEL_IMAGES
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                <FaCloudUploadAlt />
                {uploadingImages ? "Uploading..." : "Add Images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploadingImages || form.images.length >= MAX_HOSTEL_IMAGES}
                  onChange={handleAddImages}
                />
              </label>
            </div>

            {form.images.length === 0 ? (
              <p className="text-sm text-gray-400 border border-dashed border-gray-300 rounded-xl py-6 text-center">
                No images yet — add at least one.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.images.map((url) => (
                  <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={url} alt="Hostel" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      title="Delete image"
                      className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <FaTimes size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Facilities</label>
            <div className="flex flex-wrap gap-2">
              {FACILITIES_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFacility(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    form.facilities.includes(f)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploadingImages}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OwnerHostelListing() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingHostel, setEditingHostel] = useState(null);

  useEffect(() => {
    fetchClient("/hostels/my-hostels")
      .then((data) => setHostels(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load hostels"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (hostel) => {
    const result = await Swal.fire({
      title: "Delete Hostel?",
      text: `"${hostel.name}" will be permanently deleted and pending bookings cancelled.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#9333ea",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await fetchClient(`/hostels/${hostel._id}`, { method: "DELETE" });
      setHostels((prev) => prev.filter((h) => h._id !== hostel._id));
      toast.success("Hostel deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete hostel");
    }
  };

  const handleSaved = (updated) => {
    setHostels((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
    setEditingHostel(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-6 md:p-6 md:pb-8 lg:p-8 lg:pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">My Hostels</h1>
            <p className="text-gray-500 text-sm mt-1">
              {hostels.length} hostel{hostels.length !== 1 ? "s" : ""} listed
            </p>
          </div>
          <Link
            to="/hostel_owner/add-hostel"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition w-full sm:w-auto justify-center"
          >
            <FaPlus /> Add New Hostel
          </Link>
        </div>

        {/* Empty state */}
        {hostels.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <FaHome className="text-6xl text-purple-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No hostels yet</h3>
            <p className="text-gray-500 mb-6">Add your first hostel to start receiving bookings.</p>
            <Link
              to="/hostel_owner/add-hostel"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition"
            >
              <FaPlus /> Add Hostel
            </Link>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {hostels.map((hostel) => (
            <div
              key={hostel._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 bg-purple-50">
                {hostel.images?.[0] ? (
                  <img
                    src={hostel.images[0]}
                    alt={hostel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaHome className="text-5xl text-purple-200" />
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full capitalize">
                  {hostel.type || "hostel"}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">{hostel.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3 line-clamp-1">
                  <FaMapMarkerAlt className="text-purple-400 shrink-0" /> {hostel.address || "—"}
                </p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <FaBed className="text-purple-400" />
                    {hostel.rooms?.length || 0} room{hostel.rooms?.length !== 1 ? "s" : ""}
                  </span>
                  <span className="font-bold text-purple-700 text-sm">
                    PKR {(hostel.startingRent || 0).toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => setEditingHostel(hostel)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-semibold transition"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hostel)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingHostel && (
        <EditModal
          hostel={editingHostel}
          onClose={() => setEditingHostel(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
