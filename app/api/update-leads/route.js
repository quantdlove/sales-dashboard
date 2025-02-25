import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    // 1) Parse JSON from Zapier
    const leadData = await req.json();
    console.log("Received data from Zapier:", leadData);

    // 2) Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3) Insert into "Leads" table
    //    Make sure the keys in leadData match your column names:
    //    { date, status_of_lead, icp, company, Leads }
    //    e.g. "Leads" is the column for the person's name
    const { data, error } = await supabase
      .from("Leads")
      .insert([leadData])
      .select("*"); // optionally returning inserted rows

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("Inserted row(s):", data);

    // 4) Return success
    return NextResponse.json({ success: true, inserted: data });
  } catch (err) {
    console.error("Error in update-leads endpoint:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
