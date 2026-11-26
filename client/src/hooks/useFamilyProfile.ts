import { useState, useEffect } from "react";
import type { FamilyMember } from "../types/index.js";

const STORAGE_KEY = "urban_aqi_family_profile_v2";

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: "d3b07384-d113-4944-9c87-8275e6fb0a11", name: "Child", role: "child" },
  { id: "e4c18495-e224-4a55-ad98-9386f70c1b22", name: "Adult", role: "adult" },
  { id: "f5d295a6-f335-4b66-be09-a497081d2c33", name: "Senior", role: "senior" },
];

function generateUUIDv4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6]! & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8]! & 0x3f) | 0x80; // Variant 10xx
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Ultimate standard fallback for environments without crypto
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useFamilyProfile() {
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      // Purge legacy v1 storage if present
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("urban_aqi_family_profile");
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: FamilyMember[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          // Auto-migrate legacy personal names if loaded from prior sessions
          return parsed.map((m) => {
            let cleanName = m.name;
            if (cleanName === "Aarav") cleanName = "Child";
            if (cleanName === "Saloni") cleanName = "Adult";
            if (cleanName === "Dada ji") cleanName = "Senior";
            return {
              ...m,
              name: cleanName,
              id: uuidRegex.test(m.id) ? m.id : generateUUIDv4(),
            };
          });
        }
      }
    } catch {
      // ignore JSON parse or localStorage errors
    }
    return DEFAULT_MEMBERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch {
      // ignore
    }
  }, [members]);

  const addMember = (member: Omit<FamilyMember, "id">) => {
    if (members.length >= 10) return;
    const newMember: FamilyMember = {
      ...member,
      id: generateUUIDv4(),
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return; // Keep at least one
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const resetToDefaults = () => {
    setMembers(DEFAULT_MEMBERS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEMBERS));
    } catch {
      // ignore
    }
  };

  return { members, addMember, removeMember, resetToDefaults };
}
