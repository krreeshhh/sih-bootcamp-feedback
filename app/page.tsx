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
  IconUser,
  IconId,
  IconDownload,
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
  "Problem-solving",
  "Learning new tools",
  "Loved the demo",
  "Mentorship support",
  "Project showcase",
];

const validateName = (val: string): string | null => {
  const trimmed = val.trim();
  if (!trimmed) {
    return "Enter your name";
  }
  if (trimmed.length < 5 || trimmed.length > 20) {
    return "Name must be between 5 and 20 letters";
  }
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return "Name must contain only letters";
  }
  return null;
};

const validateRegNo = (val: string): string | null => {
  const trimmed = val.trim();
  if (!trimmed) {
    return "Enter your reg no";
  }
  if (trimmed.length < 8 || trimmed.length > 9) {
    return "Reg No must be 8 to 9 characters";
  }
  if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
    return "Reg No must contain only letters and numbers";
  }
  return null;
};

export default function FeedbackFormPage() {
  const [name, setName] = useState<string>("");
  const [regNo, setRegNo] = useState<string>("");
  const [rating, setRating] = useState<RatingType | null>(null);
  const [confidence, setConfidence] = useState<number>(75);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [comment, setComment] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [regNoError, setRegNoError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<boolean>(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch("/api/download");
      if (!response.ok) throw new Error("Download request failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "DESIGN_AND_SIMULATION_SOFTWARES.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Direct blob download failed, falling back to server route:", err);
      window.location.href = "/api/download";
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const toggleHighlight = (item: string) => {
    setHighlights((prev) =>
      prev.includes(item) ? prev.filter((h) => h !== item) : [...prev, item]
    );
  };

  const handleRatingSelect = (val: RatingType) => {
    setRating(val);
    if (ratingError) {
      setRatingError(false);
      if (!commentError && !nameError && !regNoError) setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateName(name);
    const regNoErr = validateRegNo(regNo);
    const ratingErr = !rating;
    const commentErr = !comment.trim();

    setNameError(nameErr);
    setRegNoError(regNoErr);
    setRatingError(ratingErr);
    setCommentError(commentErr);

    if (nameErr || regNoErr || ratingErr || commentErr) {
      setErrorMsg("Please complete and correct all required fields");
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
        name: name.trim(),
        regNo: regNo.trim().toUpperCase(),
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
    setName("");
    setRegNo("");
    setRating(null);
    setConfidence(75);
    setHighlights([]);
    setComment("");
    setSubmitted(false);
    setErrorMsg(null);
    setNameError(null);
    setRegNoError(null);
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
              Your response has been successfully recorded. You can download the Design &amp;
              Simulation Softwares guide below.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="download-btn"
              aria-label="Download software guide PDF"
            >
              {downloading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderTopColor: "#000000" }} />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <IconDownload size={18} stroke={2.2} />
                  <span>Download Software Guide</span>
                </>
              )}
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

            {/* Student Info (Name & Reg No) */}
            <div className="form-row-grid">
              <div className="form-section">
                <label htmlFor="student-name" className="section-label">
                  Name
                </label>
                <div className="input-wrapper">
                  <IconUser size={16} className="input-icon" stroke={1.8} />
                  <input
                    id="student-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      if (nameError) {
                        const err = validateName(val);
                        setNameError(err);
                        if (!err && !regNoError && !ratingError && !commentError) setErrorMsg(null);
                      }
                    }}
                    placeholder="Minimum 5 letters"
                    maxLength={20}
                    className={`form-input ${nameError ? "input-error" : ""}`}
                    autoComplete="name"
                  />
                </div>
                {nameError && (
                  <div className="error-text">
                    <IconAlertCircle size={14} stroke={2} />
                    <span>{nameError}</span>
                  </div>
                )}
              </div>

              <div className="form-section">
                <label htmlFor="student-regno" className="section-label">
                  Reg No
                </label>
                <div className="input-wrapper">
                  <IconId size={16} className="input-icon" stroke={1.8} />
                  <input
                    id="student-regno"
                    type="text"
                    value={regNo}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setRegNo(val);
                      if (regNoError) {
                        const err = validateRegNo(val);
                        setRegNoError(err);
                        if (!err && !nameError && !ratingError && !commentError) setErrorMsg(null);
                      }
                    }}
                    placeholder="Minimum 8 characters"
                    maxLength={9}
                    className={`form-input ${regNoError ? "input-error" : ""}`}
                    autoComplete="off"
                  />
                </div>
                {regNoError && (
                  <div className="error-text">
                    <IconAlertCircle size={14} stroke={2} />
                    <span>{regNoError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Rating (Compulsory) */}
            <div className="form-section">
              <label className="section-label">
                Overall experience 
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

            {/* Confidence Slider (Compulsory) */}
            <div className="form-section">
              <div className="section-label-row">
                <label htmlFor="confidence-range" className="section-label" style={{ margin: 0 }}>
                  Confidence on hardware after today
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

            {/* What Stood Out (Optional) */}
            <div className="form-section">
              <label className="section-label">
                What stood out to you?
              </label>
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
                Key takeaway or feedback 
              </label>
              <textarea
                id="feedback-comment"
                rows={2}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (commentError && e.target.value.trim()) {
                    setCommentError(false);
                    if (!ratingError && !nameError && !regNoError) setErrorMsg(null);
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

            {/* General error message banner */}
            {errorMsg && !ratingError && !nameError && !regNoError && !commentError && (
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
    </main>
  );
}
