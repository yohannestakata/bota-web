"use client";

export default function DuplicateSection(props: {
  duplicateQuery: string;
  setDuplicateQuery: (v: string) => void;
  selectedDuplicate: { id: string; name: string; slug: string } | null;
  setSelectedDuplicate: (
    v: { id: string; name: string; slug: string } | null,
  ) => void;
  duplicateResults: { id: string; name: string; slug: string }[];
  setDuplicateResults: (
    v: { id: string; name: string; slug: string }[],
  ) => void;
  isSearching: boolean;
}) {
  const {
    duplicateQuery,
    setDuplicateQuery,
    selectedDuplicate,
    setSelectedDuplicate,
    duplicateResults,
    setDuplicateResults,
    isSearching,
  } = props;

  return (
    <div className="pb-12">
      <div className="text-foreground text-xl font-bold">
        Mark as duplicate of…
      </div>
      <div className="mt-6 rounded-lg">
        <label className="mb-2 block">Duplicate of</label>
        <input
          type="text"
          value={duplicateQuery}
          onChange={(e) => {
            setDuplicateQuery(e.target.value);
            setSelectedDuplicate(null);
          }}
          placeholder="Search places by name or city"
          className="border-input bg-background w-full border p-3 focus:outline-none"
          autoComplete="off"
        />
        {selectedDuplicate ? (
          <div className="mt-2 text-xs">
            Selected:{" "}
            <span className="font-medium">{selectedDuplicate.name}</span>
            <span className="text-muted-foreground">
              {" "}
              (/{selectedDuplicate.slug})
            </span>
          </div>
        ) : null}
        {!selectedDuplicate && (duplicateResults.length > 0 || isSearching) && (
          <ul className="bg-popover mt-2 max-h-56 w-full overflow-auto rounded-md text-sm shadow">
            {isSearching ? (
              <li className="text-muted-foreground px-3 py-2">Searching…</li>
            ) : (
              duplicateResults.map((opt) => (
                <li
                  key={opt.id}
                  className="hover:bg-muted cursor-pointer px-3 py-2"
                  onClick={() => {
                    setSelectedDuplicate(opt);
                    setDuplicateQuery(opt.name);
                    setDuplicateResults([]);
                  }}
                >
                  <div className="font-medium">{opt.name}</div>
                  <div className="text-muted-foreground text-xs">
                    /{opt.slug}
                  </div>
                </li>
              ))
            )}
            {!isSearching && duplicateResults.length === 0 ? (
              <li className="text-muted-foreground px-3 py-2">No results</li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}
