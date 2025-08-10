import { getPlaceHours } from "@/lib/supabase/queries";
import Map from "./map";

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

export default async function Hours({
  placeId,
  latitude,
  longitude,
  name,
}: {
  placeId: string;
  latitude?: number | null;
  longitude?: number | null;
  name: string;
}) {
  const hours: HourRow[] = await getPlaceHours(placeId).catch(() => []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        {!hours.length ? (
          <div className="text-muted-foreground">Hours not set.</div>
        ) : (
          <table className="w-full">
            <tbody>
              {hours.map((h, idx) => (
                <tr key={h.day_of_week}>
                  <td
                    className={`${
                      idx === 0
                        ? "pb-3"
                        : idx === hours.length - 1
                          ? "pt-3"
                          : "py-3"
                    } pr-4 align-top text-sm font-medium`}
                  >
                    {DAYS[h.day_of_week]}
                  </td>
                  <td
                    className={`${
                      idx === 0
                        ? "pb-3"
                        : idx === hours.length - 1
                          ? "pt-3"
                          : "py-3"
                    }`}
                  >
                    {h.is_24_hours
                      ? "Open 24 hours"
                      : h.is_closed
                        ? "Closed"
                        : h.open_time && h.close_time
                          ? `${h.open_time} – ${h.close_time}`
                          : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {latitude && longitude ? (
        <div className="h-full overflow-hidden rounded-3xl">
          <Map lat={Number(latitude)} lon={Number(longitude)} name={name} />
        </div>
      ) : null}
    </div>
  );
}
