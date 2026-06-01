import mongoose from "mongoose";
import dotenv from "dotenv";
import { Hostel } from "../models/Hostel.js";
import { geocodeAddress } from "../utils/geocode.js";

dotenv.config();

console.log("MONGO_URI LOADED:", process.env.MONGO_URI); // Debug


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

 async function convertCoordinatesToGeoJSON() {
  const hostels = await Hostel.find({ coordinates: { $exists: true }, location: { $exists: false } });

  console.log(`Found ${hostels.length} hostels to update`);



  for (let hostel of hostels) {
    console.log(`Searching: ${hostel.name}`);

    const result = await geocodeAddress(
      `${hostel.name}, ${hostel.address}, Gujranwala, Pakistan`
    );

    if (result) {
     

      // Add GeoJSON location field for $near query
      hostel.location = {
        type: 'Point',
        coordinates: [result.lng, result.lat] // ⚡ important: [lng, lat]
      };
      await hostel.save();

      console.log(
        `✔ Updated ${hostel.name}: ${result.lat}, ${result.lng}`
      );
    } else {
      console.log(`❌ Could NOT find: ${hostel.name}`);
    }

    await new Promise((res) => setTimeout(res, 500)); // 🔥 Rate limit protection
  }

  mongoose.disconnect();
}

convertCoordinatesToGeoJSON();
