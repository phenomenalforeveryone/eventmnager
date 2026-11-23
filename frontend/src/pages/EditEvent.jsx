
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, ImagePlus, X } from "lucide-react";
import api from "../services/api";
import "./EditEvent.css";

const categories = [
  "Technology",
  "Music",
  "Sports",
  "Cultural",
  "Workshop",
  "Education",
  "Business",
  "Other"
];

const initialForm = {
  title: "",
  description: "",
  category: "Technology",
  venue: "",
  location: "",
  startDate: "",
  endDate: "",
  ticketPrice: "0",
  capacity: "",
  tags: ""
};

const formatDateTime = (date) => {
  if (!date) return "";

  const value = new Date(date);
  const local = new Date(
    value.getTime() - value.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
};

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [poster, setPoster] = useState(null);
  const [currentPoster, setCurrentPoster] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);

        const response = await api.get("/events/my-events");
        const data = response.data;

        const events = Array.isArray(data)
          ? data
          : data.events || data.data?.events || [];

        const event = events.find((item) => item._id === id);

        if (!event) {
          setError("Event not found or you do not have permission to edit it.");
          return;
        }

        setForm({
          title: event.title || "",
          description: event.description || "",
          category: event.category || "Technology",
          venue: event.venue || "",
          location: event.location || "",
          startDate: formatDateTime(event.startDate),
          endDate: formatDateTime(event.endDate),
          ticketPrice: String(event.ticketPrice ?? 0),
          capacity: String(event.capacity ?? ""),
          tags: Array.isArray(event.tags)
            ? event.tags.join(", ")
            : event.tags || ""
        });

        setCurrentPoster(event.poster || "");
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load event details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Poster must be smaller than 5 MB.");
      return;
    }

    setError("");
    setPoster(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError("End date and time must be after the start date.");
      return;
    }

    if (Number(form.ticketPrice) < 0) {
      setError("Ticket price cannot be negative.");
      return;
    }

    if (!Number.isInteger(Number(form.capacity)) || Number(form.capacity) < 1) {
      setError("Capacity must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "tags") {
          data.append(
            key,
            JSON.stringify(
              value.split(",").map((tag) => tag.trim()).filter(Boolean)
            )
          );
        } else {
          data.append(key, value);
        }
      });

      if (poster) {
        data.append("poster", poster);
      }

      await api.put(`/events/${id}`, data);

      setSuccess("Event updated successfully. It may require admin approval.");

      setTimeout(() => {
        navigate("/organizer/events");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update event."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-event-loading">
        Loading event details...
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div className="edit-event-loading">
        <p>{error}</p>
        <button onClick={() => navigate("/organizer/events")}>
          Back to My Events
        </button>
      </div>
    );
  }

  return (
    <div className="edit-event-page">

      <header className="edit-event-header">
        <button
          className="edit-back-button"
          onClick={() => navigate("/organizer/events")}
        >
          <ArrowLeft size={17} />
          Back to My Events
        </button>

        <span>ORGANIZER STUDIO</span>
      </header>

      <main className="edit-event-container">

        <div className="edit-event-heading">
          <span>EVENT MANAGEMENT</span>
          <h1>Edit Event</h1>
          <p>Update your event information and keep your audience informed.</p>
        </div>

        {error && (
          <div className="edit-event-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="edit-event-alert success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-event-form">

          <section className="edit-form-section">
            <h2>01. Event Information</h2>
            <p>Give your event its identity.</p>

            <div className="edit-form-group">
              <label>Event Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={120}
                placeholder="Enter event title"
              />
            </div>

            <div className="edit-form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe your event..."
              />
            </div>

            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-form-group">
                <label>Tags</label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="AI, Technology, Innovation"
                />
              </div>
            </div>
          </section>

          <section className="edit-form-section">
            <h2>02. Date & Location</h2>
            <p>Where and when will your event happen?</p>

            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label>Venue *</label>
                <input
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  required
                  placeholder="Enter venue name"
                />
              </div>

              <div className="edit-form-group">
                <label>City / Location *</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter location"
                />
              </div>

              <div className="edit-form-group">
                <label>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-form-group">
                <label>End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          <section className="edit-form-section">
            <h2>03. Tickets & Capacity</h2>
            <p>Set your event's ticket pricing and attendance limit.</p>

            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label>Ticket Price (₹) *</label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={form.ticketPrice}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="edit-form-group">
                <label>Total Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>
          </section>

          <section className="edit-form-section">
            <h2>04. Event Poster</h2>
            <p>Keep your event artwork fresh.</p>

            {currentPoster && !poster && (
              <div className="edit-current-poster">
                <img
                  src={
                    currentPoster.startsWith("http")
                      ? currentPoster
                      : `http://localhost:5000${currentPoster}`
                  }
                  alt="Current event poster"
                />
                <span>Current poster</span>
              </div>
            )}

            <label className="edit-poster-upload">
              <ImagePlus size={27} />
              <strong>
                {poster ? poster.name : "Choose a replacement poster"}
              </strong>
              <span>JPG, PNG or WEBP · Maximum 5 MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePosterChange}
                hidden
              />
            </label>

            {poster && (
              <button
                type="button"
                className="edit-remove-poster"
                onClick={() => setPoster(null)}
              >
                <X size={15} />
                Remove selected replacement
              </button>
            )}
          </section>

          <div className="edit-event-actions">
            <button
              type="button"
              className="edit-cancel-button"
              onClick={() => navigate("/organizer/events")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-save-button"
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
