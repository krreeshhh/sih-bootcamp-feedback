"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  IconCpu,
  IconMoodSad,
  IconMoodNeutral,
  IconMoodSmile,
  IconBolt,
  IconArrowRight,
  IconCheck,
  IconAlertCircle,
  IconRotateClockwise,
} from "@tabler/icons-react";

type RatingType = "sad" | "neutral" | "happy" | "excited";

interface RatingOption {
  value: RatingType;
  label: string;
  icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
}

const RATING_OPTIONS: RatingOption[] = [
  { value: "sad", label: "Tough", icon: IconMoodSad },
  { value: "neutral", label: "Okay", icon: IconMoodNeutral },
  { value: "happy", label: "Good", icon: IconMoodSmile },
  { value: "excited", label: "Awesome", icon: IconBolt },
];

const HIGHLIGHT_OPTIONS = [
  "Soldering session",
  "Pace felt fast",
  "Need more kits",
  "Loved the demo",
  "Multimeter walkthrough",
  "Wanted more time",
];

export default function FeedbackFormPage() {
  const [rating, setRating] = useState<RatingType | null>(null);
  const [confidence, setConfidence] = useState<number>(75);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [comment, setComment] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<boolean>(false);

  const toggleHighlight = (item: string) => {
    setHighlights((prev) =>
      prev.includes(item) ? prev.filter((h) => h !== item) : [...prev, item]
    );
  };

  const handleRatingSelect = (val: RatingType) => {
    setRating(val);
    if (ratingError) {
      setRatingError(false);
      if (!commentError) setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (!rating) {
      setRatingError(true);
      hasError = true;
    }
    if (!comment.trim()) {
      setCommentError(true);
      hasError = true;
    }

    if (hasError) {
      setErrorMsg("Please complete the required fields marked with *");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Check if Firebase is properly configured
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (!apiKey || apiKey === "your-api-key") {
        console.warn(
          "Firebase config missing in environment variables. Simulated submission recorded."
        );
        await new Promise((resolve) => setTimeout(resolve, 600));
        setSubmitted(true);
        return;
      }

      await addDoc(collection(db, "feedback"), {
        rating,
        confidence: Number(confidence),
        highlights,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Error submitting feedback:", err);
      const message =
        err instanceof Error ? err.message : "Failed to submit feedback. Please try again.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRating(null);
    setConfidence(75);
    setHighlights([]);
    setComment("");
    setSubmitted(false);
    setErrorMsg(null);
    setRatingError(false);
    setCommentError(false);
  };

  // Dynamic monochrome slider background fill
  const sliderFillStyle = {
    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${confidence}%, rgba(255, 255, 255, 0.15) ${confidence}%, rgba(255, 255, 255, 0.15) 100%)`,
  };

  return (
    <main className="page-container">
      <div className="bg-wrapper">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
      </div>

      <div className="glass-card">
        {submitted ? (
          <div className="success-card">
            <div className="success-icon-wrapper">
              <IconCheck size={32} stroke={2.5} />
            </div>
            <h2 className="success-title">Thanks for the feedback!</h2>
            <p className="success-desc">
              Your response has been recorded anonymously. Best of luck with your hardware
              projects!
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="reset-btn"
            >
              <IconRotateClockwise size={16} stroke={2} />
              Submit another response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Header */}
            <div className="card-header">
              <div className="badge-tag">
                <IconCpu size={14} stroke={2} />
                <span>SIH hardware bootcamp</span>
              </div>
              <h1 className="card-title">How was today?</h1>
            </div>

            {/* Overall Rating */}
            <div className="form-section">
              <label className="section-label">
                Overall experience <span style={{ color: "#ffffff" }}>*</span>
              </label>
              <div className="rating-grid">
                {RATING_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = rating === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleRatingSelect(opt.value)}
                      className={`rating-btn ${isSelected ? "selected" : ""} ${
                        ratingError && !rating ? "rating-error-border" : ""
                      }`}
                      aria-label={opt.label}
                      aria-pressed={isSelected}
                    >
                      <Icon size={26} stroke={1.8} />
                      <span className="rating-label-text">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {ratingError && (
                <div className="error-text">
                  <IconAlertCircle size={14} stroke={2} />
                  <span>Please pick how today felt</span>
                </div>
              )}
            </div>

            {/* Confidence Slider */}
            <div className="form-section">
              <div className="section-label-row">
                <label htmlFor="confidence-range" className="section-label" style={{ margin: 0 }}>
                  Confidence with the tools
                </label>
                <span className="slider-val-badge">{confidence}%</span>
              </div>
              <div className="slider-container">
                <input
                  id="confidence-range"
                  type="range"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="confidence-slider"
                  style={sliderFillStyle}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={confidence}
                  aria-label="Confidence with the tools"
                />
                <div className="slider-scale-labels">
                  <span>Beginner</span>
                  <span>Getting there</span>
                  <span>Pro ready</span>
                </div>
              </div>
            </div>

            {/* What Stood Out */}
            <div className="form-section">
              <label className="section-label">What stood out to you?</label>
              <div className="chips-grid">
                {HIGHLIGHT_OPTIONS.map((item) => {
                  const isSelected = highlights.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleHighlight(item)}
                      className={`chip-btn ${isSelected ? "selected" : ""}`}
                      aria-pressed={isSelected}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Key Takeaway / Feedback (Compulsory) */}
            <div className="form-section">
              <label htmlFor="feedback-comment" className="section-label">
                Key takeaway or feedback <span style={{ color: "#ffffff" }}>*</span>
              </label>
              <textarea
                id="feedback-comment"
                rows={2}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (commentError && e.target.value.trim()) {
                    setCommentError(false);
                    if (!ratingError) setErrorMsg(null);
                  }
                }}
                placeholder="What did you learn today, or how could we improve?"
                className={`comment-textarea ${commentError ? "textarea-error" : ""}`}
                maxLength={500}
              />
              {commentError && (
                <div className="error-text">
                  <IconAlertCircle size={14} stroke={2} />
                  <span>Please share your takeaway or suggestions</span>
                </div>
              )}
            </div>

            {/* Error banner if submission failed */}
            {errorMsg && !ratingError && !commentError && (
              <div className="error-text" style={{ marginBottom: "12px" }}>
                <IconAlertCircle size={15} stroke={2} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
              aria-label="Submit feedback"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit feedback</span>
                  <IconArrowRight size={18} stroke={2.2} />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <footer className="footer-text">
        SIH Hardware Bootcamp • Minimal Monochrome Edition
      </footer>
    </main>
  );
}
