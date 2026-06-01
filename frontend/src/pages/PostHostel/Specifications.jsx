// src/pages/PostHostel/Specifications.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-toastify";


// 🔥 Input component
const Input = React.forwardRef(({ label, error, ...props }, ref) => (
  <div className="w-full flex flex-col mb-4">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      ref={ref}
      className={`w-full h-11 px-3 text-base border rounded-md focus:outline-none 
        ${error ? "border-red-500" : "border-gray-300 focus:border-purple-600"}`}
    />
    <p className="text-xs text-red-500 mt-1 min-h-[1rem]">{error || " "}</p>
  </div>
));

export default function Specifications({ onNext, onPrevious }) {
  const [hostelSpecs, setHostelSpecs] = useState({
    totalRooms: "",
    availableRooms: "",
    startingRent: "",
  });

  const [floorForm, setFloorForm] = useState({
    floorId: "",
    floorName: "",
    floorNumber: "",
    roomsCount: "",
    availableSeats: "",
  });
  const [floors, setFloors] = useState([]);

  const [roomForm, setRoomForm] = useState({
    roomId: "",
    roomTitle: "",
    roomType: "",
    floor: "",
    seatPrice: "",
    monthlyTotal: "",
    firstMonthCharge: "",
    advanceAmount: "",
    features: [],
    roomImages: [], // { file, preview }
  });
  const [rooms, setRooms] = useState([]);

  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ open: false, images: [], index: 0 });
  const [isAddingRoom, setIsAddingRoom] = useState(false);


  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("specificationsData") || "{}");
      if (saved.hostelSpecs) setHostelSpecs(saved.hostelSpecs);
      if (saved.floors) setFloors(saved.floors);
      if (saved.rooms) setRooms(saved.rooms);
      const savedFloors = JSON.parse(localStorage.getItem("specificationsFloorImages"));
      if (savedFloors) {
        setFloorForm((prev) => ({
          ...prev,
          floorImages: savedFloors,
        }));
      }
    } catch { }
  }, []);

  const handleHostelChange = (e) => {
    const { name, value } = e.target;
    setHostelSpecs((prev) => ({ ...prev, [name]: value }));
  };

  const handleFloorChange = (e) => {
    const { name, value } = e.target;

    setFloorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Room Images
  const handleRoomChange = (e) => {
    const { name, files, value, checked } = e.target;

    if (name === "roomImages") {
      const selectedFiles = Array.from(files);

      const newImages = selectedFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
      }));

      setRoomForm((prev) => ({
        ...prev,
        roomImages: [...prev.roomImages, ...newImages],
      }));

      e.target.value = "";
      return;
    }


    if (name === "features") {
      setRoomForm((prev) => ({
        ...prev,
        features: checked
          ? [...prev.features, value]
          : prev.features.filter((f) => f !== value),
      }));
      return;
    }

    setRoomForm((prev) => ({ ...prev, [name]: value }));
  }

  const isPositive = (v) => Number(v) > 0;


  const removeRoomImage = (id) => {
    setRoomForm((prev) => ({
      ...prev,
      roomImages: prev.roomImages.filter((img) => img.id !== id),
    }));
  };

  // 🔹 Room Images upload helper
  const uploadRoomImagesToSupabase = async (roomImages) => {
    const urls = [];

    for (let img of roomImages) {
      const fileName = `rooms/${Date.now()}-${img.file.name}`;

      const { error } = await supabase.storage
        .from("hostel-images")
        .upload(fileName, img.file);

      if (error) {
        console.error(error);
        return null;
      }

      const { data } = supabase.storage
        .from("hostel-images")
        .getPublicUrl(fileName);

      urls.push(data.publicUrl);
    }

    return urls;
  };


  // Modal
  const openModal = (images, index) =>
    setModal({ open: true, images, index });

  const closeModal = () =>
    setModal({ open: false, images: [], index: 0 });

  const prevImage = () =>
    setModal((prev) => ({
      ...prev,
      index: (prev.index - 1 + prev.images.length) % prev.images.length,
    }));

  const nextImage = () =>
    setModal((prev) => ({
      ...prev,
      index: (prev.index + 1) % prev.images.length,
    }));

  // Add floor
  const addFloor = () => {
    const newErrors = {};
    if (!floorForm.floorId) newErrors.floor_floorId = "Required";
    if (!floorForm.floorName) newErrors.floor_floorName = "Required";
    if (!floorForm.floorNumber) newErrors.floor_floorNumber = "Required";
    if (floorForm.roomsCount && !isPositive(floorForm.roomsCount))
      newErrors.floor_roomsCount = "Invalid";
    if (floorForm.availableSeats && !isPositive(floorForm.availableSeats))
      newErrors.floor_availableSeats = "Invalid";

    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setFloors((prev) => [...prev, floorForm]);
    toast.success("Floor added successfully!");
    setFloorForm({
      floorId: "",
      floorName: "",
      floorNumber: "",
      roomsCount: "",
      availableSeats: "",
    });
    setErrors({});
  };

  const addRoom = async () => {
    if (isAddingRoom) return;

    setIsAddingRoom(true);

    const newErrors = {};

    if (!roomForm.roomId) newErrors.room_roomId = "Required";
    if (!roomForm.roomTitle) newErrors.room_roomTitle = "Required";
    if (!roomForm.roomType) newErrors.room_roomType = "Required";
    if (!roomForm.floor) newErrors.room_floor = "Required";
    if (!isPositive(roomForm.seatPrice)) newErrors.room_seatPrice = "Invalid";
    if (!isPositive(roomForm.monthlyTotal)) newErrors.room_monthlyTotal = "Invalid";
    if (!isPositive(roomForm.firstMonthCharge)) newErrors.room_firstMonthCharge = "Invalid";
    if (!roomForm.advanceAmount || !isPositive(roomForm.advanceAmount)) newErrors.room_advanceAmount = "Invalid";
    if (roomForm.features.length === 0)
      newErrors.room_features = "Select at least one feature";
    if (roomForm.roomImages.length < 1 || roomForm.roomImages.length > 4)
      newErrors.room_roomImages = "Upload 1-4 images";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setIsAddingRoom(false);
      return;
    }

    try {
      const imageUrls = await uploadRoomImagesToSupabase(roomForm.roomImages);
      if (!imageUrls) throw new Error("Upload failed");

      const selectedFloor = floors.find(
        f => f.floorId === roomForm.floor
      );

      const roomData = {
        ...roomForm,
        floorNumber: selectedFloor ? Number(selectedFloor.floorNumber) : null,
        roomImages: imageUrls, // URLs only
      };

      const updatedRooms = [...rooms, roomData];

      // 1️⃣ React state
      setRooms(updatedRooms);

      // 2️⃣ localStorage (URLs included)
      localStorage.setItem(
        "specificationsData",
        JSON.stringify({
          hostelSpecs,
          floors,
          rooms: updatedRooms,
        })
      );


      toast.success("Room added successfully");

      setRoomForm({
        roomId: "",
        roomTitle: "",
        roomType: "",
        floor: "",
        seatPrice: "",
        monthlyTotal: "",
        firstMonthCharge: "",
        advanceAmount: "",
        features: [],
        roomImages: [],
      });

      setErrors({});
    } catch (err) {
      toast.error("Failed to add room");
    } finally {
      setIsAddingRoom(false);
    }
  };
  const saveAndNext = () => {
    localStorage.setItem(
      "specificationsData",
      JSON.stringify({
        hostelSpecs,
        floors,
        rooms,
      })
    );

    const savedStatus = JSON.parse(
      localStorage.getItem("hostelFormStatus") || "{}"
    );

    localStorage.setItem(
      "hostelFormStatus",
      JSON.stringify({ ...savedStatus, specifications: "completed" })
    );

    toast.success("Specifications saved");

    if (onNext) onNext();
  };

  return (
    <div>
      <h1 className="text-2xl text-black-600 mb-7 text-center">
        Rooms detail
      </h1>

      {/* Hostel Specs */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Input
          label="Total Rooms"
          name="totalRooms"
          value={hostelSpecs.totalRooms}
          onChange={handleHostelChange}
          error={errors.totalRooms}
        />
        <Input
          label="Available Rooms"
          name="availableRooms"
          value={hostelSpecs.availableRooms}
          onChange={handleHostelChange}
          error={errors.availableRooms}
        />
        <Input
          label="Starting Rent"
          name="startingRent"
          value={hostelSpecs.startingRent}
          onChange={handleHostelChange}
          error={errors.startingRent}
        />
      </div>

      {/* Floors */}
      <h2 className="text-xl font-semibold mb-3 text-purple-600">
        Floors Information
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <Input
          label="Floor ID"
          name="floorId"
          value={floorForm.floorId}
          onChange={handleFloorChange}
          error={errors.floor_floorId}
        />
        <Input
          label="Floor Name"
          name="floorName"
          value={floorForm.floorName}
          onChange={handleFloorChange}
          error={errors.floor_floorName}
        />
        <Input
          label="Floor Number"
          name="floorNumber"
          value={floorForm.floorNumber}
          onChange={handleFloorChange}
          error={errors.floor_floorNumber}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Input
          label="Rooms Count"
          name="roomsCount"
          value={floorForm.roomsCount}
          onChange={handleFloorChange}
          error={errors.floor_roomsCount}
        />
        <Input
          label="Available Seats"
          name="availableSeats"
          value={floorForm.availableSeats}
          onChange={handleFloorChange}
          error={errors.floor_availableSeats}
        />
      </div>



      <div className="flex justify-center mt-6">
        <button
          onClick={addFloor}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md shadow-md"
        >
          Add Floor
        </button>
      </div>

      {/* Rooms */}
      <h2 className="text-xl font-semibold mt-10 mb-3 text-purple-600">
        Room Price Plans
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <Input
          label="Room ID"
          name="roomId"
          value={roomForm.roomId}
          onChange={handleRoomChange}
          error={errors.room_roomId}
        />
        <Input
          label="Room Title"
          name="roomTitle"
          value={roomForm.roomTitle}
          onChange={handleRoomChange}
          error={errors.room_roomTitle}
        />

        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Room Type
          </label>
          <select
            name="roomType"
            value={roomForm.roomType}
            onChange={handleRoomChange}
            className={`w-full h-11 px-3 text-base border rounded-md ${errors.room_roomType ? "border-red-500" : "border-gray-300 focus:border-purple-600"
              }`}
          >
            <option value="">Select Type</option>
            <option value="2-seater">2-Seater</option>
            <option value="3-seater">3-Seater</option>
            <option value="4-seater">4-Seater</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Select Floor
          </label>

          <select
            name="floor"
            value={roomForm.floor}
            onChange={handleRoomChange}
            className={`w-full h-11 px-3 text-base border rounded-md ${errors.room_floor ? "border-red-500" : "border-gray-300 focus:border-purple-600"
              }`}
          >
            <option value="">Choose Floor</option>
            {floors.map((f) => (
              <option key={f.floorId} value={f.floorId}>
                {f.floorName}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Seat Price"
          name="seatPrice"
          value={roomForm.seatPrice}
          onChange={handleRoomChange}
          error={errors.room_seatPrice}
        />

        <Input
          label="Monthly Total"
          name="monthlyTotal"
          value={roomForm.monthlyTotal}
          onChange={handleRoomChange}
          error={errors.room_monthlyTotal}
        />
      </div>

      <Input
        label="First Month Charge"
        name="firstMonthCharge"
        value={roomForm.firstMonthCharge}
        onChange={handleRoomChange}
        error={errors.room_firstMonthCharge}
      />

      <Input
        label="Advance Amount"
        name="advanceAmount"
        value={roomForm.advanceAmount}
        onChange={handleRoomChange}
        error={errors.room_advanceAmount}
      />

      {/* Features */}
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        Features
      </label>

      <div className="flex flex-wrap gap-4 mb-4">
        {["AC", "Attached Bathroom", "Cupboard", "Wi-Fi", "Study Table", "Furnished"].map((f) => (
          <label key={f} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="features"
              value={f}
              checked={roomForm.features.includes(f)}
              onChange={handleRoomChange}
              className="h-4 w-4"
            />
            <span>{f}</span>
          </label>
        ))}
      </div>

      <p className="text-xs text-red-500">{errors.room_features}</p>

      {/* Room Images */}
      <div className="flex flex-col mt-4">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Room Images (1-4)
        </label>

        <label className="cursor-pointer inline-block px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-medium">
          Upload Image
          <input
            type="file"
            name="roomImages"
            accept="image/*"
            multiple
            onChange={handleRoomChange}
            className="hidden" // hide default input
          />
        </label>

        <div className="flex gap-2 mt-2 flex-wrap">
          {roomForm.roomImages.map((img) => (
            <div key={img.id} className="relative">
              <img
                src={img.preview}
                alt="room"
                className="h-20 w-20 object-cover rounded-md cursor-pointer"
                onClick={() =>
                  openModal(
                    roomForm.roomImages.map((i) => i.preview),
                    roomForm.roomImages.indexOf(img)
                  )
                }
              />
              <button
                type="button"
                onClick={() => removeRoomImage(img.id)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
              >
                &times;
              </button>
            </div>
          ))}
        </div>


      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-md shadow-lg max-w-lg">
            <img
              src={modal.images[modal.index]}
              alt="preview"
              className="max-h-[70vh] mx-auto rounded-md"
            />

            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded"
            >
              ‹
            </button>

            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded"
            >
              ›
            </button>

            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-center mt-6">
        <button
          onClick={addRoom}
          disabled={isAddingRoom}
          className={`px-5 py-2 text-white rounded-md ${isAddingRoom ? "bg-gray-400" : "bg-purple-600"
            }`}
        >
          {isAddingRoom ? "Adding..." : "Add Room"}
        </button>

      </div>

      {/* Save & Next */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrevious}
          className="px-5 py-2 bg-gray-400 text-white rounded-md"
        >
          Previous
        </button>

        <button
          onClick={saveAndNext}
          className="px-5 py-2 bg-purple-600 text-white rounded-md"
        >
          Save & Next
        </button>
      </div>
    </div>
  );
}
