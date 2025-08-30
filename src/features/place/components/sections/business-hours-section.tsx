"use client";

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
  return (
    <div className="pb-12">
      <div className="text-foreground text-xl font-bold">
        Business hours (optional)
      </div>
      <div className="mt-6">
        <div className="divide-border space-y-12 divide-y">
          {(
            [
              { label: "Monday", idx: 1 },
              { label: "Tuesday", idx: 2 },
              { label: "Wednesday", idx: 3 },
              { label: "Thursday", idx: 4 },
              { label: "Friday", idx: 5 },
              { label: "Saturday", idx: 6 },
              { label: "Sunday", idx: 0 },
            ] as const
          ).map(({ label, idx }) => {
            const v = hours[idx] || {};
            const set = (next: Partial<DayHours>) =>
              setHours((prev) => ({
                ...prev,
                [idx]: { ...v, ...next },
              }));
            return (
              <div
                key={label}
                className="flex items-center gap-12 pb-12 last:pb-0"
              >
                <div>
                  <div className="font-semibold">{label}</div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(v.is_closed)}
                        onChange={(e) =>
                          set({
                            is_closed: e.target.checked || undefined,
                            is_24_hours: e.target.checked
                              ? undefined
                              : v.is_24_hours,
                            open_time: e.target.checked
                              ? undefined
                              : v.open_time,
                            close_time: e.target.checked
                              ? undefined
                              : v.close_time,
                          })
                        }
                      />
                      Closed
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(v.is_24_hours)}
                        onChange={(e) =>
                          set({
                            is_24_hours: e.target.checked || undefined,
                            is_closed: e.target.checked
                              ? undefined
                              : v.is_closed,
                            open_time: e.target.checked
                              ? undefined
                              : v.open_time,
                            close_time: e.target.checked
                              ? undefined
                              : v.close_time,
                          })
                        }
                      />
                      Open 24 hours
                    </label>
                  </div>
                </div>

                {!v.is_closed && !v.is_24_hours && (
                  <div className="flex items-center gap-2">
                    <label className="flex flex-col gap-1 text-sm">
                      Open
                      <input
                        type="time"
                        value={v.open_time || ""}
                        onChange={(e) =>
                          set({ open_time: e.target.value || undefined })
                        }
                        className="border-input bg-background border px-2 py-1 text-sm focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Close
                      <input
                        type="time"
                        value={v.close_time || ""}
                        onChange={(e) =>
                          set({ close_time: e.target.value || undefined })
                        }
                        className="border-input bg-background border px-2 py-1 text-sm focus:outline-none"
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
