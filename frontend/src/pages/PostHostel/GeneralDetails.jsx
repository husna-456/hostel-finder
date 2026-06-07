import { useState, useEffect } from "react";
import { FiImage, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";
import { supabase } from "../../lib/supabaseClient";



export default function GeneralDetails({ onNext, onPrevious,isFinalSubmitted }) {
  const [formData, setFormData] = useState({
    hostelName: "",
    ownerName: "",
    hostelType: "",
    contactPhone: "",
    address: "",
    description: "",
    jazzCashNumber: "",
    easypaisaNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [pictures, setPictures] = useState([]); // [{ file: File, preview: string }]
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
    const savedImageUrls =
    JSON.parse(localStorage.getItem("hostelImageUrls")) || [];

  // ✅ NEW: Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Load saved data
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("generalDetailsData"));
   setFormData({
    hostelName: saved?.hostelName || "",
    ownerName: user.name || saved?.ownerName || "", // ✅ ALWAYS SET
    hostelType: saved?.hostelType || "",
    contactPhone: saved?.contactPhone || "",
    address: saved?.address || "",
    description: saved?.description || "",
    jazzCashNumber: saved?.jazzCashNumber || "",
    easypaisaNumber: saved?.easypaisaNumber || "",
  });

        if (savedImageUrls.length > 0) {
      setPictures(
        savedImageUrls.map((url) => ({
          file: null,      // already uploaded
          preview: url,    // supabase url
        }))
      );
    }
}, []);

useEffect(() => {
  if (isFinalSubmitted) {
    setPictures([]);                 // 🔥 Preview clear
  }
}, [isFinalSubmitted]);
 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ================= IMAGE HANDLING =================
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (pictures.length + files.length > 6) {
      toast.warn("You can upload maximum 6 pictures.");
      return;
    }
    files.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      setPictures((prev) => {
        const updated = [...prev, { file, preview: previewUrl }];
        console.log("PICTURES STATE:", updated);
        return updated;
      });
    });
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(pictures[index].preview);
    setPictures((prev) => prev.filter((_, i) => i !== index));
  };


  // ================= MODAL =================
  const openModal = (images, index) => {
    setModalImages(images);
    setModalIndex(index);
    setModalOpen(true);
  };

  const nextImage = () => {
    setModalIndex((prev) => (prev + 1) % modalImages.length);
  };

  const prevImage = () => {
    setModalIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);
  };

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {};
    if (!formData.hostelName.trim()) newErrors.hostelName = "Hostel name is required.";
    if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required.";
    if (!formData.hostelType) newErrors.hostelType = "Please select hostel type.";
    if (!/^\d{11}$/.test(formData.contactPhone))
      newErrors.contactPhone = "Phone must be exactly 11 digits.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
      if (formData.description.trim().length < 10)
      newErrors.description = "Description must be at least 10 characters.";
    if (pictures.length === 0 && savedImageUrls.length === 0) {
  newErrors.pictures = "Please upload at least 1 picture.";
}
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImagesToSupabase = async () => {
    const uploadedUrls = [];

  for (let i = 0; i < pictures.length; i++) {
    if (!pictures[i].file) continue; // 
 
      const file = pictures[i].file;
      const fileName = `hostels/${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("hostel-images")
        .upload(fileName, file);

      if (error) {
        toast.error("Image upload failed");
        return null;
      }

      const { data } = supabase.storage
        .from("hostel-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const handleNext = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    let imageUrls = savedImageUrls;

    if (pictures.some((p) => p.file)) {
      toast.loading("Uploading images...", { autoClose: false });

      const uploaded = await uploadImagesToSupabase();
      toast.dismiss();

      if (!uploaded) return;

      imageUrls = [...savedImageUrls, ...uploaded];
      localStorage.setItem("hostelImageUrls", JSON.stringify(imageUrls));
    }

    localStorage.setItem(
      "generalDetailsData",
      JSON.stringify(formData)
    );

    const savedStatus =
      JSON.parse(localStorage.getItem("hostelFormStatus")) || {};

    localStorage.setItem(
      "hostelFormStatus",
      JSON.stringify({ ...savedStatus, generalDetails: "completed" })
    );

    toast.success("Saved successfully");
    onNext();
  } catch (err) {
    toast.dismiss();
    toast.error("Something went wrong");
    console.error(err);
  }
};




  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 md:py-12 px-3 md:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-5 md:px-8 md:py-10 text-center">
              <h2 className="text-xl md:text-3xl font-bold text-white">Hostel Details</h2>
              <p className="text-sm md:text-base text-purple-100 mt-1 md:mt-2">Fill in the basic information about your hostel</p>
            </div>

            <form className="p-4 md:p-8 lg:p-12 space-y-5 md:space-y-8" onSubmit={handleNext}>
              {/* Hostel Name */}
              <div>
                <label className="block text-sm md:text-base text-gray-700 font-semibold mb-1 md:mb-2">
                  Hostel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hostelName"
                  value={formData.hostelName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 md:px-5 md:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.hostelName ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="e.g. Comfort Hostel"
                />
                {errors.hostelName && <p className="text-red-500 text-sm mt-1">{errors.hostelName}</p>}
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-sm md:text-base text-gray-700 font-semibold mb-1 md:mb-2">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={user.name || formData.ownerName}  // Auto-fill and fixed
                  readOnly  // Fixed - user can't change
                  className={`w-full px-3 py-2.5 md:px-5 md:py-3 border rounded-xl bg-gray-100 cursor-not-allowed ${errors.ownerName ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Full name of owner"
                />
                {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>}
              </div>

              {/* Hostel Type */}
              <div>
                <label className="block text-sm md:text-base text-gray-700 font-semibold mb-1 md:mb-2">
                  Hostel Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="hostelType"
                  value={formData.hostelType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 md:px-5 md:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.hostelType ? "border-red-500" : "border-gray-300"
                    }`}
                >
                  <option value="">Select hostel type</option>
                  <option value="boys">Boys Hostel</option>
                  <option value="girls">Girls Hostel</option>
                  <option value="mixed">Co-Hostel (Mixed)</option>
                </select>
                {errors.hostelType && <p className="text-red-500 text-sm mt-1">{errors.hostelType}</p>}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm md:text-base text-gray-700 font-semibold mb-1 md:mb-2">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 md:px-5 md:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.contactPhone ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="03XXXXXXXXX (11 digits)"
                />
                {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm md:text-base text-gray-700 font-semibold mb-1 md:mb-2">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 md:px-5 md:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Street, area, city"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm md:text-base text-gray-700 font-semibold mb-1 md:mb-2">
                  Description 
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className={`w-full px-3 py-2.5 md:px-5 md:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none ${errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Tell us about your hostel – facilities, location benefits, rules etc."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Payment Settings */}
              <div className="border-t border-gray-200 pt-4 md:pt-6">
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-4">Payment Settings</h3>
                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">Enter your mobile wallet numbers for receiving advance payments from students.</p>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm md:text-base text-gray-700 font-semibold mb-1 md:mb-2">
                      JazzCash Account Number
                    </label>
                    <input
                      type="tel"
                      name="jazzCashNumber"
                      value={formData.jazzCashNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 md:px-5 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                      placeholder="03XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm md:text-base text-gray-700 font-semibold mb-1 md:mb-2">
                      Easypaisa Account Number
                    </label>
                    <input
                      type="tel"
                      name="easypaisaNumber"
                      value={formData.easypaisaNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 md:px-5 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                      placeholder="03XXXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm md:text-base text-gray-700 font-semibold mb-1 md:mb-4">
                  Hostel Pictures <span className="text-red-500">*</span> (Max 6)
                </label>

                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-36 md:h-64 border-4 border-dashed border-purple-200 rounded-2xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition"
                >
                  <FiImage className="text-purple-500" size={60} />
                  <p className="mt-2 md:mt-4 text-sm md:text-lg text-purple-700 font-medium">
                    Click to upload images
                  </p>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleFiles}
                  />
                </label>

                {errors.pictures && <p className="text-red-500 text-sm mt-2">{errors.pictures}</p>}

                {pictures.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mt-4 md:mt-8">
                    {pictures.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-24 md:h-40 object-cover rounded-xl shadow-md cursor-pointer transition transform group-hover:scale-105"
                          onClick={() => openModal(pictures, i)}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <FiX size={16} />
                        </button>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col md:flex-row md:justify-between gap-3 pt-4 md:pt-8">
                {onPrevious && (
                  <button
                    type="button"
                    onClick={onPrevious}
                    className="w-full md:w-auto px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
                  >
                    Previous
                  </button>
                )}
                <button
                  type="submit"
                  className="w-full md:w-auto md:px-10 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
                >
                  Save & Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition"
          >
            <FiX size={36} />
          </button>

          {modalImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 text-white hover:text-gray-300 transition"
              >
                <FiChevronLeft size={48} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 text-white hover:text-gray-300 transition"
              >
                <FiChevronRight size={48} />
              </button>
            </>
          )}

          <img
            src={modalImages[modalIndex]?.preview}
            alt="Full view"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />

          <p className="absolute bottom-8 text-white text-lg">
            {modalIndex + 1} / {modalImages.length}
          </p>
        </div>
      )}
    </>
  );
}
