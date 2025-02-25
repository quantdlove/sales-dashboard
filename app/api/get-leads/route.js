import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  try {
    // Debug logs: watch these in VS Code Terminal
    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase KEY (first 10 chars):", supabaseKey?.slice(0, 10));

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Table is named "Leads" (capital L).
    // Columns: id, date, status_of_lead, icp, company, Leads (capital L).
    // We'll select them all explicitly (case-sensitive).
    const { data, error } = await supabase
      .from("Leads") // Must match your table name exactly
      .select("id, date, status_of_lead, icp, company, Leads"); 
      // "Leads" here is the column storing the person's name, as seen in your screenshot.

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    console.log("Fetched rows:", data.length); // Expecting 91 if your table has 91 leads

    // Return the rows to your front-end
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in get-leads endpoint:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
