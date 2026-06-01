
// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Hostel } from "./models/Hostel.js";
import User from "./models/User.js";
import hostelsData from "./data/hostelsData.js";
import { geocodeAddress } from "./utils/geocode.js";
import connectDB from "./config/db.js";

dotenv.config();

const importData = async () => {
  try {
    await connectDB();
    await Hostel.deleteMany();

    // 🔥 Get real hostel owners
    const owners = await User.find({ role: "hostel_owner" }).select("_id");

    if (owners.length === 0) {
      console.log("❌ No hostel owners found in DB!");
      process.exit(1);
    }

    console.log("✔ Owners found:", owners.map(o => o._id.toString()));

    let ownerIndex = 0; // round-robin rotation index

    const fixedData = [];

    for (let rawHostel of hostelsData) {
      const h = { ...rawHostel };

      // Floors typo fix
      if (h[" floors"]) {
        h.floors = h[" floors"];
        delete h[" floors"];
      }

      if (!h.floors) {
        console.log("❌ No floors found for:", h.name);
        h.floors = [];
      }

      // Fix floors mapping
      if (Array.isArray(h.floors)) {
        h.floors = h.floors.map(f => ({
          ...f,
          roomIds: f.rooms || [],
          roomsCount: f.rooms?.length || 0,
          availableSeats: f.availableSeats || 0,
          rooms: undefined
        }));
      }

      // Fix rooms
      if (Array.isArray(h.rooms)) {
        h.rooms = h.rooms.map(r => ({
          ...r,
          floorNumber: r.floor || 1
        }));
      }

      // 🔥 Assign real owner — round robin
      h.ownerId = owners[ownerIndex]._id;
      ownerIndex = (ownerIndex + 1) % owners.length; // rotate IDs

      h.isSample = true;

      // GEOAPIFY - Resolve address
      const coords = await geocodeAddress(
        `${h.name}, ${h.address}, Gujranwala, Pakistan`
      );

      if (!coords) {
        console.log("❌ GEOAPIFY FAILED:", h.name);
        continue;
      }

      h.location = {
        type: "Point",
        coordinates: [coords.lng, coords.lat]
      };

      fixedData.push(h);

      await new Promise(res => setTimeout(res, 500));
    }

    await Hostel.insertMany(fixedData);

    console.log("\n✅ HOSTEL DATA IMPORTED SUCCESSFULLY");

    // coordinate validation
    const hostels = await Hostel.find();
    hostels.forEach(h => {
      if (!h.location?.coordinates || h.location.coordinates.length !== 2) {
        console.log("❌ Missing coordinates:", h.name);
      }
    });

    console.log("✅ Coordinate check complete");
    process.exit();

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

importData();
