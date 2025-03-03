// app/api/get-leads/route.js
import { createClient } from '@supabase/supabase-js';

// Sample data to use as fallback if database connection fails
const SAMPLE_DATA = [
  {
    id: 1,
    Date: "2025-02-25",
    Lead_Name: "Sample Lead 1",
    Status_of_lead: "Lead Generated",
    ICP: "IRO",
    Company: "Sample Company 1"
  },
  {
    id: 2,
    Date: "2025-02-26",
    Lead_Name: "Sample Lead 2",
    Status_of_lead: "Emailed",
    ICP: "IRC",
    Company: "Sample Company 2"
  },
  {
    id: 3,
    Date: "2025-02-27",
    Lead_Name: "Sample Lead 3",
    Status_of_lead: "Demo",
    ICP: "BS",
    Company: "Sample Company 3"
  }
];

// Initialize Supabase client with the provided credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase;

// Only create client if credentials are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export async function GET() {
  try {
    // Check if we have the Supabase credentials
    if (!supabaseUrl || !supabaseKey || !supabase) {
      console.log('Missing Supabase credentials, using sample data');
      return formatAndReturnResponse(SAMPLE_DATA);
    }
    
    console.log('Connecting to Supabase:', supabaseUrl);
    
    // Try to fetch from the Leads table
    const { data: leadsData, error: leadsError } = await supabase
      .from('Leads')
      .select('*');

    // If there's an error with the Leads table, try the lowercase 'leads' table
    if (leadsError) {
      console.log('Error fetching from "Leads" table, trying "leads" table');
      const { data: lowercaseData, error: lowercaseError } = await supabase
        .from('leads')
        .select('*');
        
      if (lowercaseError) {
        console.error('Supabase error with both table options');
        console.log('Falling back to sample data');
        return formatAndReturnResponse(SAMPLE_DATA);
      }
      
      // If lowercase table works, use this data
      return formatAndReturnResponse(lowercaseData);
    }
    
    // Use data from the Leads table
    return formatAndReturnResponse(leadsData);
    
  } catch (err) {
    console.error('Server error:', err);
    console.log('Falling back to sample data due to error');
    return formatAndReturnResponse(SAMPLE_DATA);
  }
}

// Helper function to format and return data
function formatAndReturnResponse(data) {
  if (!data || data.length === 0) {
    // If no data found, return empty array
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Sample the first record to determine column names
  const sampleRecord = data[0];
  const hasUppercaseKeys = sampleRecord && ('Lead_Name' in sampleRecord || 'Status_of_lead' in sampleRecord);
  
  // Map the data to the expected format based on actual column names
  const formattedData = data.map(lead => {
    if (hasUppercaseKeys) {
      return {
        id: lead.id,
        Date: lead.Date,
        Lead_Name: lead.Lead_Name,
        Status_of_lead: lead.Status_of_lead,
        ICP: lead.ICP,
        Company: lead.Company
      };
    } else {
      // Assume lowercase column names
      return {
        id: lead.id,
        Date: lead.date,
        Lead_Name: lead.lead_name,
        Status_of_lead: lead.status_of_lead,
        ICP: lead.icp,
        Company: lead.company
      };
    }
  });
  
  console.log(`Successfully processed ${formattedData.length} leads`);
  
  return new Response(JSON.stringify(formattedData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}