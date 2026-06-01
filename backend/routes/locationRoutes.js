import express from "express";
import { geocodeLocation } from "../controllers/locationController.js";

const router = express.Router();

router.post("/geocode", geocodeLocation);

export default router;
