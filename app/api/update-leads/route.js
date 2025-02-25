import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We'll read these from your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Zapier (Excel → Webhooks POST) calls this endpoint to insert new leads.
 */
export async function POST(req) {
  try {
    // 1) Parse the JSON body from Zapier
    const leadData = await req.json();
    console.log("Received data from Zapier:", leadData);

    // 2) Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3) Insert the new row into your "Leads" table
    // Make sure "leadData" has keys matching your Supabase columns
    const { error } = await supabase.from("Leads").insert([leadData]);
    if (error) throw error;

    // 4) Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update-leads endpoint:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
