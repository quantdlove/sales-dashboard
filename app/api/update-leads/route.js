import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    const leadData = await req.json();
    console.log("Received data from Zapier:", leadData);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into your "Leads" table
    const { error } = await supabase.from("Leads").insert([leadData]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in update-leads endpoint:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
