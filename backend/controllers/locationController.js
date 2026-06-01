import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export const geocodeLocation = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Location text is required" });
    }

    const apiKey = process.env.GOOGLE_API_KEY;  // .env se le ga

    const query = `${encodeURIComponent(text + ", Gujranwala, Pakistan")}`;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;

      return res.json({
        lat: location.lat,
        lng: location.lng
      });
    }

    console.log("No result found for address:", text, "Status:", data.status);
    return res.status(404).json({ message: "No coordinates found" });

  } catch (error) {
    console.error("Google Geocoding Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};