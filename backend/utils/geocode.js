import fetch from "node-fetch";

export async function geocodeAddress(address) {
  const apiKey = process.env.GOOGLE_API_KEY;  // .env se le ga

  const query = `${encodeURIComponent(address + ", Gujranwala, Pakistan")}`;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;

      return {
        lat: location.lat,
        lng: location.lng
      };
    }

    console.log("No result found for address:", address, "Status:", data.status);
    return null;

  } catch (error) {
    console.error("Google Geocoding Error:", error);
    return null;
  }
}