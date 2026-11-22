import { useState, useEffect } from "react";
import type { FamilyMember } from "../types/index.js";

const STORAGE_KEY = "urban_aqi_family_profile";

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: "1", name: "Aarav", role: "child" },
  { id: "2", name: "Saloni", role: "adult" },
  { id: "3", name: "Dada ji", role: "senior" },
];

export function useFamilyProfile() {
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
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
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return; // Keep at least one
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return { members, addMember, removeMember };
}
