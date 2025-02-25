import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  try {
    // Debug logs
    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase KEY (first 10 chars):", supabaseKey?.slice(0, 10));

    const supabase = createClient(supabaseUrl, supabaseKey);

    // IMPORTANT: If your table is named exactly "Leads" (capital L), keep "Leads".
    // The columns you said exist: id, date, status_of_lead, icp, company
    const { data, error } = await supabase
      .from("Leads")
      .select("id, date, status_of_lead, icp, company"); 
      // Removed "leads" because that column doesn't exist

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    console.log("Fetched rows:", data.length);

    // Return rows to the front end
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in get-leads endpoint:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
