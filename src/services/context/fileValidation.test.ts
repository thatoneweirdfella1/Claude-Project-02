/* Step 7.1 verification — file upload validation. CANON Feature 6's exact
   numbers (10MB/file, 50MB/session) and accepted types (PDF/TXT/JSON/CSV/
   images), plus the neutral, specific rejection messaging. */

import { describe, expect, it } from "vitest";
import {
  FILE_INPUT_ACCEPT,
  MAX_FILE_BYTES,
  MAX_SESSION_BYTES,
  formatBytes,
  isAcceptedFileType,
  isImageFile,
  validateFile,
} from "./fileValidation";

function file(name: string, size: number, type = ""): Pick<File, "name" | "type" | "size"> {
  return { name, size, type };
}

describe("CANON Feature 6 limits", () => {
  it("10MB per file, 50MB per session, verbatim", () => {
    expect(MAX_FILE_BYTES).toBe(10 * 1024 * 1024);
    expect(MAX_SESSION_BYTES).toBe(50 * 1024 * 1024);
  });
});

describe("isAcceptedFileType", () => {
  it("accepts PDF, TXT, JSON, CSV by extension", () => {
    expect(isAcceptedFileType(file("report.pdf", 100))).toBe(true);
    expect(isAcceptedFileType(file("notes.txt", 100))).toBe(true);
    expect(isAcceptedFileType(file("data.json", 100))).toBe(true);
    expect(isAcceptedFileType(file("table.csv", 100))).toBe(true);
  });

  it("accepts common image extensions and any image/* MIME type", () => {
    expect(isAcceptedFileType(file("photo.png", 100))).toBe(true);
    expect(isAcceptedFileType(file("photo.jpg", 100))).toBe(true);
    expect(isAcceptedFileType(file("weird-name", 100, "image/heic"))).toBe(true);
  });

  it("is case-insensitive on extension", () => {
    expect(isAcceptedFileType(file("REPORT.PDF", 100))).toBe(true);
  });

  it("rejects an unsupported type", () => {
    expect(isAcceptedFileType(file("archive.zip", 100))).toBe(false);
    expect(isAcceptedFileType(file("video.mp4", 100))).toBe(false);
  });
});

describe("isImageFile", () => {
  it("distinguishes images from documents", () => {
    expect(isImageFile(file("photo.png", 100))).toBe(true);
    expect(isImageFile(file("notes.txt", 100))).toBe(false);
  });
});

describe("validateFile — type", () => {
  it("rejects an unsupported type with a specific, neutral message", () => {
    const result = validateFile(file("archive.zip", 100), 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("type");
      expect(result.message).toContain("archive.zip");
      expect(result.message).not.toMatch(/wrong|mistake|shouldn't|invalid/i); // never blaming
    }
  });
});

describe("validateFile — per-file size", () => {
  it("accepts a file exactly at the 10MB cap", () => {
    expect(validateFile(file("big.txt", MAX_FILE_BYTES), 0)).toEqual({ ok: true });
  });

  it("rejects a file one byte over the 10MB cap", () => {
    const result = validateFile(file("big.txt", MAX_FILE_BYTES + 1), 0);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("file-too-large");
  });
});

describe("validateFile — session total", () => {
  it("accepts a file that brings the session exactly to the 50MB cap", () => {
    const result = validateFile(file("part.txt", 10 * 1024 * 1024), 40 * 1024 * 1024);
    expect(result).toEqual({ ok: true });
  });

  it("rejects a file that would push the session over 50MB, even though the file alone is under 10MB", () => {
    const result = validateFile(file("part.txt", 1024), MAX_SESSION_BYTES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("session-too-large");
  });

  it("session-total check runs even when currentSessionBytes is 0", () => {
    expect(validateFile(file("small.txt", 1024), 0)).toEqual({ ok: true });
  });
});

describe("formatBytes", () => {
  it("formats bytes/KB/MB in a human-readable way", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});

describe("FILE_INPUT_ACCEPT", () => {
  it("lists every document extension the validator accepts", () => {
    for (const ext of [".pdf", ".txt", ".json", ".csv"]) {
      expect(FILE_INPUT_ACCEPT).toContain(ext);
    }
  });
});
