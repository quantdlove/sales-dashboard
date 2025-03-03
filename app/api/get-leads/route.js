// app/api/get-leads/route.js
import { createClient } from '@supabase/supabase-js';

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
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Database configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
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
        console.error('Supabase error with both table options:', { 
          upperCaseError: leadsError.message,
          lowerCaseError: lowercaseError.message
        });
        return new Response(JSON.stringify({ 
          error: 'Database error',
          message: leadsError.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // If lowercase table works, use this data
      return formatAndReturnResponse(lowercaseData);
    }
    
    // Use data from the Leads table
    return formatAndReturnResponse(leadsData);
    
  } catch (err) {
    console.error('Server error:', err);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Helper function to format and return data
function formatAndReturnResponse(data) {
  if (!data || data.length === 0) {
    // If no data found, return empty array
    console.log('No data found in Supabase response');
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Log the first record to see what we're working with
  console.log('Sample Supabase record:', JSON.stringify(data[0], null, 2));
  
  // Sample the first record to determine column names
  const sampleRecord = data[0];
  const hasUppercaseKeys = sampleRecord && ('Lead_Name' in sampleRecord || 'Status_of_lead' in sampleRecord);
  
  console.log('Using uppercase keys:', hasUppercaseKeys);
  
  // Map the data to the expected format based on actual column names
  const formattedData = data.map(lead => {
    if (hasUppercaseKeys) {
      return {
        id: lead.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        date: lead.Date,
        lead_name: lead.Lead_Name,
        status_of_lead: lead.Status_of_lead,
        icp: lead.ICP,
        company: lead.Company
      };
    } else {
      // Assume lowercase column names
      return {
        id: lead.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        date: lead.date,
        lead_name: lead.lead_name,
        status_of_lead: lead.status_of_lead,
        icp: lead.icp,
        company: lead.company
      };
    }
  });
  
  // Log a sample of the processed data
  if (formattedData.length > 0) {
    console.log('Sample processed record:', JSON.stringify(formattedData[0], null, 2));
  }
  
  console.log(`Successfully processed ${formattedData.length} leads`);
  
  return new Response(JSON.stringify(formattedData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}