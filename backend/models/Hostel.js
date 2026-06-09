import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  title: String,
  type: String,
  seats: Number,
  totalSeats: Number,
  reservedSeats: { type: Number, default: 0 },
  availableSeats: { type: Number, default: 0 },
  advanceAmount: Number,
  seatPrice: Number,
  monthlyTotal: Number,
  firstMonthCharge: Number,
  floorNumber: Number,
  features: [String],
  images: [String],
  description: String,
  url: String
}, { _id: false });

const FloorSchema = new mongoose.Schema({
  floorId: { type: String, required: true },
  name: String,
  floorNumber: Number,
  roomsCount: Number,
  availableSeats: Number,
  roomIds: [String]
}, { _id: false });

const HostelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    default: "boys"
  },

  // ⭐⭐ UPDATED GEOJSON FORMAT ⭐⭐
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],  // [lng, lat]
      index: "2dsphere"
    }
  },

  address: String,
  description: String,
  totalRooms: Number,
  availableRooms: Number,
  startingRent: Number,
  facilities: [String],

  contact: {
  phone: String,
  email: String
},

  jazzCashNumber: String,
  easypaisaNumber: String,

  floors: [FloorSchema],
  rooms: [RoomSchema],
  images: [String],

  owner: {
    name: String,
    role: String
  },

  meta: {
    source: String,
    sourceUrl: String,
    listedOn: Date
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  isSample:  { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  featured:      { type: Boolean, default: false, index: true },
  featuredOrder: { type: Number,  default: 0 },
}, { timestamps: true });

// Pre-save hook
HostelSchema.pre("save", function (next) {
  // If already correct format — do nothing
  if (this.location && Array.isArray(this.location.coordinates)) {
    return next();
  }


  next();
});


HostelSchema.index({ location: "2dsphere" });

export const Hostel = mongoose.model("Hostel", HostelSchema);
