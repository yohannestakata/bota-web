"use client";

import { useFormContext } from "react-hook-form";

export default function CorrectionDetailsSection(props: {
  name: string;
  setName: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  priceRange: number | "";
  setPriceRange: (v: number | "") => void;
  categories: Array<{ id: number; name: string }>;
  categoryId: number | "";
  setCategoryId: (v: number | "") => void;
  address: string;
  setAddress: (v: string) => void;
  latitude: string;
  setLatitude: (v: string) => void;
  longitude: string;
  setLongitude: (v: string) => void;
}) {
  const { register } = useFormContext();
  const {
    name,
    setName,
    website,
    setWebsite,
    phone,
    setPhone,
    priceRange,
    setPriceRange,
    categories,
    categoryId,
    setCategoryId,
    address,
    setAddress,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
  } = props;

  return (
    <div className="pb-12">
      <div>
        <div className="text-foreground text-xl font-bold">
          Details to correct
        </div>
        <div className="mt-6 grid grid-cols-1 gap-x-3 gap-y-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">Name</label>
            <input
              type="text"
              {...register("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Proposed new name"
              className="border-input bg-background w-full border p-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-semibold">Website</label>
            <input
              type="url"
              {...register("website_url")}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="border-input bg-background w-full border p-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-semibold">Phone</label>
            <input
              type="tel"
              {...register("phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="border-input bg-background w-full border p-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-semibold">Price range</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPriceRange(v)}
                  className={`border-input flex-1 ${
                    priceRange === v ? "bg-muted" : "bg-background"
                  } border py-3 text-sm`}
                >
                  {"$".repeat(v)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block font-semibold">Category</label>
            <select
              value={categoryId === "" ? "" : String(categoryId)}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : "")
              }
              className="border-input bg-background w-full border p-3 focus:outline-none"
            >
              <option value="">No change</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block font-semibold">Address</label>
            <input
              type="text"
              {...register("address")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, State ZIP"
              className="border-input bg-background w-full border p-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-semibold">Latitude</label>
            <input
              inputMode="decimal"
              {...register("latitude")}
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 9.0108"
              className="border-input bg-background w-full border p-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-semibold">Longitude</label>
            <input
              inputMode="decimal"
              {...register("longitude")}
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. 38.7613"
              className="border-input bg-background w-full border p-3 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
