import { create } from "zustand";
import type { ExtractionStatus, LabValue, ReportMeta } from "../types/value";
import { isFlagged } from "../lib/severity";

interface ReportState {
  status: ExtractionStatus;
  meta: ReportMeta | null;
  values: LabValue[];
  walkthroughKeys: string[];
  showAll: boolean;
  error: string | null;
  partialWarning: string | null;
  pendingFiles: File[];

  setPendingFiles: (files: File[]) => void;
  setAnalysing: () => void;
  setReport: (meta: ReportMeta, values: LabValue[], walkthroughKeys: string[]) => void;
  setEmpty: () => void;
  setError: (message: string) => void;
  setShowAll: (v: boolean) => void;
  clear: () => void;

  flagged: () => LabValue[];
  byKey: (key: string) => LabValue | undefined;
  counts: () => { attention: number; watch: number; inRange: number };
}

export const useReportStore = create<ReportState>((set, get) => ({
  status: "idle",
  meta: null,
  values: [],
  walkthroughKeys: [],
  showAll: false,
  error: null,
  partialWarning: null,
  pendingFiles: [],

  setPendingFiles: (files) => set({ pendingFiles: files }),
  setAnalysing: () => set({ status: "analysing", error: null }),
  setReport: (meta, values, walkthroughKeys) =>
    set({ status: "ready", meta, values, walkthroughKeys, error: null }),
  setEmpty: () => set({ status: "empty" }),
  setError: (message) => set({ status: "error", error: message }),
  setShowAll: (v) => set({ showAll: v }),
  clear: () =>
    set({
      status: "idle",
      meta: null,
      values: [],
      walkthroughKeys: [],
      showAll: false,
      error: null,
      partialWarning: null,
    }),

  flagged: () => get().values.filter((v) => isFlagged(v.status) || v.status === "borderline"),
  byKey: (key) => get().values.find((v) => v.key === key),
  counts: () => {
    const values = get().values;
    return {
      attention: values.filter((v) => isFlagged(v.status)).length,
      watch: values.filter((v) => v.status === "borderline").length,
      inRange: values.filter((v) => v.status === "normal").length,
    };
  },
}));
