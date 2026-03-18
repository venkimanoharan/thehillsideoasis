"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Room = {
  id: number;
  slug: string;
  name: string;
  capacity: string;
  price_per_night: number;
};

type AlertState = {
  type: "success" | "error";
  message: string;
} | null;

type BookingClientProps = {
  rooms: Room[];
};

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function displayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function BookingClient({ rooms }: BookingClientProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(rooms[0] ?? null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const selectedRoomSlugRef = useRef<string | null>(selectedRoom?.slug ?? null);

  useEffect(() => {
    selectedRoomSlugRef.current = selectedRoom?.slug ?? null;
  }, [selectedRoom]);

  useEffect(() => {
    const preferredRoom = new URLSearchParams(window.location.search).get("room");
    if (!preferredRoom) {
      return;
    }

    const matched = rooms.find((room) => room.slug === preferredRoom);
    if (matched) {
      setSelectedRoom(matched);
    }
  }, [rooms]);

  const loadAvailability = useCallback(async () => {
    const roomSlug = selectedRoom?.slug ?? null;

    if (!roomSlug) {
      setUnavailableDates(new Set());
      return;
    }

    try {
      const response = await fetch(`/api/availability?roomSlug=${roomSlug}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        unavailableDates: string[];
      };

      // Ignore stale responses when user changes room before request finishes.
      if (selectedRoomSlugRef.current !== roomSlug) {
        return;
      }

      setUnavailableDates(new Set(data.unavailableDates ?? []));
    } catch {
      // keep current state on transient errors
    }
  }, [selectedRoom]);

  // Fetch on room change
  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  // Re-fetch when the user returns to this tab (catches admin blocks made while away)
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadAvailability();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [loadAvailability]);

  // If availability changed while user was on the page, clear stale selections.
  useEffect(() => {
    if (!checkinDate) {
      return;
    }

    const checkinKey = toKey(checkinDate);
    if (unavailableDates.has(checkinKey)) {
      setCheckinDate(null);
      setCheckoutDate(null);
      setAlert({
        type: "error",
        message: "Previously selected dates are no longer available. Please reselect your stay dates.",
      });
      return;
    }

    if (!checkoutDate) {
      return;
    }

    const checkoutKey = toKey(checkoutDate);
    if (unavailableDates.has(checkoutKey) || hasUnavailableBetween(checkinDate, checkoutDate)) {
      setCheckoutDate(null);
      setAlert({
        type: "error",
        message: "Your selected range is no longer available. Please choose a new check-out date.",
      });
    }
  }, [unavailableDates, checkinDate, checkoutDate]);

  function hasUnavailableBetween(start: Date, end: Date) {
    const MS_PER_DAY = 86_400_000;
    // start from the day AFTER checkin, up to and including checkout
    const startMs = start.getTime() + MS_PER_DAY;
    const endMs = end.getTime();

    for (let t = startMs; t <= endMs; t += MS_PER_DAY) {
      const d = new Date(t);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (unavailableDates.has(key)) {
        return true;
      }
    }

    return false;
  }

  const nights = useMemo(() => {
    if (!checkinDate || !checkoutDate) {
      return 0;
    }

    return Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [checkinDate, checkoutDate]);

  const totalAmount = selectedRoom ? selectedRoom.price_per_night * nights : 0;

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(currentMonth);
  }, [currentMonth]);

  const daysInGrid = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const leadingEmpty = start.getDay();

    const list: Array<{ type: "empty" } | { type: "day"; date: Date }> = [];

    for (let i = 0; i < leadingEmpty; i += 1) {
      list.push({ type: "empty" });
    }

    for (let day = 1; day <= end.getDate(); day += 1) {
      list.push({
        type: "day",
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
      });
    }

    return list;
  }, [currentMonth]);

  const handleSelectDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return;
    }

    const dateKey = toKey(date);
    if (unavailableDates.has(dateKey)) {
      return;
    }

    if (!checkinDate || checkoutDate) {
      setCheckinDate(date);
      setCheckoutDate(null);
      setAlert(null);
      return;
    }

    if (date.getTime() === checkinDate.getTime()) {
      setCheckinDate(null);
      setCheckoutDate(null);
      setAlert(null);
      return;
    }

    if (date > checkinDate) {
      if (hasUnavailableBetween(checkinDate, date)) {
        // If range crosses blocked dates, treat this click as a new check-in.
        setCheckinDate(date);
        setCheckoutDate(null);
        setAlert({
          type: "error",
          message: "Selected range crosses unavailable dates. New check-in set. Please select a check-out date.",
        });
        return;
      }
      setCheckoutDate(date);
      setAlert(null);
      return;
    }

    setCheckinDate(date);
    setCheckoutDate(null);
    setAlert(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!checkinDate || !checkoutDate) {
      setAlert({ type: "error", message: "Please select check-in and check-out dates." });
      return;
    }

    if (!selectedRoom) {
      setAlert({ type: "error", message: "Please select a room before booking." });
      return;
    }

    const formData = new FormData(event.currentTarget);

    const payload = {
      checkin: toKey(checkinDate),
      checkout: toKey(checkoutDate),
      roomSlug: selectedRoom.slug,
      roomPrice: selectedRoom.price_per_night,
      totalAmount,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      guests: Number(formData.get("guests") ?? 1),
      requests: String(formData.get("requests") ?? ""),
    };

    setSubmitting(true);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        ok: boolean;
        traceId?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        let userMessage = "Unable to submit online right now. Please call +91 91503 60597 or send us a WhatsApp message.";

        if (response.status === 409) {
          userMessage = "Those dates are no longer available. Please choose different dates.";
        } else if (response.status === 400) {
          userMessage = "Please review your booking details and try again.";
        }

        throw new Error(userMessage);
      }

      setAlert({
        type: "success",
        message: "Booking request submitted successfully. We will confirm your stay within 24 hours.",
      });

      event.currentTarget.reset();
      setCheckinDate(null);
      setCheckoutDate(null);
      setSelectedRoom(rooms[0] ?? null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to submit online right now. Please call +91 91503 60597 or send us a WhatsApp message.";

      setAlert({
        type: "error",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="luxury-bg px-6 pb-16 pt-24 text-foreground">
      <section
        className="hero-shell rounded-3xl border border-white/30 p-8 shadow-2xl sm:p-12"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(80, 30, 8, 0.84), rgba(15, 8, 3, 0.62)), url('https://images.pexels.com/photos/1786306/pexels-photo-1786306.jpeg?auto=compress&cs=tinysrgb&w=1800')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">
          Book Your Stay
        </p>
        <h1 className="font-display mt-3 text-4xl text-white sm:text-6xl">
          Reserve Your Mountain Retreat
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-orange-50">
          Pick dates, choose your room, and submit your booking request. We will
          contact you quickly with confirmation.
        </p>
      </section>

      <section className="mx-auto mt-10 grid max-w-[84rem] gap-8 lg:grid-cols-2">
        <article
          className={[
            "luxury-card rounded-3xl p-6 sm:p-8",
            calendarOpen ? "block" : "hidden lg:block",
          ].join(" ")}
        >
          <h2 className="font-display text-3xl text-zinc-900">Select Your Dates</h2>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
                )
              }
              className="rounded-full bg-[#c45e2a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9e3e12]"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-zinc-800 sm:text-base">{monthLabel}</span>
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
                )
              }
              className="rounded-full bg-[#c45e2a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9e3e12]"
            >
              Next
            </button>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs sm:text-sm">
            {dayHeaders.map((header) => (
              <div key={header} className="rounded-lg bg-brand py-2 font-semibold text-white">
                {header}
              </div>
            ))}

            {daysInGrid.map((entry, index) => {
              if (entry.type === "empty") {
                return <div key={`empty-${index}`} className="aspect-square rounded-lg bg-zinc-100" />;
              }

              const key = toKey(entry.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = entry.date < today;
              const isUnavailable = unavailableDates.has(key);
              const isSelected =
                (checkinDate && toKey(checkinDate) === key) ||
                (checkoutDate && toKey(checkoutDate) === key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectDate(entry.date)}
                  disabled={isPast || isUnavailable}
                  className={[
                    "aspect-square rounded-lg border text-sm font-semibold transition",
                    isUnavailable
                      ? "cursor-not-allowed border-rose-300 bg-rose-100 text-rose-700"
                      : isPast
                        ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
                        : isSelected
                          ? "border-[#c45e2a] bg-[#c45e2a] text-white"
                          : "border-zinc-200 bg-white text-zinc-800 hover:border-[#c45e2a] hover:bg-orange-50",
                  ].join(" ")}
                >
                  {entry.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-zinc-600">
            <span className="rounded-full border border-zinc-300 px-3 py-1">Available</span>
            <span className="rounded-full border border-rose-300 bg-rose-100 px-3 py-1 text-rose-700">
              Unavailable
            </span>
            <span className="rounded-full bg-[#c45e2a] px-3 py-1 text-white">Selected</span>
          </div>
        </article>

        <article className="luxury-card rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-3xl text-zinc-900">Booking Details</h2>

          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Date Selection
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {checkinDate
                    ? `${displayDate(checkinDate)}${checkoutDate ? ` - ${displayDate(checkoutDate)}` : ""}`
                    : "Choose check-in and check-out"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCalendarOpen((value) => !value)}
                className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white"
              >
                {calendarOpen ? "Hide Calendar" : "Pick Dates"}
              </button>
            </div>
          </div>

          {alert ? (
            <div
              className={[
                "mt-5 rounded-xl px-4 py-3 text-sm font-medium",
                alert.type === "success"
                  ? "border border-orange-200 bg-orange-50 text-orange-900"
                  : "border border-rose-200 bg-rose-50 text-rose-800",
              ].join(" ")}
            >
              {alert.message}
            </div>
          ) : null}

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Check-in</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {checkinDate ? displayDate(checkinDate) : "Select from calendar"}
                </p>
              </article>
              <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Check-out</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {checkoutDate ? displayDate(checkoutDate) : "Select from calendar"}
                </p>
              </article>
              <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Nights</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {nights ? `${nights} night${nights > 1 ? "s" : ""}` : "Auto calculated"}
                </p>
              </article>
            </div>

            <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Choose Your Room
                <select
                  value={selectedRoom?.slug ?? ""}
                  onChange={(event) => {
                    const room = rooms.find((entry) => entry.slug === event.target.value) ?? null;
                    setSelectedRoom(room);
                    setCheckinDate(null);
                    setCheckoutDate(null);
                  }}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-800"
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.slug}>
                      {room.name} - INR {room.price_per_night.toLocaleString()}/night
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl bg-brand-soft px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-strong">Capacity</p>
                <p className="text-sm font-semibold text-zinc-900">{selectedRoom?.capacity ?? "-"}</p>
              </div>
            </div>

            {selectedRoom && nights > 0 ? (
              <div className="rounded-xl bg-zinc-50 p-4">
                <div className="flex justify-between text-sm text-zinc-700">
                  <span>Room Rate</span>
                  <span>INR {selectedRoom.price_per_night.toLocaleString()}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-zinc-700">
                  <span>Nights</span>
                  <span>{nights}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-sm font-bold text-[#c45e2a]">
                  <span>Total Amount</span>
                  <span>INR {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Full Name
                <input name="name" required className="rounded-xl border border-zinc-300 px-3 py-2" />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Phone Number
                <input
                  name="phone"
                  type="tel"
                  required
                  className="rounded-xl border border-zinc-300 px-3 py-2"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Email Address
                <input
                  name="email"
                  type="email"
                  required
                  className="rounded-xl border border-zinc-300 px-3 py-2"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-zinc-800">
                Number of Guests
                <input
                  name="guests"
                  type="number"
                  min={1}
                  defaultValue={1}
                  required
                  className="rounded-xl border border-zinc-300 px-3 py-2"
                />
              </label>
            </div>

            <details className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-zinc-800">
                Add Special Requests (Optional)
              </summary>
              <label className="mt-3 grid gap-2 text-sm font-semibold text-zinc-800">
                Notes
                <textarea
                  name="requests"
                  rows={3}
                  placeholder="Dietary preferences, accessibility needs, or celebration notes"
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2"
                />
              </label>
            </details>

            <button
              type="submit"
              disabled={submitting}
              className="luxury-btn-primary mt-1 rounded-xl px-5 py-3 text-sm font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {submitting ? "Processing..." : "Complete Booking"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-zinc-600">
            Need immediate help? Call <strong>+91 91503 60597</strong>
          </p>
        </article>
      </section>

      <section className="mx-auto mt-10 max-w-[84rem] rounded-3xl border border-orange-100 bg-[linear-gradient(135deg,#fdf0e8,#f6efe1)] p-6 shadow-xl sm:p-8">
        <h3 className="font-display text-3xl text-zinc-900">Need Help with Your Booking?</h3>
        <p className="mt-2 text-zinc-700">Our team is available by phone, WhatsApp, and email.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href="tel:+919150360597" className="rounded-xl bg-white p-4 font-medium text-zinc-800 shadow-sm">
            Phone: +91 91503 60597
          </a>
          <a
            href="https://wa.me/919150360597"
            className="rounded-xl bg-white p-4 font-medium text-zinc-800 shadow-sm"
          >
            WhatsApp: +91 91503 60597
          </a>
          <a
            href="mailto:info@thehillsideoasis.com"
            className="rounded-xl bg-white p-4 font-medium text-zinc-800 shadow-sm"
          >
            Email: info@thehillsideoasis.com
          </a>
          <div className="rounded-xl bg-white p-4 font-medium text-zinc-800 shadow-sm">
            Pollachi, Tamil Nadu
          </div>
        </div>
      </section>
    </main>
  );
}
