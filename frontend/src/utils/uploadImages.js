import { supabase } from "../lib/supabaseClient";

export const uploadImagesToSupabase = async (files, folder = "hostels") => {
  const uploadedUrls = [];

  for (let fileObj of files) {
    const file = fileObj.file; // actual File object
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("hostel-images")
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("hostel-images")
      .getPublicUrl(fileName);

    uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
};
