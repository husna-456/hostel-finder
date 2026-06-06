import { supabase } from "../lib/supabaseClient";

export const uploadFile = async (blob, folder, filename) => {
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}_${filename}`;
  const { error } = await supabase.storage.from("hostel-images").upload(path, blob);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("hostel-images").getPublicUrl(path);
  return data.publicUrl;
};
