import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    // 1) Parse JSON from Zapier
    const leadData = await req.json();
    console.log("Received data from Zapier:", leadData);

    // 2) Validate that all required fields exist:
    //    Fields: date, Leads, status_of_lead, icp, company
    const { date, Leads, status_of_lead, icp, company } = leadData;
    if (!date || !Leads || !status_of_lead || !icp || !company) {
      console.log("Skipping insert due to missing field(s):", leadData);
      return NextResponse.json(
        { success: false, error: "One or more required fields missing." },
        { status: 400 }
      );
    }

    // 3) Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4) Insert into your "Leads" table and return the inserted row(s)
    const { data: inserted, error } = await supabase
      .from("Leads")
      .insert([leadData])
      .select("*"); // returns inserted rows for confirmation

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("Inserted row(s):", inserted);

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error("Error in update-leads endpoint:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
