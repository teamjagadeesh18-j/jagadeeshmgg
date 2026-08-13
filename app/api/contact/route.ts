export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseClient } from "@/lib/supabase";
import { saveStoredEnquiry } from "@/lib/enquiries-store";

const ownerEmail = process.env.OWNER_EMAIL || "teamjagadeesh18@gmail.com";

export async function POST(req: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY || "";
    const resend = new Resend(resendApiKey);
    const body = await req.json();
    const { name, email, mobile, message, objective } = body;

    // --- Validation ---
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Name is required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
    }

    const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
    if (!mobile || !phoneRegex.test(mobile.trim())) {
      return NextResponse.json(
        { success: false, error: "A valid mobile number with country code is required (e.g. +91 98765 43210)." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Project context/message is required." }, { status: 400 });
    }

    const selectedObjective = objective || "Website / Strategic Architecture";

    const newEnquiry = {
      id: `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      message: message.trim(),
      objective: selectedObjective,
      status: "new" as const,
      created_at: new Date().toISOString(),
    };

    // Save to local persistent file backup
    saveStoredEnquiry(newEnquiry);

    // --- 1. Supabase Database Insert ---
    try {
      const supabase = getSupabaseClient();
      const { error: dbError } = await supabase
        .from("enquiries")
        .insert([
          {
            name: newEnquiry.name,
            email: newEnquiry.email,
            mobile: newEnquiry.mobile,
            message: newEnquiry.message,
            objective: newEnquiry.objective,
            status: newEnquiry.status,
          },
        ]);

      if (dbError) {
        console.warn("Supabase DB Insert Warning (saved locally):", dbError.message);
      }
    } catch (e) {
      console.warn("Supabase DB Exception (saved locally):", e);
    }

    // --- 2. Send Emails via Resend ---
    let emailOwnerSuccess = false;
    let emailClientSuccess = false;

    // Notification Email to Owner
    try {
      const ownerEmailRes = await resend.emails.send({
        from: "Portfolio Enquiries <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `New Enquiry: [${selectedObjective}] - ${name.trim()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #222;">
            <h2 style="color: #ffffff; margin-top: 0; font-size: 22px; border-bottom: 1px solid #333; padding-bottom: 12px;">
              ⚡ New Strategic Enquiry
            </h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #888; width: 140px; font-weight: bold;">Objective:</td>
                <td style="padding: 8px 0; color: #fbbf24; font-weight: bold;">${selectedObjective}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-weight: bold;">Name:</td>
                <td style="padding: 8px 0; color: #ffffff;">${name.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-weight: bold;">Direct Email:</td>
                <td style="padding: 8px 0; color: #38bdf8;">
                  <a href="mailto:${email.trim()}" style="color: #38bdf8; text-decoration: none;">${email.trim()}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-weight: bold;">Mobile Number:</td>
                <td style="padding: 8px 0; color: #ffffff;">${mobile.trim()}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 20px; background: #141414; border-radius: 8px; border-left: 3px solid #fbbf24;">
              <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: bold;">
                Project Context & Bottlenecks:
              </div>
              <div style="color: #e4e4e7; line-height: 1.6; white-space: pre-wrap;">${message.trim()}</div>
            </div>

            <div style="margin-top: 24px; font-size: 11px; color: #555; text-align: center;">
              Sent from Jagadeesh Portfolio System • ${new Date().toISOString()}
            </div>
          </div>
        `,
      });

      if (!ownerEmailRes.error) {
        emailOwnerSuccess = true;
      } else {
        console.error("Owner Resend Error:", ownerEmailRes.error);
      }
    } catch (e) {
      console.error("Owner Email Exception:", e);
    }

    // Confirmation Email to Client
    try {
      const clientEmailRes = await resend.emails.send({
        from: "Jagadeesh <onboarding@resend.dev>",
        to: [email.trim()],
        subject: "Thanks for reaching out",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #222;">
            <h2 style="color: #ffffff; margin-top: 0;">Thanks for reaching out.</h2>
            <p style="color: #d4d4d8; font-size: 15px; line-height: 1.6;">
              Our team will get back to you as soon as possible.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #222; font-size: 12px; color: #71717a;">
              Jagadeesh — Principal Systems Architect & Solo Engineer
            </div>
          </div>
        `,
      });

      if (!clientEmailRes.error) {
        emailClientSuccess = true;
      } else {
        console.error("Client Resend Error:", clientEmailRes.error);
      }
    } catch (e) {
      console.error("Client Email Exception:", e);
    }

    return NextResponse.json({
      success: true,
      data: { name: name.trim(), email: email.trim(), status: "new" },
      emailOwnerSuccess,
      emailClientSuccess,
    });
  } catch (err: any) {
    console.error("Contact API Server Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Server Error" }, { status: 500 });
  }
}
