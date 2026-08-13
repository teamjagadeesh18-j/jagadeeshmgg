import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getStoredEnquiries, saveStoredEnquiry, updateStoredEnquiryStatus, EnquiryItem } from "@/lib/enquiries-store";

export async function GET() {
  try {
    const fileData = getStoredEnquiries();
    let supabaseData: EnquiryItem[] = [];

    try {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        supabaseData = data as EnquiryItem[];
      }
    } catch (e) {
      console.warn("Supabase fetch error in GET /api/enquiries:", e);
    }

    // Merge Supabase data and File backup data (deduplicate by id or email+created_at)
    const map = new Map<string, EnquiryItem>();

    // Add file data first
    fileData.forEach((item) => {
      map.set(item.id || `${item.email}-${item.created_at}`, item);
    });

    // Add/overwrite with Supabase data if present
    supabaseData.forEach((item) => {
      map.set(item.id || `${item.email}-${item.created_at}`, item);
    });

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ success: true, enquiries: combined });
  } catch (err: any) {
    console.error("GET /api/enquiries error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
    }

    // Update in file backup
    updateStoredEnquiryStatus(id, status);

    // Update in Supabase
    try {
      await supabase.from("enquiries").update({ status }).eq("id", id);
    } catch (e) {
      console.warn("Supabase update status warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PATCH /api/enquiries error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
