import mongoose from 'mongoose';

const tripLocationHistorySchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: false, index: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: false, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    locationName: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export default mongoose.model('TripLocationHistory', tripLocationHistorySchema);
