import Review from "../models/Review.js";
import Settings from "../models/Settings.js";

// ── User: submit review ──────────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { rating, reviewText, hostelId } = req.body;
    if (!rating || !reviewText) return res.status(400).json({ message: "Rating and review text are required" });

    const existing = await Review.findOne({ userId: req.user._id, hostelId: hostelId || null });
    if (existing) return res.status(409).json({ message: "You have already submitted a review" });

    const review = await Review.create({
      userId: req.user._id,
      hostelId: hostelId || null,
      rating,
      reviewText,
    });

    res.status(201).json({ message: "Review submitted for approval", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── User: get own reviews ────────────────────────────────────────────────────
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate("hostelId", "name address images")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── User: edit own review (only if pending or rejected) ─────────────────────
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

    const { rating, reviewText } = req.body;
    if (rating) review.rating = rating;
    if (reviewText) review.reviewText = reviewText;
    review.status = "pending"; // re-submit for approval
    await review.save();

    res.json({ message: "Review updated and re-submitted for approval", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── User: delete own review ──────────────────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Public: get approved reviews (used on homepage) ─────────────────────────
export const getApprovedReviews = async (req, res) => {
  try {
    const settings = await Settings.findOne().lean();
    if (settings && settings.reviewsEnabled === false) return res.json([]);

    const limit = settings?.reviewsLimit || 6;
    const sortBy = settings?.reviewsSortBy || "latest";
    const sort = sortBy === "highest_rated" ? { rating: -1, createdAt: -1 } : { createdAt: -1 };

    const reviews = await Review.find({ status: "approved" })
      .populate("userId", "name profilePicture")
      .populate("hostelId", "name")
      .sort(sort)
      .limit(limit);

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin: get all reviews with filters ─────────────────────────────────────
export const getAllReviews = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    let reviews = await Review.find(query)
      .populate("userId", "name email profilePicture")
      .populate("hostelId", "name address")
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.userId?.name?.toLowerCase().includes(q) ||
          r.reviewText?.toLowerCase().includes(q) ||
          r.hostelId?.name?.toLowerCase().includes(q)
      );
    }

    const total = reviews.length;
    const paginated = reviews.slice((page - 1) * limit, page * limit);
    res.json({ reviews: paginated, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin: approve review ────────────────────────────────────────────────────
export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review approved", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin: reject review ─────────────────────────────────────────────────────
export const rejectReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review rejected", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin: edit review ───────────────────────────────────────────────────────
export const adminEditReview = async (req, res) => {
  try {
    const { rating, reviewText, status } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (rating !== undefined) review.rating = rating;
    if (reviewText !== undefined) review.reviewText = reviewText;
    if (status !== undefined) review.status = status;
    await review.save();

    res.json({ message: "Review updated", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin: delete review ─────────────────────────────────────────────────────
export const adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin: stats ─────────────────────────────────────────────────────────────
export const getReviewStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "approved" }),
      Review.countDocuments({ status: "rejected" }),
    ]);
    res.json({ total, pending, approved, rejected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
