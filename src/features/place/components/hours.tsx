// import { getPlaceHours } from "@/lib/supabase/queries";
import Map from "./map";

function formatTo12Hour(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr || 0);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(m).padStart(2, "0");
  return `${hour12}:${mm} ${period}`;
}

export interface HourRow {
  day_of_week: number;
  open_time?: string | null;
  close_time?: string | null;
  is_closed: boolean;
  is_24_hours: boolean;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Hours({
  // placeId,
  latitude,
  longitude,
  name,
  hours,
}: {
  placeId?: string;
  latitude?: number | null;
  longitude?: number | null;
  name: string;
  hours?: HourRow[];
}) {
  // If hours are provided, use them; otherwise fetch from placeId
  // const hoursData = hours || (placeId ? await getPlaceHours(placeId).catch(() => []) : []);

  // hours are provided via props; avoid async fetch in client components

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        {!hours || !hours.length ? (
          <div className="text-muted-foreground">Hours not set.</div>
        ) : (
          <table className="w-full">
            <tbody>
              {hours.map((h) => {
                if (h.day_of_week === 0) return null;
                return (
                  <tr key={h.day_of_week}>
                    <td className={`pr-4 pb-6 align-top font-semibold`}>
                      {DAYS[h.day_of_week]}
                    </td>
                    <td className={`pb-6`}>
                      {h.is_24_hours
                        ? "Open 24 hours"
                        : h.is_closed
                          ? "Closed"
                          : h.open_time && h.close_time
                            ? `${formatTo12Hour(h.open_time)} – ${formatTo12Hour(h.close_time)}`
                            : "—"}
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td className="font-semibold">{DAYS[0]}</td>
                <td>
                  {hours[0].is_24_hours
                    ? "Open 24 hours"
                    : hours[0].is_closed
                      ? "Closed"
                      : hours[0].open_time && hours[0].close_time
                        ? `${formatTo12Hour(hours[0].open_time)} – ${formatTo12Hour(hours[0].close_time)}`
                        : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      {latitude && longitude ? (
        <div className="h-full min-h-72 overflow-hidden">
          <Map lat={Number(latitude)} lon={Number(longitude)} name={name} />
        </div>
      ) : null}
    </div>
  );
}
