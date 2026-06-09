import mongoose from "mongoose";
import { Hostel } from "../models/Hostel.js";
import Booking from "../models/Booking.js";
import Settings from "../models/Settings.js";
import { geocodeAddress } from "../utils/geocode.js";


/**
 * @desc Create a new hostel (full step form)
 * @route POST /api/hostels/add
 * @access Private (hostel_owner)
 */
export const createHostel = async (req, res) => {
  try {
    console.log("👉 Received hostel creation request");
    console.log("User from token:", req.user);
    console.log("Request body:", req.body);
    console.log("Hostel type from FE:", req.body.hostelType);
    console.log("REQ BODY:", req.body);



    const ownerId = req.user._id; // JWT middleware

    // Destructure with safe defaults
    const {
      hostelName = "Unnamed Hostel",
      ownerName = "Unknown Owner",
      hostelType,
      contactPhone,
      address = "Unknown Address",
      coordinates={},
      description = "",
      hostelSpecs = {},
      floors = [],
      rooms = [],
      facilities = [],
      images = [],
    } = req.body;


    // Validate minimal required fields
    if (!hostelName || !ownerName || !contactPhone || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Handle coordinates
    let lat = coordinates?.lat;
    let lng = coordinates?.lng;

    if (!lat || !lng) {
      // Try auto-geocode using address
      const geo = await geocodeAddress(address);
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
        console.log(`📍 Auto-geocoded coordinates: ${lat}, ${lng}`);
      }
    }


    const savedImages = Array.isArray(images) ? images : [];

    // Ensure rooms have roomId
    const roomsWithIds = rooms.map((room, i) => ({
      ...room,
      roomId: room.roomId || `room-${Date.now()}-${i}`,
      
    }));

   const floorsWithIds = floors.map((floor, i) => ({
  floorId: floor.floorId || `floor-${Date.now()}-${i}`,
  name: floor.floorName, // ✅ mapping
  floorNumber: Number(floor.floorNumber),
  roomsCount: Number(floor.roomsCount),
  availableSeats: Number(floor.availableSeats),
}));


    // 🔗 Link rooms to floors (CORRECT VERSION)
    floorsWithIds.forEach((floor) => {
      floor.roomIds = [];
    });

    roomsWithIds.forEach((room) => {
      const floor = floorsWithIds.find(f => f.floorId === room.floorId);
      if (floor) {
        floor.roomIds.push(room.roomId);
      }
    });


    // Create new hostel document
    const newHostel = new Hostel({
      name: hostelName,
      type: hostelType,
      description,
      address,
      totalRooms: hostelSpecs.totalRooms || 0,
      availableRooms: hostelSpecs.availableRooms || 0,
      startingRent: hostelSpecs.startingRent || 0,
      facilities,
      floors: floorsWithIds,
      rooms: roomsWithIds,
      images: savedImages,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      contact: { phone: contactPhone, email: "" },
      owner: { name: ownerName, role: "hostel_owner" },
      ownerId,
      meta: { source: "manual", listedOn: new Date() },
    });

    const savedHostel = await newHostel.save();

    res.status(201).json({
      success: true,
      message: "✅ Hostel added successfully!",
      hostel: savedHostel,
    });

  } catch (error) {
    console.error("❌ Error creating hostel:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



/**
 * @desc Get hostel by ID
 * @route GET /api/hostels/:id
 * @access Private
 */
export const getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate("owner", "_id name email");
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });
    res.status(200).json(hostel);
  } catch (error) {
    console.error("❌ Error fetching hostel:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getHostelsByIds = async (req, res) => {
  try {
    const { hostelIds } = req.body;

    if (!hostelIds || !Array.isArray(hostelIds) || hostelIds.length === 0) {
      return res.status(400).json({ message: "hostelIds array is required" });
    }

    const hostels = await Hostel.find({ _id: { $in: hostelIds } });

    res.status(200).json(hostels);
  } catch (error) {
    console.error("Error in getHostelsByIds:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Get all hostels (public listing)
 * @route GET /api/hostels/list
 * @access Public
 */
export const getHostelsByOwner = async (req, res) => {
  try {
    const hostels = await Hostel.find().sort({ createdAt: -1 });
    res.status(200).json(hostels);
  } catch (error) {
    console.error("❌ Error fetching hostels:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * @desc Get hostels belonging to the logged-in owner
 * @route GET /api/hostels/my-hostels
 * @access Private (hostel_owner)
 */
export const getMyHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(hostels);
  } catch (error) {
    console.error("❌ Error fetching my hostels:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc Update owner's own hostel
 * @route PUT /api/hostels/:id
 * @access Private (hostel_owner)
 */
export const updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });

    if (hostel.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: you do not own this hostel" });
    }

    const allowed = ["name", "description", "address", "startingRent", "facilities", "rooms", "contact", "jazzCashNumber", "easypaisaNumber", "images", "type"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) hostel[field] = req.body[field];
    });

    const updated = await hostel.save();
    res.status(200).json({ message: "Hostel updated successfully", hostel: updated });
  } catch (error) {
    console.error("❌ Error updating hostel:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc Delete owner's own hostel (cancels related bookings)
 * @route DELETE /api/hostels/:id
 * @access Private (hostel_owner)
 */
export const deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });

    if (hostel.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: you do not own this hostel" });
    }

    await Booking.updateMany(
      { hostelId: hostel._id, status: { $in: ["pending", "accepted"] } },
      { $set: { status: "cancelled" } }
    );

    await Hostel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Hostel deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting hostel:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getNearbyHostels = async (req, res) => {
  console.log("🔥 Nearby API Hit");
  console.log("📍 Received lat:", req.body.lat);
  console.log("📍 Received lng:", req.body.lng);
  console.log("📏 Received km:", req.body.km);
  console.log("🏷 Received category:", req.body.category);
  const { lat, lng, km, category } = req.body;


  if (!lat || !lng) {
    console.log("❌ Missing coordinates in backend");
    return res.status(400).json({ message: "Coordinates required" });
  }

  const maxDistance = (km || 3) * 1000; // KM → meters

  const hostels = await Hostel.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance
      }
    },
    ...(category ? { type: category } : {})
  });

  console.log(
  hostels.map(h => ({
    name: h.name,
    coordinates: h.location.coordinates
  }))
);

// ✅ NEW: Haversine formula to calculate distance
  function calculateDistance(hostelLat, hostelLng) {
    const toRad = (deg) => deg * Math.PI / 180;
    
    const dLat = toRad(hostelLat - lat);
    const dLng = toRad(hostelLng - lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat)) * Math.cos(toRad(hostelLat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const distance = 6371 * c;  // Earth radius in km
    return distance.toFixed(2);  // 2 decimal places
  }

  // ✅ NEW: Log each hostel's name and distance
  hostels.forEach(h => {
    const [hLng, hLat] = h.location.coordinates;  // [lng, lat]
    const dist = calculateDistance(hLat, hLng);
    console.log(`Hostel: ${h.name}, Distance: ${dist} km`);
  });
     res.json(hostels);
};

// ── Public: get featured hostels ─────────────────────────────────────────────
export const getFeaturedHostels = async (req, res) => {
  try {
    const settings = await Settings.findOne().lean();
    const limit = settings?.featuredHostelLimit || 6;

    const hostels = await Hostel.find({ featured: true, isBlocked: { $ne: true } })
      .sort({ featuredOrder: 1, createdAt: -1 })
      .limit(limit)
      .select("name type address startingRent facilities images featuredOrder");

    res.json(hostels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin: toggle featured + set order ──────────────────────────────────────
export const toggleFeatured = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });

    const { featured, featuredOrder } = req.body;
    if (featured !== undefined) hostel.featured = featured;
    if (featuredOrder !== undefined) hostel.featuredOrder = featuredOrder;
    await hostel.save();

    res.json({ message: "Hostel featured status updated", hostel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};