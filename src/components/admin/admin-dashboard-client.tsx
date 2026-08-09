"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type RoomItem = {
  id: number;
  slug: string;
  name: string;
  capacity: string;
  bed: string;
  view_label: string;
  description: string;
  amenities: string[];
  price_per_night: number;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

type ActivityItem = {
  id: number;
  category: string;
  title: string;
  description: string;
  duration_label: string | null;
  price_label: string | null;
  distance_label: string | null;
  sort_order: number;
  is_active: boolean;
};

type GalleryItem = {
  id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
};

type BookingItem = {
  id: number;
  trace_id: string;
  checkin: string;
  checkout: string;
  room_slug: string;
  total_amount: number;
  name: string;
  email: string;
  phone: string;
  guests: number;
  requests: string | null;
  status: string;
  created_at: string;
};

type SettingsItem = {
  contactPhoneDisplay: string;
  contactPhoneHref: string;
  contactWhatsappDisplay: string;
  contactWhatsappHref: string;
  contactEmailDisplay: string;
  contactEmailHref: string;
  contactAddressDisplay: string;
  facebookUrl: string;
  instagramUrl: string;
};

type EmailTemplateKey = "booking_received" | "booking_confirmed" | "booking_cancelled";

type EmailTemplate = {
  subject: string;
  heading: string;
  message: string;
};

const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  booking_received: "Booking Received (sent to guest on new booking)",
  booking_confirmed: "Booking Confirmed (sent when you mark a booking confirmed)",
  booking_cancelled: "Booking Cancelled (sent when you mark a booking cancelled)",
};

const EMAIL_TEMPLATE_KEYS: EmailTemplateKey[] = ["booking_received", "booking_confirmed", "booking_cancelled"];

const BLANK_EMAIL_TEMPLATE: EmailTemplate = { subject: "", heading: "", message: "" };

type CustomerSummary = {
  email: string;
  name: string;
  phone: string;
  bookings: BookingItem[];
  totalStays: number;
  totalSpend: number;
};

type TabKey = "rooms" | "activities" | "gallery" | "bookings" | "customers" | "settings";

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function statusPriority(status: string) {
  if (status === "blocked") {
    return 4;
  }

  if (status === "confirmed") {
    return 3;
  }

  if (status === "new") {
    return 2;
  }

  return 1;
}

function statusPillClass(status: string) {
  if (status === "blocked") {
    return "bg-rose-100 text-rose-700 border border-rose-300";
  }

  if (status === "confirmed") {
    return "bg-orange-100 text-[#9e3e12] border border-orange-200";
  }

  if (status === "new") {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }

  return "bg-zinc-100 text-zinc-600 border border-zinc-200";
}

function dayCellClass(status?: string) {
  if (status === "blocked") {
    return "border-rose-300 bg-rose-100 text-rose-700";
  }

  if (status === "confirmed") {
    return "border-orange-300 bg-orange-100 text-[#9e3e12]";
  }

  if (status === "new") {
    return "border-amber-300 bg-amber-100 text-amber-800";
  }

  if (status === "cancelled") {
    return "border-zinc-200 bg-zinc-50 text-zinc-500";
  }

  return "border-zinc-200 bg-white text-zinc-700";
}

function stayPillClass(stay: "past" | "current" | "future") {
  if (stay === "current") {
    return "bg-orange-100 text-[#9e3e12] border border-orange-200";
  }

  if (stay === "future") {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }

  return "bg-zinc-100 text-zinc-600 border border-zinc-200";
}

function classifyStay(booking: BookingItem, todayKey: string): "past" | "current" | "future" {
  if (booking.checkout <= todayKey) {
    return "past";
  }

  if (booking.checkin <= todayKey && booking.checkout > todayKey) {
    return "current";
  }

  return "future";
}

const BLANK_ROOM: Omit<RoomItem, "id"> = {
  slug: "",
  name: "New Room",
  capacity: "",
  bed: "",
  view_label: "",
  description: "",
  amenities: [],
  price_per_night: 0,
  image_url: "",
  sort_order: 0,
  is_active: true,
};

const BLANK_ACTIVITY: Omit<ActivityItem, "id"> = {
  category: "on_property",
  title: "New Activity",
  description: "",
  duration_label: "",
  price_label: "",
  distance_label: "",
  sort_order: 0,
  is_active: true,
};

const BLANK_GALLERY: Omit<GalleryItem, "id"> = {
  image_url: "",
  alt_text: "",
  sort_order: 0,
  is_active: true,
};

export default function AdminDashboardClient() {
  const [tab, setTab] = useState<TabKey>("rooms");
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [settings, setSettings] = useState<SettingsItem>({
    contactPhoneDisplay: "",
    contactPhoneHref: "",
    contactWhatsappDisplay: "",
    contactWhatsappHref: "",
    contactEmailDisplay: "",
    contactEmailHref: "",
    contactAddressDisplay: "",
    facebookUrl: "",
    instagramUrl: "",
  });
  const [blockRoom, setBlockRoom] = useState<string>("");
  const [calendarRoom, setCalendarRoom] = useState<string>("");
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [blockCheckin, setBlockCheckin] = useState<string>("");
  const [blockCheckout, setBlockCheckout] = useState<string>("");
  const [blockNote, setBlockNote] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [emailTemplates, setEmailTemplates] = useState<Record<EmailTemplateKey, EmailTemplate>>({
    booking_received: BLANK_EMAIL_TEMPLATE,
    booking_confirmed: BLANK_EMAIL_TEMPLATE,
    booking_cancelled: BLANK_EMAIL_TEMPLATE,
  });

  const fetchData = useCallback(async () => {
    try {
      const [roomsRes, activitiesRes, galleryRes, bookingsRes, settingsRes, emailTemplatesRes] = await Promise.all([
        fetch("/api/admin/rooms", { cache: "no-store" }),
        fetch("/api/admin/activities", { cache: "no-store" }),
        fetch("/api/admin/gallery", { cache: "no-store" }),
        fetch("/api/admin/bookings", { cache: "no-store" }),
        fetch("/api/admin/settings", { cache: "no-store" }),
        fetch("/api/admin/email-templates", { cache: "no-store" }),
      ]);

      if (
        !roomsRes.ok ||
        !activitiesRes.ok ||
        !galleryRes.ok ||
        !bookingsRes.ok ||
        !settingsRes.ok ||
        !emailTemplatesRes.ok
      ) {
        throw new Error("Failed to load admin data.");
      }

      const roomsData = (await roomsRes.json()) as { items: RoomItem[] };
      const activitiesData = (await activitiesRes.json()) as { items: ActivityItem[] };
      const galleryData = (await galleryRes.json()) as { items: GalleryItem[] };
      const bookingsData = (await bookingsRes.json()) as { items: BookingItem[] };
      const settingsData = (await settingsRes.json()) as { settings: SettingsItem };
      const emailTemplatesData = (await emailTemplatesRes.json()) as {
        templates: Record<EmailTemplateKey, EmailTemplate>;
      };

      setRooms(roomsData.items);
      setActivities(activitiesData.items);
      setGallery(galleryData.items);
      setBookings(bookingsData.items);
      setSettings(settingsData.settings);
      setEmailTemplates(emailTemplatesData.templates);

      if (!blockRoom && roomsData.items[0]?.slug) {
        setBlockRoom(roomsData.items[0].slug);
      }

      if (!calendarRoom && roomsData.items[0]?.slug) {
        setCalendarRoom(roomsData.items[0].slug);
      }

      return true;
    } catch {
      setMessage("Unable to load admin data.");
      return false;
    }
  }, [blockRoom, calendarRoom]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(calendarMonth);
  }, [calendarMonth]);

  const calendarCells = useMemo(() => {
    const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    const leadingEmpty = start.getDay();

    const cells: Array<{ type: "empty" } | { type: "day"; date: Date }> = [];

    for (let i = 0; i < leadingEmpty; i += 1) {
      cells.push({ type: "empty" });
    }

    for (let day = 1; day <= end.getDate(); day += 1) {
      cells.push({
        type: "day",
        date: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day),
      });
    }

    return cells;
  }, [calendarMonth]);

  const calendarStatusMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const booking of bookings) {
      if (!calendarRoom || booking.room_slug !== calendarRoom) {
        continue;
      }

      const start = new Date(booking.checkin);
      const end = new Date(booking.checkout);
      const cursor = new Date(start);

      while (cursor < end) {
        const key = toDateKey(cursor);
        const existing = map.get(key);

        if (!existing || statusPriority(booking.status) > statusPriority(existing)) {
          map.set(key, booking.status);
        }

        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return map;
  }, [bookings, calendarRoom]);

  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();

    for (const booking of bookings) {
      const email = booking.email?.trim().toLowerCase();
      if (!email) {
        // Admin-created "blocked" entries have no guest — not a customer.
        continue;
      }

      const existing = map.get(email);
      const spend = booking.status === "cancelled" ? 0 : booking.total_amount;

      if (existing) {
        existing.bookings.push(booking);
        existing.totalStays += 1;
        existing.totalSpend += spend;
      } else {
        map.set(email, {
          email: booking.email,
          name: booking.name,
          phone: booking.phone,
          bookings: [booking],
          totalStays: 1,
          totalSpend: spend,
        });
      }
    }

    const list = Array.from(map.values());

    for (const customer of list) {
      customer.bookings.sort((a, b) => (a.checkin < b.checkin ? 1 : -1));
    }

    list.sort((a, b) => (a.bookings[0]!.created_at < b.bookings[0]!.created_at ? 1 : -1));

    if (!customerSearch.trim()) {
      return list;
    }

    const needle = customerSearch.trim().toLowerCase();
    return list.filter(
      (customer) =>
        customer.name.toLowerCase().includes(needle) ||
        customer.email.toLowerCase().includes(needle) ||
        customer.phone.toLowerCase().includes(needle),
    );
  }, [bookings, customerSearch]);

  const todayKey = useMemo(() => toDateKey(new Date()), []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  async function saveRoom(item: RoomItem) {
    const response = await fetch("/api/admin/rooms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      setMessage("Room update failed.");
      return;
    }

    setMessage("Room updated.");
    await fetchData();
  }

  async function createRoom() {
    const nextSortOrder = rooms.length > 0 ? Math.max(...rooms.map((r) => r.sort_order)) + 1 : 1;
    const response = await fetch("/api/admin/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...BLANK_ROOM, slug: `new-room-${Date.now()}`, sort_order: nextSortOrder }),
    });

    if (!response.ok) {
      setMessage("Failed to create room.");
      return;
    }

    setMessage("Room created — fill in the details below and save.");
    await fetchData();
  }

  async function deleteRoom(id: number) {
    if (!window.confirm("Delete this room? This cannot be undone.")) {
      return;
    }

    const response = await fetch("/api/admin/rooms", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      setMessage("Failed to delete room.");
      return;
    }

    setMessage("Room deleted.");
    await fetchData();
  }

  async function saveActivity(item: ActivityItem) {
    const response = await fetch("/api/admin/activities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      setMessage("Activity update failed.");
      return;
    }

    setMessage("Activity updated.");
    await fetchData();
  }

  async function createActivity() {
    const nextSortOrder =
      activities.length > 0 ? Math.max(...activities.map((a) => a.sort_order)) + 1 : 1;
    const response = await fetch("/api/admin/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...BLANK_ACTIVITY, sort_order: nextSortOrder }),
    });

    if (!response.ok) {
      setMessage("Failed to create activity.");
      return;
    }

    setMessage("Activity created — fill in the details below and save.");
    await fetchData();
  }

  async function deleteActivity(id: number) {
    if (!window.confirm("Delete this activity? This cannot be undone.")) {
      return;
    }

    const response = await fetch("/api/admin/activities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      setMessage("Failed to delete activity.");
      return;
    }

    setMessage("Activity deleted.");
    await fetchData();
  }

  async function saveGallery(item: GalleryItem) {
    const response = await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      setMessage("Gallery update failed.");
      return;
    }

    setMessage("Gallery item updated.");
    await fetchData();
  }

  async function createGalleryItem() {
    const nextSortOrder = gallery.length > 0 ? Math.max(...gallery.map((g) => g.sort_order)) + 1 : 1;
    const response = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...BLANK_GALLERY, sort_order: nextSortOrder }),
    });

    if (!response.ok) {
      setMessage("Failed to create gallery item.");
      return;
    }

    setMessage("Gallery item created — fill in the details below and save.");
    await fetchData();
  }

  async function deleteGalleryItem(id: number) {
    if (!window.confirm("Delete this gallery image? This cannot be undone.")) {
      return;
    }

    const response = await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      setMessage("Failed to delete gallery item.");
      return;
    }

    setMessage("Gallery item deleted.");
    await fetchData();
  }

  async function saveBookingStatus(item: BookingItem, status: string) {
    const response = await fetch("/api/admin/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status }),
    });

    if (!response.ok) {
      setMessage("Booking update failed.");
      return;
    }

    setMessage("Booking status updated.");
    await fetchData();
  }

  async function saveSettings() {
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactPhoneDisplay: settings.contactPhoneDisplay,
        contactWhatsappDisplay: settings.contactWhatsappDisplay,
        contactEmailDisplay: settings.contactEmailDisplay,
        contactAddressDisplay: settings.contactAddressDisplay,
        facebookUrl: settings.facebookUrl,
        instagramUrl: settings.instagramUrl,
      }),
    });

    if (!response.ok) {
      setMessage("Settings update failed.");
      return;
    }

    const data = (await response.json()) as { settings: SettingsItem };
    setSettings(data.settings);
    setMessage("Settings updated.");
  }

  async function saveEmailTemplate(key: EmailTemplateKey) {
    const template = emailTemplates[key];
    const response = await fetch("/api/admin/email-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, ...template }),
    });

    if (!response.ok) {
      setMessage("Email template update failed.");
      return;
    }

    const data = (await response.json()) as { templates: Record<EmailTemplateKey, EmailTemplate> };
    setEmailTemplates(data.templates);
    setMessage("Email template updated.");
  }

  async function createAvailabilityBlock() {
    if (!blockRoom || !blockCheckin || !blockCheckout) {
      setMessage("Please select room, check-in and check-out for blocking.");
      return;
    }

    const response = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomSlug: blockRoom,
        checkin: blockCheckin,
        checkout: blockCheckout,
        note: blockNote,
      }),
    });

    if (!response.ok) {
      setMessage("Failed to create availability block.");
      return;
    }

    setMessage("Availability blocked successfully.");
    setBlockCheckin("");
    setBlockCheckout("");
    setBlockNote("");
    await fetchData();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <section className="mx-auto max-w-[84rem] rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl text-zinc-900">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-zinc-500"
        >
          Logout
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["rooms", "activities", "gallery", "bookings", "customers", "settings"] as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold",
              tab === key ? "bg-[#c45e2a] text-white" : "border border-zinc-300 text-zinc-700",
            ].join(" ")}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {message ? <p className="mt-4 text-sm font-medium text-[#9e3e12]">{message}</p> : null}

      {tab === "rooms" ? (
        <div className="mt-6 grid gap-4">
          <button
            onClick={createRoom}
            className="w-fit rounded-xl border border-dashed border-[#c45e2a] px-4 py-2 text-sm font-bold text-[#9e3e12] hover:bg-orange-50"
          >
            + Add New Room
          </button>

          {rooms.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Name
                  <input
                    value={item.name}
                    onChange={(event) =>
                      setRooms((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, name: event.target.value } : entry,
                        ),
                      )
                    }
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Slug (used in booking links)
                  <input
                    value={item.slug}
                    onChange={(event) =>
                      setRooms((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, slug: event.target.value } : entry,
                        ),
                      )
                    }
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Price per night (INR)
                  <input
                    value={item.price_per_night}
                    onChange={(event) =>
                      setRooms((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, price_per_night: Number(event.target.value) || 0 }
                            : entry,
                        ),
                      )
                    }
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    type="number"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Image URL
                  <input
                    value={item.image_url}
                    onChange={(event) =>
                      setRooms((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, image_url: event.target.value } : entry,
                        ),
                      )
                    }
                    placeholder="/images/1.jpeg"
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Capacity
                  <input
                    value={item.capacity}
                    onChange={(event) =>
                      setRooms((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, capacity: event.target.value } : entry,
                        ),
                      )
                    }
                    placeholder="2 Guests"
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Bed
                  <input
                    value={item.bed}
                    onChange={(event) =>
                      setRooms((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, bed: event.target.value } : entry,
                        ),
                      )
                    }
                    placeholder="King Bed"
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  View label
                  <input
                    value={item.view_label}
                    onChange={(event) =>
                      setRooms((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, view_label: event.target.value } : entry,
                        ),
                      )
                    }
                    placeholder="Mountain View"
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Sort order
                  <input
                    value={item.sort_order}
                    onChange={(event) =>
                      setRooms((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, sort_order: Number(event.target.value) || 0 }
                            : entry,
                        ),
                      )
                    }
                    type="number"
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
              </div>

              <label className="mt-3 grid gap-1 text-xs font-semibold text-zinc-600">
                Description
                <textarea
                  value={item.description}
                  onChange={(event) =>
                    setRooms((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, description: event.target.value } : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  rows={3}
                />
              </label>

              <label className="mt-3 grid gap-1 text-xs font-semibold text-zinc-600">
                Amenities (one per line)
                <textarea
                  value={item.amenities.join("\n")}
                  onChange={(event) =>
                    setRooms((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, amenities: event.target.value.split("\n") }
                          : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  rows={4}
                />
              </label>

              <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-zinc-600">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(event) =>
                    setRooms((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, is_active: event.target.checked } : entry,
                      ),
                    )
                  }
                />
                Active (visible on the public site)
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => saveRoom(item)}
                  className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
                >
                  Save Room
                </button>
                <button
                  onClick={() => deleteRoom(item.id)}
                  className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
                >
                  Delete Room
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {tab === "activities" ? (
        <div className="mt-6 grid gap-4">
          <button
            onClick={createActivity}
            className="w-fit rounded-xl border border-dashed border-[#c45e2a] px-4 py-2 text-sm font-bold text-[#9e3e12] hover:bg-orange-50"
          >
            + Add New Activity
          </button>

          {activities.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Title
                  <input
                    value={item.title}
                    onChange={(event) =>
                      setActivities((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, title: event.target.value } : entry,
                        ),
                      )
                    }
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Category
                  <select
                    value={item.category}
                    onChange={(event) =>
                      setActivities((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, category: event.target.value } : entry,
                        ),
                      )
                    }
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  >
                    <option value="on_property">On Property</option>
                    <option value="local_attraction">Local Attraction</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Duration label
                  <input
                    value={item.duration_label ?? ""}
                    onChange={(event) =>
                      setActivities((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, duration_label: event.target.value || null }
                            : entry,
                        ),
                      )
                    }
                    placeholder="1-2 hours"
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Price label
                  <input
                    value={item.price_label ?? ""}
                    onChange={(event) =>
                      setActivities((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, price_label: event.target.value || null }
                            : entry,
                        ),
                      )
                    }
                    placeholder="Complimentary"
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Distance label
                  <input
                    value={item.distance_label ?? ""}
                    onChange={(event) =>
                      setActivities((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, distance_label: event.target.value || null }
                            : entry,
                        ),
                      )
                    }
                    placeholder="20 minutes away"
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                  Sort order
                  <input
                    value={item.sort_order}
                    onChange={(event) =>
                      setActivities((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, sort_order: Number(event.target.value) || 0 }
                            : entry,
                        ),
                      )
                    }
                    type="number"
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>
              </div>

              <label className="mt-3 grid gap-1 text-xs font-semibold text-zinc-600">
                Description
                <textarea
                  value={item.description}
                  onChange={(event) =>
                    setActivities((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, description: event.target.value } : entry,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  rows={3}
                />
              </label>

              <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-zinc-600">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(event) =>
                    setActivities((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, is_active: event.target.checked } : entry,
                      ),
                    )
                  }
                />
                Active (visible on the public site)
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => saveActivity(item)}
                  className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
                >
                  Save Activity
                </button>
                <button
                  onClick={() => deleteActivity(item.id)}
                  className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
                >
                  Delete Activity
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {tab === "gallery" ? (
        <div className="mt-6 grid gap-4">
          <button
            onClick={createGalleryItem}
            className="w-fit rounded-xl border border-dashed border-[#c45e2a] px-4 py-2 text-sm font-bold text-[#9e3e12] hover:bg-orange-50"
          >
            + Add New Image
          </button>

          {gallery.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 p-4">
              <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                Image URL
                <input
                  value={item.image_url}
                  onChange={(event) =>
                    setGallery((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, image_url: event.target.value } : entry,
                      ),
                    )
                  }
                  placeholder="/images/1.jpeg"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                />
              </label>
              <label className="mt-3 grid gap-1 text-xs font-semibold text-zinc-600">
                Alt text
                <input
                  value={item.alt_text}
                  onChange={(event) =>
                    setGallery((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, alt_text: event.target.value } : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                />
              </label>
              <label className="mt-3 grid w-32 gap-1 text-xs font-semibold text-zinc-600">
                Sort order
                <input
                  value={item.sort_order}
                  onChange={(event) =>
                    setGallery((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, sort_order: Number(event.target.value) || 0 }
                          : entry,
                      ),
                    )
                  }
                  type="number"
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                />
              </label>

              <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-zinc-600">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(event) =>
                    setGallery((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, is_active: event.target.checked } : entry,
                      ),
                    )
                  }
                />
                Active (visible on the public site)
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => saveGallery(item)}
                  className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
                >
                  Save Image
                </button>
                <button
                  onClick={() => deleteGalleryItem(item.id)}
                  className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
                >
                  Delete Image
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {tab === "bookings" ? (
        <div className="mt-6 grid gap-6">
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900">Availability Calendar</h2>
              <select
                value={calendarRoom}
                onChange={(event) => setCalendarRoom(event.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.slug}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                  )
                }
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm font-semibold"
              >
                Prev
              </button>
              <p className="text-sm font-semibold text-zinc-800">{monthLabel}</p>
              <button
                onClick={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                  )
                }
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm font-semibold"
              >
                Next
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs">
              {dayHeaders.map((day) => (
                <div key={day} className="rounded-lg bg-zinc-200 py-1 font-semibold text-zinc-700">
                  {day}
                </div>
              ))}

              {calendarCells.map((cell, index) => {
                if (cell.type === "empty") {
                  return <div key={`empty-${index}`} className="aspect-square rounded-lg bg-zinc-100" />;
                }

                const key = toDateKey(cell.date);
                const status = calendarStatusMap.get(key);

                return (
                  <div
                    key={key}
                    className={[
                      "aspect-square rounded-lg border text-sm font-semibold grid place-items-center",
                      dayCellClass(status),
                    ].join(" ")}
                    title={status ? `Status: ${status}` : "Available"}
                  >
                    {cell.date.getDate()}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white px-3 py-1 border border-zinc-200">Available</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 border border-amber-200 text-amber-700">New</span>
              <span className="rounded-full bg-orange-100 px-3 py-1 border border-orange-200 text-[#9e3e12]">Confirmed</span>
              <span className="rounded-full bg-rose-100 px-3 py-1 border border-rose-300 text-rose-700">Blocked</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 border border-zinc-200 text-zinc-600">Cancelled</span>
            </div>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <h2 className="text-lg font-semibold text-[#9e3e12]">Block Availability</h2>
            <p className="mt-1 text-sm text-[#9e3e12]">
              Create an internal blocked slot for maintenance, events, or owner use.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                value={blockRoom}
                onChange={(event) => setBlockRoom(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.slug}>
                    {room.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={blockCheckin}
                onChange={(event) => setBlockCheckin(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2"
              />
              <input
                type="date"
                value={blockCheckout}
                onChange={(event) => setBlockCheckout(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2"
              />
              <button
                onClick={createAvailabilityBlock}
                className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
              >
                Block Dates
              </button>
            </div>
            <input
              value={blockNote}
              onChange={(event) => setBlockNote(event.target.value)}
              placeholder="Optional note"
              className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </article>

          <div className="grid gap-4">
            {bookings.map((item) => (
              <article key={item.id} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {item.room_slug} | {item.checkin} to {item.checkout}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {item.name} ({item.email}) | Guests: {item.guests} | Total: INR {item.total_amount}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">Ref: {item.trace_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={["rounded-full px-2 py-1 text-xs font-semibold", statusPillClass(item.status)].join(" ")}>
                      {item.status}
                    </span>
                    <select
                      value={item.status}
                      onChange={(event) => saveBookingStatus(item, event.target.value)}
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                    >
                      <option value="new">new</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                      <option value="blocked">blocked</option>
                    </select>
                  </div>
                </div>
                {item.requests ? <p className="mt-2 text-xs text-zinc-700">Note: {item.requests}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "customers" ? (
        <div className="mt-6 grid gap-4">
          <input
            value={customerSearch}
            onChange={(event) => setCustomerSearch(event.target.value)}
            placeholder="Search by name, email, or phone"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 sm:max-w-sm"
          />

          {customers.length === 0 ? (
            <p className="text-sm text-zinc-600">
              {customerSearch ? "No customers match that search." : "No guest bookings yet."}
            </p>
          ) : null}

          <div className="grid gap-4">
            {customers.map((customer) => (
              <article key={customer.email} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-zinc-900">{customer.name}</p>
                    <p className="text-sm text-zinc-600">
                      {customer.email} {customer.phone ? `| ${customer.phone}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-sm text-zinc-700">
                    <p className="font-semibold">
                      {customer.totalStays} {customer.totalStays === 1 ? "stay" : "stays"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Lifetime total: INR {customer.totalSpend.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  {customer.bookings.map((booking) => {
                    const stay = classifyStay(booking, todayKey);
                    return (
                      <div
                        key={booking.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-700"
                      >
                        <span>
                          {booking.room_slug} | {booking.checkin} to {booking.checkout} | INR{" "}
                          {booking.total_amount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className={["rounded-full px-2 py-1 font-semibold capitalize", stayPillClass(stay)].join(" ")}>
                            {stay}
                          </span>
                          <span className={["rounded-full px-2 py-1 font-semibold", statusPillClass(booking.status)].join(" ")}>
                            {booking.status}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "settings" ? (
        <div className="mt-6 grid gap-4">
          <article className="rounded-2xl border border-zinc-200 p-4">
            <h2 className="text-lg font-semibold text-zinc-900">Site Settings</h2>
            <p className="mt-1 text-sm text-zinc-600">Update public contact details and social links used across the site.</p>
            <label className="mt-4 grid gap-2 text-sm font-semibold text-zinc-800">
              Contact Phone Number
              <input
                value={settings.contactPhoneDisplay}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactPhoneDisplay: event.target.value,
                  }))
                }
                className="rounded-xl border border-zinc-300 px-3 py-2"
                placeholder="+1-949-282-8611"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold text-zinc-800">
              WhatsApp Number
              <input
                value={settings.contactWhatsappDisplay}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactWhatsappDisplay: event.target.value,
                  }))
                }
                className="rounded-xl border border-zinc-300 px-3 py-2"
                placeholder="+1-949-282-8611"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold text-zinc-800">
              Contact Email
              <input
                value={settings.contactEmailDisplay}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactEmailDisplay: event.target.value,
                  }))
                }
                className="rounded-xl border border-zinc-300 px-3 py-2"
                placeholder="info@thehillsideoasis.com"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold text-zinc-800">
              Address
              <textarea
                value={settings.contactAddressDisplay}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    contactAddressDisplay: event.target.value,
                  }))
                }
                className="rounded-xl border border-zinc-300 px-3 py-2"
                rows={3}
                placeholder="Arthanaripalayam, Pollachi, Tamil Nadu 642007"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold text-zinc-800">
              Facebook URL
              <input
                value={settings.facebookUrl}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    facebookUrl: event.target.value,
                  }))
                }
                className="rounded-xl border border-zinc-300 px-3 py-2"
                placeholder="https://facebook.com/thehillsideoasis"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold text-zinc-800">
              Instagram URL
              <input
                value={settings.instagramUrl}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    instagramUrl: event.target.value,
                  }))
                }
                className="rounded-xl border border-zinc-300 px-3 py-2"
                placeholder="https://instagram.com/thehillsideoasis"
              />
            </label>

            <div className="mt-4 grid gap-2 text-sm text-zinc-600">
              <p>Phone link: {settings.contactPhoneHref || "Will be generated after save"}</p>
              <p>WhatsApp link: {settings.contactWhatsappHref || "Will be generated after save"}</p>
              <p>Email link: {settings.contactEmailHref || "Will be generated after save"}</p>
            </div>

            <button
              onClick={saveSettings}
              className="mt-4 rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
            >
              Save Settings
            </button>
          </article>

          <article className="rounded-2xl border border-zinc-200 p-4">
            <h2 className="text-lg font-semibold text-zinc-900">Email Templates</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Customize the emails guests receive. Available placeholders:{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
                {"{{guestName}} {{roomName}} {{checkin}} {{checkout}} {{guests}} {{totalAmount}} {{traceId}} {{requests}}"}
              </code>
            </p>

            <div className="mt-4 grid gap-4">
              {EMAIL_TEMPLATE_KEYS.map((key) => {
                const template = emailTemplates[key];
                return (
                  <article key={key} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <h3 className="text-sm font-semibold text-zinc-900">{EMAIL_TEMPLATE_LABELS[key]}</h3>

                    <label className="mt-3 grid gap-1 text-xs font-semibold text-zinc-600">
                      Subject
                      <input
                        value={template.subject}
                        onChange={(event) =>
                          setEmailTemplates((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], subject: event.target.value },
                          }))
                        }
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-900"
                      />
                    </label>

                    <label className="mt-3 grid gap-1 text-xs font-semibold text-zinc-600">
                      Heading
                      <input
                        value={template.heading}
                        onChange={(event) =>
                          setEmailTemplates((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], heading: event.target.value },
                          }))
                        }
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-900"
                      />
                    </label>

                    <label className="mt-3 grid gap-1 text-xs font-semibold text-zinc-600">
                      Message
                      <textarea
                        value={template.message}
                        onChange={(event) =>
                          setEmailTemplates((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], message: event.target.value },
                          }))
                        }
                        rows={3}
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-900"
                      />
                    </label>

                    <button
                      onClick={() => saveEmailTemplate(key)}
                      className="mt-3 rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
                    >
                      Save Template
                    </button>
                  </article>
                );
              })}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
