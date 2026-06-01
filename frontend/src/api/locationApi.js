import { fetchClient } from "./fetchClient";

export async function getCoordinatesFromLocation(location) {
  return fetchClient("/location/geocode", {
    method: "POST",
    body: JSON.stringify({ location }),
  });
}
