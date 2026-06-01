import { fetchClient } from "./fetchClient";

export const getRoomsByHostel = async (hostelId) => {
  const hostel = await fetchClient(`/hostels/${hostelId}`);
  return hostel.rooms || [];
};
