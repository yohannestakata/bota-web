"use client";

import { useState } from "react";

type DayHours = {
  is_closed?: boolean;
  is_24_hours?: boolean;
  open_time?: string;
  close_time?: string;
};

export default function BusinessHoursSection({
  hours,
  setHours,
}: {
  hours: Record<number, DayHours>;
  setHours: (
    updater: (prev: Record<number, DayHours>) => Record<number, DayHours>,
  ) => void;
}) {
  const days = [
    { label: "Sunday", idx: 0 },
    { label: "Monday", idx: 1 },
    { label: "Tuesday", idx: 2 },
    { label: "Wednesday", idx: 3 },
    { label: "Thursday", idx: 4 },
    { label: "Friday", idx: 5 },
    { label: "Saturday", idx: 6 },
  ] as const;
  const [selected, setSelected] = useState<number>(1);
  const v = hours[selected] || {};
  const set = (next: Partial<DayHours>) =>
    setHours((prev) => ({
      ...prev,
      [selected]: { ...(prev[selected] || {}), ...next },
    }));
  return (
    <div className="pb-12">
      <div className="text-foreground text-xl font-bold">
        Business hours (optional)
      </div>
      <div className="mt-6">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            {/* Day */}
            <label className="mb-2 block font-semibold">
              <span className="block font-semibold">Day</span>
              <select
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
                className="border-input bg-background mt-2 w-full border p-3 focus:outline-none"
              >
                {days.map((d) => (
                  <option key={d.idx} value={d.idx}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Closed / Open 24 hours */}
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(v.is_closed)}
                  onChange={(e) =>
                    set({
                      is_closed: e.target.checked || undefined,
                      is_24_hours: e.target.checked ? undefined : v.is_24_hours,
                      open_time: e.target.checked ? undefined : v.open_time,
                      close_time: e.target.checked ? undefined : v.close_time,
                    })
                  }
                />
                Closed
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(v.is_24_hours)}
                  onChange={(e) =>
                    set({
                      is_24_hours: e.target.checked || undefined,
                      is_closed: e.target.checked ? undefined : v.is_closed,
                      open_time: e.target.checked ? undefined : v.open_time,
                      close_time: e.target.checked ? undefined : v.close_time,
                    })
                  }
                />
                Open 24 hours
              </label>
            </div>
          </div>

          <div>
            {!v.is_closed && !v.is_24_hours && (
              <div className="flex items-center gap-2">
                <label className="flex flex-1 flex-col gap-1">
                  <span className="font-semibold">Open</span>
                  <input
                    type="time"
                    value={v.open_time || ""}
                    onChange={(e) =>
                      set({ open_time: e.target.value || undefined })
                    }
                    className="border-input bg-background mt-1 border p-3 focus:outline-none"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="font-semibold">Close</span>
                  <input
                    type="time"
                    value={v.close_time || ""}
                    onChange={(e) =>
                      set({ close_time: e.target.value || undefined })
                    }
                    className="border-input bg-background mt-1 border p-3 focus:outline-none"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
