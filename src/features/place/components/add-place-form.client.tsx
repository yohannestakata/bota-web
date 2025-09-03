"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/auth-context";
import AuthGate from "@/components/ui/auth-gate";
import PlaceForm from "./forms/place-form.client";
import BranchForm from "./forms/branch-form.client";

export default function AddPlaceForm({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"place" | "branch">("place");
  const prevTabRef = useRef<"place" | "branch">("place");

  const handleTabChange = (tab: "place" | "branch") => {
    prevTabRef.current = activeTab;
    setActiveTab(tab);
  };

  if (isLoading) return null;
  if (!user) {
    return <div className="text-sm">Please sign in to add a place.</div>;
  }

  const direction =
    activeTab === "place" && prevTabRef.current === "branch"
      ? -1
      : activeTab === "branch" && prevTabRef.current === "place"
        ? 1
        : 0;

  return (
    <AuthGate
      title="Sign in to add a place"
      description="You need an account to add new places to our directory."
    >
      <div>
        <div className="border-border flex border">
          <button
            type="button"
            onClick={() => handleTabChange("place")}
            className={`relative flex-1 p-3 font-semibold transition-colors ${
              activeTab === "place"
                ? ""
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Add Place
            {activeTab === "place" && (
              <motion.div
                layoutId="activeTab"
                className="bg-muted absolute inset-0"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("branch")}
            className={`relative flex-1 p-3 font-semibold transition-colors ${
              activeTab === "branch"
                ? ""
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Add Branch
            {activeTab === "branch" && (
              <motion.div
                layoutId="activeTab"
                className="bg-muted absolute inset-0"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === "place" ? (
              <motion.div
                key="place"
                initial={{ x: direction === -1 ? -40 : 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction === -1 ? 40 : -40, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PlaceForm categories={categories} />
              </motion.div>
            ) : (
              <motion.div
                key="branch"
                initial={{ x: direction === 1 ? 40 : -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction === 1 ? -40 : 40, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BranchForm />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuthGate>
  );
}
