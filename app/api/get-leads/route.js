import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  try {
    // Debug logs (viewable in your Vercel or local terminal logs)
    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase KEY (first 10 chars):", supabaseKey?.slice(0, 10));

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query the "Leads" table (capital L).
    // Columns: id, date, status_of_lead, icp, company, Leads
    const { data, error } = await supabase
      .from("Leads")
      .select("id, date, status_of_lead, icp, company, Leads");

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    console.log("Fetched rows:", data?.length || 0);

    // Return the rows as JSON to the front-end
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in get-leads endpoint:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
