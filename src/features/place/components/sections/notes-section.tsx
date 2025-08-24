"use client";

import { useFormContext } from "react-hook-form";

export default function NotesSection(props: {
  message: string;
  setMessage: (v: string) => void;
  evidenceUrl: string;
  setEvidenceUrl: (v: string) => void;
}) {
  const { register } = useFormContext();
  const { message, setMessage, evidenceUrl, setEvidenceUrl } = props;

  return (
    <div className="pb-12">
      <div className="text-foreground text-xl font-bold">
        Notes & evidence (optional)
      </div>
      <div className="mt-6 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block">Message</label>
            <textarea
              {...register("message")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Explain what needs to change and why."
              className="border-input bg-background w-full border p-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block">Evidence link</label>
            <input
              type="url"
              {...register("evidence_url")}
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="Link to official site, news, etc."
              className="border-input bg-background w-full border p-3 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
