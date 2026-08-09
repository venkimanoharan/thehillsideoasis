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

type RevenueTotals = {
  confirmedRevenue: number;
  pendingRevenue: number;
  totalRevenue: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  totalCount: number;
  averageBookingValue: number;
};

type RevenueByRoom = {
  roomSlug: string;
  roomName: string;
  revenue: number;
  count: number;
};

type RevenueData = {
  range: { start: string; end: string };
  totals: RevenueTotals;
  byRoom: RevenueByRoom[];
  bookings: BookingItem[];
};

type RevenuePreset =
  | "last7"
  | "last30"
  | "last90"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
  | "allTime"
  | "custom";

const REVENUE_PRESET_LABELS: Record<Exclude<RevenuePreset, "custom">, string> = {
  last7: "Last 7 Days",
  last30: "Last 30 Days",
  last90: "Last 90 Days",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  thisYear: "This Year",
  lastYear: "Last Year",
  allTime: "All Time",
};

// Validated categorical order (blue, orange, aqua, yellow, magenta, violet) —
// fixed order, assigned by stable room identity (sort_order), never by revenue
// rank, so a bar's color never shifts when the revenue leaderboard reshuffles.
const ROOM_BAR_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"];

function formatINR(amount: number): string {
  return `INR ${amount.toLocaleString("en-IN")}`;
}

function computePresetRange(preset: RevenuePreset): { start: string; end: string } {
  const now = new Date();
  const todayKey = toDateKey(now);

  if (preset === "last7") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { start: toDateKey(start), end: todayKey };
  }

  if (preset === "last30") {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { start: toDateKey(start), end: todayKey };
  }

  if (preset === "last90") {
    const start = new Date(now);
    start.setDate(start.getDate() - 89);
    return { start: toDateKey(start), end: todayKey };
  }

  if (preset === "thisMonth") {
    // Full calendar month, including future check-ins later this month —
    // not capped at today, so a booking made now for the 25th still counts
    // toward "this month" revenue.
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: toDateKey(start), end: toDateKey(end) };
  }

  if (preset === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: toDateKey(start), end: toDateKey(end) };
  }

  if (preset === "thisYear") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { start: toDateKey(start), end: toDateKey(end) };
  }

  if (preset === "lastYear") {
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31);
    return { start: toDateKey(start), end: toDateKey(end) };
  }

  // allTime
  return { start: "2000-01-01", end: "2100-01-01" };
}

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

type ExpenseItem = {
  id: number;
  date: string;
  category: string;
  amount: number;
  vendor: string | null;
  description: string;
  created_at: string;
};

const EXPENSE_CATEGORIES = [
  "Staff Wages",
  "Utilities",
  "Maintenance & Repairs",
  "Supplies & Groceries",
  "Marketing",
  "Taxes & Fees",
  "Other",
];

type StaffItem = {
  id: number;
  name: string;
  role: string;
  phone: string;
  is_active: boolean;
  created_at: string;
};

const STAFF_ROLES = ["Manager", "Housekeeping", "Cook", "Caretaker", "Security", "Gardener", "Other"];

type ShiftItem = {
  id: number;
  staff_id: number;
  staff_name: string;
  date: string;
  start_time: string;
  end_time: string;
  role: string;
  notes: string;
  status: string;
  created_at: string;
};

const SHIFT_STATUSES = ["scheduled", "completed", "missed"];

function shiftHours(shift: ShiftItem): number {
  const [startH, startM] = shift.start_time.split(":").map(Number);
  const [endH, endM] = shift.end_time.split(":").map(Number);
  if (
    !Number.isFinite(startH) ||
    !Number.isFinite(startM) ||
    !Number.isFinite(endH) ||
    !Number.isFinite(endM)
  ) {
    return 0;
  }

  const startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60; // shift crosses midnight
  }

  return Math.round(((endMinutes - startMinutes) / 60) * 10) / 10;
}

type TabKey =
  | "rooms"
  | "activities"
  | "gallery"
  | "bookings"
  | "customers"
  | "revenue"
  | "expenses"
  | "workers"
  | "settings";

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
  const [revenuePreset, setRevenuePreset] = useState<RevenuePreset>("last30");
  const [revenueCustomStart, setRevenueCustomStart] = useState<string>("");
  const [revenueCustomEnd, setRevenueCustomEnd] = useState<string>("");
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [revenueLoading, setRevenueLoading] = useState<boolean>(false);
  const [revenueExpenseTotal, setRevenueExpenseTotal] = useState<number | null>(null);
  const [expensePreset, setExpensePreset] = useState<RevenuePreset>("last30");
  const [expenseCustomStart, setExpenseCustomStart] = useState<string>("");
  const [expenseCustomEnd, setExpenseCustomEnd] = useState<string>("");
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [expenseTotal, setExpenseTotal] = useState<number>(0);
  const [expenseLoading, setExpenseLoading] = useState<boolean>(false);
  const [newExpenseDate, setNewExpenseDate] = useState<string>(toDateKey(new Date()));
  const [newExpenseCategory, setNewExpenseCategory] = useState<string>(EXPENSE_CATEGORIES[0]!);
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("");
  const [newExpenseVendor, setNewExpenseVendor] = useState<string>("");
  const [newExpenseDescription, setNewExpenseDescription] = useState<string>("");
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [newStaffName, setNewStaffName] = useState<string>("");
  const [newStaffRole, setNewStaffRole] = useState<string>(STAFF_ROLES[0]!);
  const [newStaffPhone, setNewStaffPhone] = useState<string>("");
  const [shiftPreset, setShiftPreset] = useState<RevenuePreset>("last7");
  const [shiftCustomStart, setShiftCustomStart] = useState<string>("");
  const [shiftCustomEnd, setShiftCustomEnd] = useState<string>("");
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [shiftLoading, setShiftLoading] = useState<boolean>(false);
  const [newShiftStaffId, setNewShiftStaffId] = useState<string>("");
  const [newShiftDate, setNewShiftDate] = useState<string>(toDateKey(new Date()));
  const [newShiftStart, setNewShiftStart] = useState<string>("09:00");
  const [newShiftEnd, setNewShiftEnd] = useState<string>("17:00");
  const [newShiftRole, setNewShiftRole] = useState<string>("");
  const [newShiftNotes, setNewShiftNotes] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const [roomsRes, activitiesRes, galleryRes, bookingsRes, settingsRes, emailTemplatesRes, staffRes] =
        await Promise.all([
          fetch("/api/admin/rooms", { cache: "no-store" }),
          fetch("/api/admin/activities", { cache: "no-store" }),
          fetch("/api/admin/gallery", { cache: "no-store" }),
          fetch("/api/admin/bookings", { cache: "no-store" }),
          fetch("/api/admin/settings", { cache: "no-store" }),
          fetch("/api/admin/email-templates", { cache: "no-store" }),
          fetch("/api/admin/staff", { cache: "no-store" }),
        ]);

      if (
        !roomsRes.ok ||
        !activitiesRes.ok ||
        !galleryRes.ok ||
        !bookingsRes.ok ||
        !settingsRes.ok ||
        !emailTemplatesRes.ok ||
        !staffRes.ok
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
      const staffData = (await staffRes.json()) as { items: StaffItem[] };

      setRooms(roomsData.items);
      setActivities(activitiesData.items);
      setGallery(galleryData.items);
      setBookings(bookingsData.items);
      setSettings(settingsData.settings);
      setEmailTemplates(emailTemplatesData.templates);
      setStaff(staffData.items);

      if (!newShiftStaffId && staffData.items[0]?.id) {
        setNewShiftStaffId(String(staffData.items[0].id));
      }

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
  }, [blockRoom, calendarRoom, newShiftStaffId]);

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

  // Stable per-room color, assigned by the room's fixed sort order — never by
  // its rank in the current period's revenue breakdown, so a bar's color
  // never shifts when the revenue leaderboard reshuffles between periods.
  const roomColorMap = useMemo(() => {
    const map = new Map<string, string>();
    rooms.forEach((room, index) => {
      map.set(room.slug, ROOM_BAR_COLORS[index % ROOM_BAR_COLORS.length]!);
    });
    return map;
  }, [rooms]);

  const revenueRange = useMemo(() => {
    if (revenuePreset === "custom") {
      return { start: revenueCustomStart, end: revenueCustomEnd };
    }
    return computePresetRange(revenuePreset);
  }, [revenuePreset, revenueCustomStart, revenueCustomEnd]);

  const fetchRevenue = useCallback(async () => {
    if (!revenueRange.start || !revenueRange.end) {
      return;
    }

    setRevenueLoading(true);
    try {
      const [revenueRes, expensesRes] = await Promise.all([
        fetch(`/api/admin/revenue?start=${revenueRange.start}&end=${revenueRange.end}`, {
          cache: "no-store",
        }),
        fetch(`/api/admin/expenses?start=${revenueRange.start}&end=${revenueRange.end}`, {
          cache: "no-store",
        }),
      ]);

      if (!revenueRes.ok) {
        setMessage("Unable to load revenue data.");
        return;
      }

      const data = (await revenueRes.json()) as RevenueData & { ok: boolean };
      setRevenueData(data);

      if (expensesRes.ok) {
        const expensesData = (await expensesRes.json()) as { total: number };
        setRevenueExpenseTotal(expensesData.total);
      } else {
        setRevenueExpenseTotal(null);
      }
    } catch {
      setMessage("Unable to load revenue data.");
    } finally {
      setRevenueLoading(false);
    }
  }, [revenueRange]);

  const expenseRange = useMemo(() => {
    if (expensePreset === "custom") {
      return { start: expenseCustomStart, end: expenseCustomEnd };
    }
    return computePresetRange(expensePreset);
  }, [expensePreset, expenseCustomStart, expenseCustomEnd]);

  const fetchExpenses = useCallback(async () => {
    if (!expenseRange.start || !expenseRange.end) {
      return;
    }

    setExpenseLoading(true);
    try {
      const response = await fetch(
        `/api/admin/expenses?start=${expenseRange.start}&end=${expenseRange.end}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        setMessage("Unable to load expenses.");
        return;
      }

      const data = (await response.json()) as { total: number; items: ExpenseItem[] };
      setExpenses(data.items);
      setExpenseTotal(data.total);
    } catch {
      setMessage("Unable to load expenses.");
    } finally {
      setExpenseLoading(false);
    }
  }, [expenseRange]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (tab === "revenue") {
      void fetchRevenue();
    }
  }, [tab, fetchRevenue]);

  useEffect(() => {
    if (tab === "expenses") {
      void fetchExpenses();
    }
  }, [tab, fetchExpenses]);

  const shiftRange = useMemo(() => {
    if (shiftPreset === "custom") {
      return { start: shiftCustomStart, end: shiftCustomEnd };
    }
    return computePresetRange(shiftPreset);
  }, [shiftPreset, shiftCustomStart, shiftCustomEnd]);

  const fetchShifts = useCallback(async () => {
    if (!shiftRange.start || !shiftRange.end) {
      return;
    }

    setShiftLoading(true);
    try {
      const response = await fetch(`/api/admin/shifts?start=${shiftRange.start}&end=${shiftRange.end}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        setMessage("Unable to load shifts.");
        return;
      }

      const data = (await response.json()) as { items: ShiftItem[] };
      setShifts(data.items);
    } catch {
      setMessage("Unable to load shifts.");
    } finally {
      setShiftLoading(false);
    }
  }, [shiftRange]);

  useEffect(() => {
    if (tab === "workers") {
      void fetchShifts();
    }
  }, [tab, fetchShifts]);

  const shiftHoursByStaff = useMemo(() => {
    const map = new Map<string, number>();
    for (const shift of shifts) {
      map.set(shift.staff_name, (map.get(shift.staff_name) ?? 0) + shiftHours(shift));
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [shifts]);

  function exportRevenueCsv() {
    if (!revenueData) {
      return;
    }

    const rows: string[][] = [
      ["Booking ID", "Reference", "Room", "Check-in", "Check-out", "Guests", "Total (INR)", "Status", "Guest Name", "Email", "Phone", "Created At"],
      ...revenueData.bookings.map((booking) => [
        String(booking.id),
        booking.trace_id,
        booking.room_slug,
        booking.checkin,
        booking.checkout,
        String(booking.guests),
        String(booking.total_amount),
        booking.status,
        booking.name,
        booking.email,
        booking.phone,
        booking.created_at,
      ]),
    ];

    downloadCsv(`revenue-${revenueRange.start}-to-${revenueRange.end}.csv`, rows);
  }

  async function createExpense() {
    const amount = Number(newExpenseAmount);
    if (!newExpenseDate || !newExpenseCategory || !Number.isFinite(amount) || amount <= 0) {
      setMessage("Date, category, and a positive amount are required.");
      return;
    }

    const response = await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: newExpenseDate,
        category: newExpenseCategory,
        amount,
        vendor: newExpenseVendor,
        description: newExpenseDescription,
      }),
    });

    if (!response.ok) {
      setMessage("Failed to add expense.");
      return;
    }

    setMessage("Expense added.");
    setNewExpenseAmount("");
    setNewExpenseVendor("");
    setNewExpenseDescription("");
    await fetchExpenses();
  }

  async function saveExpense(item: ExpenseItem) {
    const response = await fetch("/api/admin/expenses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      setMessage("Expense update failed.");
      return;
    }

    setMessage("Expense updated.");
    await fetchExpenses();
  }

  async function deleteExpense(id: number) {
    if (!window.confirm("Delete this expense? This cannot be undone.")) {
      return;
    }

    const response = await fetch("/api/admin/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      setMessage("Failed to delete expense.");
      return;
    }

    setMessage("Expense deleted.");
    await fetchExpenses();
  }

  function exportExpensesCsv() {
    if (expenses.length === 0) {
      return;
    }

    const rows: string[][] = [
      ["Date", "Category", "Amount (INR)", "Vendor", "Description"],
      ...expenses.map((expense) => [
        expense.date,
        expense.category,
        String(expense.amount),
        expense.vendor ?? "",
        expense.description,
      ]),
    ];

    downloadCsv(`expenses-${expenseRange.start}-to-${expenseRange.end}.csv`, rows);
  }

  async function createStaff() {
    if (!newStaffName.trim()) {
      setMessage("Staff name is required.");
      return;
    }

    const response = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStaffName, role: newStaffRole, phone: newStaffPhone }),
    });

    if (!response.ok) {
      setMessage("Failed to add staff member.");
      return;
    }

    setMessage("Staff member added.");
    setNewStaffName("");
    setNewStaffPhone("");
    await fetchData();
  }

  async function saveStaff(item: StaffItem) {
    const response = await fetch("/api/admin/staff", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      setMessage("Staff update failed.");
      return;
    }

    setMessage("Staff member updated.");
    await fetchData();
  }

  async function deleteStaff(id: number) {
    if (!window.confirm("Remove this staff member? Past shifts keep their record; this only removes them from the roster.")) {
      return;
    }

    const response = await fetch("/api/admin/staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      setMessage("Failed to remove staff member.");
      return;
    }

    setMessage("Staff member removed.");
    await fetchData();
  }

  async function createShift() {
    const staffId = Number(newShiftStaffId);
    const staffMember = staff.find((entry) => entry.id === staffId);

    if (!staffMember || !newShiftDate || !newShiftStart || !newShiftEnd) {
      setMessage("Staff member, date, start time, and end time are required.");
      return;
    }

    const response = await fetch("/api/admin/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staff_id: staffId,
        staff_name: staffMember.name,
        date: newShiftDate,
        start_time: newShiftStart,
        end_time: newShiftEnd,
        role: newShiftRole || staffMember.role,
        notes: newShiftNotes,
        status: "scheduled",
      }),
    });

    if (!response.ok) {
      setMessage("Failed to add shift.");
      return;
    }

    setMessage("Shift added.");
    setNewShiftRole("");
    setNewShiftNotes("");
    await fetchShifts();
  }

  async function saveShift(item: ShiftItem) {
    const response = await fetch("/api/admin/shifts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      setMessage("Shift update failed.");
      return;
    }

    setMessage("Shift updated.");
    await fetchShifts();
  }

  async function deleteShift(id: number) {
    if (!window.confirm("Delete this shift? This cannot be undone.")) {
      return;
    }

    const response = await fetch("/api/admin/shifts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      setMessage("Failed to delete shift.");
      return;
    }

    setMessage("Shift deleted.");
    await fetchShifts();
  }

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
        {(["rooms", "activities", "gallery", "bookings", "customers", "revenue", "expenses", "workers", "settings"] as TabKey[]).map((key) => (
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

      {tab === "revenue" ? (
        <div className="mt-6 grid gap-6">
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900">Revenue</h2>
              <button
                onClick={exportRevenueCsv}
                disabled={!revenueData || revenueData.bookings.length === 0}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-700 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export CSV
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(REVENUE_PRESET_LABELS) as Array<Exclude<RevenuePreset, "custom">>).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setRevenuePreset(preset)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold",
                    revenuePreset === preset
                      ? "bg-[#c45e2a] text-white"
                      : "border border-zinc-300 bg-white text-zinc-700",
                  ].join(" ")}
                >
                  {REVENUE_PRESET_LABELS[preset]}
                </button>
              ))}
              <button
                onClick={() => setRevenuePreset("custom")}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  revenuePreset === "custom"
                    ? "bg-[#c45e2a] text-white"
                    : "border border-zinc-300 bg-white text-zinc-700",
                ].join(" ")}
              >
                Custom Range
              </button>
            </div>

            {revenuePreset === "custom" ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  type="date"
                  value={revenueCustomStart}
                  onChange={(event) => setRevenueCustomStart(event.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={revenueCustomEnd}
                  onChange={(event) => setRevenueCustomEnd(event.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">
                {revenueRange.start} to {revenueRange.end}
              </p>
            )}
          </article>

          {revenueLoading ? <p className="text-sm text-zinc-600">Loading revenue…</p> : null}

          {revenueData && !revenueLoading ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <article className="rounded-2xl border border-zinc-200 p-4">
                  <p className="text-xs font-semibold text-zinc-500">Total revenue</p>
                  <p className="mt-1 text-2xl font-semibold text-[#9e3e12]">
                    {formatINR(revenueData.totals.totalRevenue)}
                  </p>
                </article>
                <article className="rounded-2xl border border-zinc-200 p-4">
                  <p className="text-xs font-semibold text-zinc-500">Confirmed revenue</p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900">
                    {formatINR(revenueData.totals.confirmedRevenue)}
                  </p>
                </article>
                <article className="rounded-2xl border border-zinc-200 p-4">
                  <p className="text-xs font-semibold text-zinc-500">Pending revenue</p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900">
                    {formatINR(revenueData.totals.pendingRevenue)}
                  </p>
                </article>
                <article className="rounded-2xl border border-zinc-200 p-4">
                  <p className="text-xs font-semibold text-zinc-500">Bookings</p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900">{revenueData.totals.totalCount}</p>
                  <p className="text-xs text-zinc-500">{revenueData.totals.cancelledCount} cancelled (excluded)</p>
                </article>
                <article className="rounded-2xl border border-zinc-200 p-4">
                  <p className="text-xs font-semibold text-zinc-500">Average booking value</p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900">
                    {formatINR(revenueData.totals.averageBookingValue)}
                  </p>
                </article>
                {revenueExpenseTotal !== null ? (
                  <article className="rounded-2xl border border-zinc-200 p-4">
                    <p className="text-xs font-semibold text-zinc-500">
                      Net (revenue − {formatINR(revenueExpenseTotal)} expenses)
                    </p>
                    <p
                      className={[
                        "mt-1 text-2xl font-semibold",
                        revenueData.totals.totalRevenue - revenueExpenseTotal >= 0
                          ? "text-zinc-900"
                          : "text-rose-700",
                      ].join(" ")}
                    >
                      {formatINR(revenueData.totals.totalRevenue - revenueExpenseTotal)}
                    </p>
                  </article>
                ) : null}
              </div>

              <article className="rounded-2xl border border-zinc-200 p-4">
                <h3 className="text-sm font-semibold text-zinc-900">Revenue by room</h3>
                {revenueData.byRoom.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600">No bookings in this range.</p>
                ) : (
                  <div className="mt-3 grid gap-2">
                    {revenueData.byRoom.map((room) => {
                      const share =
                        revenueData.totals.totalRevenue > 0
                          ? (room.revenue / revenueData.totals.totalRevenue) * 100
                          : 0;
                      const color = roomColorMap.get(room.roomSlug) ?? ROOM_BAR_COLORS[0]!;
                      return (
                        <div key={room.roomSlug}>
                          <div className="flex items-center justify-between text-xs text-zinc-700">
                            <span className="font-semibold">{room.roomName}</span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>
                              {formatINR(room.revenue)} · {room.count} {room.count === 1 ? "booking" : "bookings"}
                            </span>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-zinc-100">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${Math.max(share, 2)}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>

              <article className="rounded-2xl border border-zinc-200 p-4">
                <h3 className="text-sm font-semibold text-zinc-900">Bookings in this range</h3>
                {revenueData.bookings.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600">No bookings in this range.</p>
                ) : (
                  <div className="mt-3 grid gap-2">
                    {revenueData.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-700"
                      >
                        <span>
                          {booking.checkin} to {booking.checkout} | {booking.room_slug} | {booking.name}
                        </span>
                        <span className="flex items-center gap-2">
                          <span style={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatINR(booking.total_amount)}
                          </span>
                          <span className={["rounded-full px-2 py-1 font-semibold", statusPillClass(booking.status)].join(" ")}>
                            {booking.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </>
          ) : null}
        </div>
      ) : null}

      {tab === "expenses" ? (
        <div className="mt-6 grid gap-6">
          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <h2 className="text-lg font-semibold text-[#9e3e12]">Add Expense</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                type="date"
                value={newExpenseDate}
                onChange={(event) => setNewExpenseDate(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
              <select
                value={newExpenseCategory}
                onChange={(event) => setNewExpenseCategory(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={newExpenseAmount}
                onChange={(event) => setNewExpenseAmount(event.target.value)}
                placeholder="Amount (INR)"
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                value={newExpenseVendor}
                onChange={(event) => setNewExpenseVendor(event.target.value)}
                placeholder="Vendor (optional)"
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                onClick={createExpense}
                className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
              >
                Add Expense
              </button>
            </div>
            <input
              value={newExpenseDescription}
              onChange={(event) => setNewExpenseDescription(event.target.value)}
              placeholder="Description (optional)"
              className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            />
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900">Expenses</h2>
              <button
                onClick={exportExpensesCsv}
                disabled={expenses.length === 0}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-700 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export CSV
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(REVENUE_PRESET_LABELS) as Array<Exclude<RevenuePreset, "custom">>).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setExpensePreset(preset)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold",
                    expensePreset === preset
                      ? "bg-[#c45e2a] text-white"
                      : "border border-zinc-300 bg-white text-zinc-700",
                  ].join(" ")}
                >
                  {REVENUE_PRESET_LABELS[preset]}
                </button>
              ))}
              <button
                onClick={() => setExpensePreset("custom")}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  expensePreset === "custom"
                    ? "bg-[#c45e2a] text-white"
                    : "border border-zinc-300 bg-white text-zinc-700",
                ].join(" ")}
              >
                Custom Range
              </button>
            </div>

            {expensePreset === "custom" ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  type="date"
                  value={expenseCustomStart}
                  onChange={(event) => setExpenseCustomStart(event.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={expenseCustomEnd}
                  onChange={(event) => setExpenseCustomEnd(event.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">
                {expenseRange.start} to {expenseRange.end}
              </p>
            )}

            <p className="mt-4 text-2xl font-semibold text-[#9e3e12]">{formatINR(expenseTotal)}</p>
            <p className="text-xs text-zinc-500">Total for this range</p>
          </article>

          {expenseLoading ? <p className="text-sm text-zinc-600">Loading expenses…</p> : null}

          {!expenseLoading && expenses.length === 0 ? (
            <p className="text-sm text-zinc-600">No expenses logged in this range.</p>
          ) : null}

          <div className="grid gap-4">
            {expenses.map((expense) => (
              <article key={expense.id} className="rounded-2xl border border-zinc-200 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Date
                    <input
                      type="date"
                      value={expense.date}
                      onChange={(event) =>
                        setExpenses((prev) =>
                          prev.map((entry) =>
                            entry.id === expense.id ? { ...entry, date: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Category
                    <select
                      value={expense.category}
                      onChange={(event) =>
                        setExpenses((prev) =>
                          prev.map((entry) =>
                            entry.id === expense.id ? { ...entry, category: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    >
                      {EXPENSE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Amount (INR)
                    <input
                      type="number"
                      min={0}
                      value={expense.amount}
                      onChange={(event) =>
                        setExpenses((prev) =>
                          prev.map((entry) =>
                            entry.id === expense.id
                              ? { ...entry, amount: Number(event.target.value) || 0 }
                              : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Vendor
                    <input
                      value={expense.vendor ?? ""}
                      onChange={(event) =>
                        setExpenses((prev) =>
                          prev.map((entry) =>
                            entry.id === expense.id ? { ...entry, vendor: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    />
                  </label>
                </div>

                <label className="mt-3 grid gap-1 text-xs font-semibold text-zinc-600">
                  Description
                  <input
                    value={expense.description}
                    onChange={(event) =>
                      setExpenses((prev) =>
                        prev.map((entry) =>
                          entry.id === expense.id ? { ...entry, description: event.target.value } : entry,
                        ),
                      )
                    }
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                  />
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => saveExpense(expense)}
                    className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "workers" ? (
        <div className="mt-6 grid gap-6">
          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <h2 className="text-lg font-semibold text-[#9e3e12]">Add Staff Member</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                value={newStaffName}
                onChange={(event) => setNewStaffName(event.target.value)}
                placeholder="Name"
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
              <select
                value={newStaffRole}
                onChange={(event) => setNewStaffRole(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <input
                value={newStaffPhone}
                onChange={(event) => setNewStaffPhone(event.target.value)}
                placeholder="Phone (optional)"
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                onClick={createStaff}
                className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
              >
                Add Staff Member
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 p-4">
            <h2 className="text-lg font-semibold text-zinc-900">Staff Roster</h2>
            {staff.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-600">No staff added yet.</p>
            ) : (
              <div className="mt-3 grid gap-3">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="grid gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-center"
                  >
                    <input
                      value={member.name}
                      onChange={(event) =>
                        setStaff((prev) =>
                          prev.map((entry) =>
                            entry.id === member.id ? { ...entry, name: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                    />
                    <select
                      value={member.role}
                      onChange={(event) =>
                        setStaff((prev) =>
                          prev.map((entry) =>
                            entry.id === member.id ? { ...entry, role: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                    >
                      {STAFF_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <input
                      value={member.phone}
                      onChange={(event) =>
                        setStaff((prev) =>
                          prev.map((entry) =>
                            entry.id === member.id ? { ...entry, phone: event.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Phone"
                      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                    />
                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                      <input
                        type="checkbox"
                        checked={member.is_active}
                        onChange={(event) =>
                          setStaff((prev) =>
                            prev.map((entry) =>
                              entry.id === member.id ? { ...entry, is_active: event.target.checked } : entry,
                            ),
                          )
                        }
                      />
                      Active
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => saveStaff(member)}
                        className="rounded-xl bg-[#c45e2a] px-3 py-2 text-xs font-bold text-white hover:bg-[#9e3e12]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => deleteStaff(member.id)}
                        className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <h2 className="text-lg font-semibold text-[#9e3e12]">Log a Shift</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <select
                value={newShiftStaffId}
                onChange={(event) => setNewShiftStaffId(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">Select staff…</option>
                {staff
                  .filter((member) => member.is_active)
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
              </select>
              <input
                type="date"
                value={newShiftDate}
                onChange={(event) => setNewShiftDate(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={newShiftStart}
                onChange={(event) => setNewShiftStart(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={newShiftEnd}
                onChange={(event) => setNewShiftEnd(event.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                onClick={createShift}
                className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
              >
                Add Shift
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                value={newShiftRole}
                onChange={(event) => setNewShiftRole(event.target.value)}
                placeholder="Task/role for this shift (defaults to their role)"
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                value={newShiftNotes}
                onChange={(event) => setNewShiftNotes(event.target.value)}
                placeholder="Notes (optional)"
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="text-lg font-semibold text-zinc-900">Shifts</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(REVENUE_PRESET_LABELS) as Array<Exclude<RevenuePreset, "custom">>).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setShiftPreset(preset)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold",
                    shiftPreset === preset
                      ? "bg-[#c45e2a] text-white"
                      : "border border-zinc-300 bg-white text-zinc-700",
                  ].join(" ")}
                >
                  {REVENUE_PRESET_LABELS[preset]}
                </button>
              ))}
              <button
                onClick={() => setShiftPreset("custom")}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  shiftPreset === "custom"
                    ? "bg-[#c45e2a] text-white"
                    : "border border-zinc-300 bg-white text-zinc-700",
                ].join(" ")}
              >
                Custom Range
              </button>
            </div>

            {shiftPreset === "custom" ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  type="date"
                  value={shiftCustomStart}
                  onChange={(event) => setShiftCustomStart(event.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={shiftCustomEnd}
                  onChange={(event) => setShiftCustomEnd(event.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">
                {shiftRange.start} to {shiftRange.end}
              </p>
            )}

            {shiftHoursByStaff.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {shiftHoursByStaff.map(([name, hours]) => (
                  <span
                    key={name}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700"
                  >
                    {name}: {hours}h
                  </span>
                ))}
              </div>
            ) : null}
          </article>

          {shiftLoading ? <p className="text-sm text-zinc-600">Loading shifts…</p> : null}

          {!shiftLoading && shifts.length === 0 ? (
            <p className="text-sm text-zinc-600">No shifts logged in this range.</p>
          ) : null}

          <div className="grid gap-4">
            {shifts.map((shift) => (
              <article key={shift.id} className="rounded-2xl border border-zinc-200 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Staff
                    <input value={shift.staff_name} disabled className="rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-normal text-zinc-600" />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Date
                    <input
                      type="date"
                      value={shift.date}
                      onChange={(event) =>
                        setShifts((prev) =>
                          prev.map((entry) =>
                            entry.id === shift.id ? { ...entry, date: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Start
                    <input
                      type="time"
                      value={shift.start_time}
                      onChange={(event) =>
                        setShifts((prev) =>
                          prev.map((entry) =>
                            entry.id === shift.id ? { ...entry, start_time: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    End
                    <input
                      type="time"
                      value={shift.end_time}
                      onChange={(event) =>
                        setShifts((prev) =>
                          prev.map((entry) =>
                            entry.id === shift.id ? { ...entry, end_time: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    />
                  </label>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Task/role
                    <input
                      value={shift.role}
                      onChange={(event) =>
                        setShifts((prev) =>
                          prev.map((entry) =>
                            entry.id === shift.id ? { ...entry, role: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Status
                    <select
                      value={shift.status}
                      onChange={(event) =>
                        setShifts((prev) =>
                          prev.map((entry) =>
                            entry.id === shift.id ? { ...entry, status: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    >
                      {SHIFT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-zinc-600">
                    Notes
                    <input
                      value={shift.notes}
                      onChange={(event) =>
                        setShifts((prev) =>
                          prev.map((entry) =>
                            entry.id === shift.id ? { ...entry, notes: event.target.value } : entry,
                          ),
                        )
                      }
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900"
                    />
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-500">{shiftHours(shift)} hours</span>
                  <button
                    onClick={() => saveShift(shift)}
                    className="rounded-xl bg-[#c45e2a] px-4 py-2 text-sm font-bold text-white hover:bg-[#9e3e12]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => deleteShift(shift.id)}
                    className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
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
