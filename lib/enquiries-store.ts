import fs from "fs";
import path from "path";

export interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  objective: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "enquiries.json");

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]), "utf-8");
  }
}

export function getStoredEnquiries(): EnquiryItem[] {
  try {
    ensureFileExists();
    const raw = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(raw) as EnquiryItem[];
  } catch (err) {
    console.error("Error reading enquiries store:", err);
    return [];
  }
}

export function saveStoredEnquiry(enquiry: EnquiryItem): EnquiryItem[] {
  try {
    ensureFileExists();
    const current = getStoredEnquiries();
    // Avoid duplicate IDs
    const filtered = current.filter((item) => item.id !== enquiry.id);
    const updated = [enquiry, ...filtered];
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Error saving enquiry store:", err);
    return [];
  }
}

export function updateStoredEnquiryStatus(id: string, status: "new" | "read" | "replied"): EnquiryItem[] {
  try {
    ensureFileExists();
    const current = getStoredEnquiries();
    const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
    fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Error updating enquiry status:", err);
    return [];
  }
}
