import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), "../../.env") });

import connectDB from "../config/db.js";
import User from "../models/User.js";
import Hostel from "../models/Hostel.js";

async function redistribute() {
  await connectDB();

  const owners  = await User.find({ role: "hostel_owner" }, "name _id").lean();
  const hostels = await Hostel.find({}, "name _id").lean();

  if (owners.length === 0) {
    console.log("No owners found — nothing to do.");
    await mongoose.disconnect();
    return;
  }
  if (hostels.length === 0) {
    console.log("No hostels found — nothing to do.");
    await mongoose.disconnect();
    return;
  }

  console.log(`\nFound ${owners.length} owner(s) and ${hostels.length} hostel(s).\n`);

  const tally = Object.fromEntries(owners.map(o => [o._id.toString(), { name: o.name, count: 0 }]));

  const ops = hostels.map((hostel, idx) => {
    const owner = owners[idx % owners.length];
    tally[owner._id.toString()].count += 1;
    console.log(`  Owner "${owner.name}" → "${hostel.name}"`);
    return {
      updateOne: {
        filter: { _id: hostel._id },
        update: { $set: { ownerId: owner._id } },
      },
    };
  });

  await Hostel.bulkWrite(ops);

  console.log("\n── Summary ─────────────────────────────────");
  for (const { name, count } of Object.values(tally)) {
    console.log(`  ${name}: ${count} hostel(s)`);
  }
  console.log("────────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("Done. DB disconnected.");
}

redistribute().catch(err => {
  console.error("Script failed:", err.message);
  process.exit(1);
});
