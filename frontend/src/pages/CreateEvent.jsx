
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, ImagePlus, Upload, Plus, X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./CreateEvent.css";

const initialForm = {
  title: "",
  description: "",
  category: "Technology",
  venue: "",
  location: "",
  startDate: "",
  endDate: "",
  ticketPrice: 0,
  capacity: 100,
  tags: ""
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handlePoster = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Poster must be smaller than 5 MB.");
      return;
    }

    setError("");
    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError("End date must be after the start date.");
      return;
    }

    if (Number(form.ticketPrice) < 0 || Number(form.capacity) < 1) {
      setError("Enter a valid ticket price and capacity.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "tags") {
          data.append(
            "tags",
            JSON.stringify(value.split(",").map((tag) => tag.trim()).filter(Boolean))
          );
        } else {
          data.append(key, value);
        }
      });

      if (poster) data.append("poster", poster);

      const response = await api.post("/events", data);

      setSuccess(response.data.message || "Event submitted successfully.");

      setTimeout(() => navigate("/organizer"), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.join(", ") ||
        "Unable to submit event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <header className="create-event-header">
        <button onClick={() => navigate("/organizer")} className="create-back">
          <ArrowLeft size={18} /> Back to dashboard
        </button>
        <div className="create-brand">EventEase <span>ORGANIZER STUDIO</span></div>
      </header>

      <main className="create-event-container">
        <div className="create-event-heading">
          <span>BRING YOUR IDEA TO LIFE</span>
          <h1>Create an event.</h1>
          <p>Share an experience people will remember.</p>
        </div>

        <form className="create-event-form" onSubmit={handleSubmit}>
          <section className="create-form-section">
            <h2>01. Event information</h2>
            <p>Tell attendees what your event is about.</p>

            <label>Event title *</label>
            <input name="title" value={form.title} onChange={updateField}
              placeholder="e.g. Technology Innovation Summit" required maxLength={100} />

            <label>Event description *</label>
            <textarea name="description" value={form.description} onChange={updateField}
              placeholder="Describe your event, highlights and what attendees can expect..."
              rows={5} required maxLength={2000} />

            <label>Category *</label>
            <select name="category" value={form.category} onChange={updateField}>
              {["Technology", "Music", "Sports", "Cultural", "Workshop", "Education", "Business", "Other"].map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <label>Tags</label>
            <input name="tags" value={form.tags} onChange={updateField}
              placeholder="AI, networking, innovation (comma separated)" />
          </section>

          <section className="create-form-section">
            <h2>02. Location and schedule</h2>
            <p>Where and when will it happen?</p>

            <label>Venue name *</label>
            <input name="venue" value={form.venue} onChange={updateField}
              placeholder="Venue or auditorium name" required />

            <label>City / Location *</label>
            <input name="location" value={form.location} onChange={updateField}
              placeholder="e.g. Lucknow" required />

            <div className="create-date-grid">
              <div>
                <label><CalendarDays size={15} /> Start date and time *</label>
                <input type="datetime-local" name="startDate" value={form.startDate}
                  onChange={updateField} required />
              </div>
              <div>
                <label><CalendarDays size={15} /> End date and time *</label>
                <input type="datetime-local" name="endDate" value={form.endDate}
                  onChange={updateField} required />
              </div>
            </div>
          </section>

          <section className="create-form-section">
            <h2>03. Tickets and capacity</h2>
            <p>Set your ticket price and the number of attendees.</p>

            <div className="create-date-grid">
              <div>
                <label>Ticket price (₹) *</label>
                <input type="number" name="ticketPrice" min="0" step="1"
                  value={form.ticketPrice} onChange={updateField} required />
              </div>
              <div>
                <label>Maximum capacity *</label>
                <input type="number" name="capacity" min="1" step="1"
                  value={form.capacity} onChange={updateField} required />
              </div>
            </div>
          </section>

          <section className="create-form-section">
            <h2>04. Event poster</h2>
            <p>Upload an image to represent your event.</p>

            <label className="create-upload-area">
              {preview ? (
                <img src={preview} alt="Event poster preview" />
              ) : (
                <>
                  <ImagePlus size={35} />
                  <strong>Choose your event poster</strong>
                  <span>JPG, PNG or WEBP · Maximum 5 MB</span>
                  <span className="create-upload-button"><Upload size={16} /> Browse files</span>
                </>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp"
                onChange={handlePoster} hidden />
            </label>

            {poster && (
              <button type="button" className="create-remove-poster"
                onClick={() => { setPoster(null); setPreview(""); }}>
                <X size={15} /> Remove poster
              </button>
            )}
          </section>

          {error && <div className="create-message error">{error}</div>}
          {success && <div className="create-message success">{success}</div>}

          <div className="create-submit-area">
            <p>Your event will be submitted for administrator approval before publication.</p>
            <button type="submit" disabled={loading}>
              {loading ? <Loader2 className="create-loader" size={18} /> : <Plus size={18} />}
              {loading ? "Submitting..." : "Submit event for approval"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
