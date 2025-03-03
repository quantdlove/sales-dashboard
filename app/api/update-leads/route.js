// app/api/update-leads/route.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the provided credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(request) {
  try {
    // Parse the request body
    const leadData = await request.json();
    
    if (!leadData.id) {
      return new Response(JSON.stringify({ error: 'Lead ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    const requiredFields = ['status_of_lead', 'lead_name', 'company'];
    for (const field of requiredFields) {
      if (!leadData[field]) {
        return new Response(JSON.stringify({ error: `Field ${field} is required` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Try to update in the Leads table (uppercase field names)
    const { data: upperData, error: upperError } = await supabase
      .from('Leads')
      .update({
        Status_of_lead: leadData.status_of_lead,
        Date: leadData.date,
        ICP: leadData.icp,
        Lead_Name: leadData.lead_name,
        Company: leadData.company
      })
      .eq('id', leadData.id)
      .select();

    // If error with uppercase fields, try lowercase table and fields
    if (upperError) {
      console.log('Error updating in "Leads" table, trying "leads" table with lowercase fields');
      const { data: lowerData, error: lowerError } = await supabase
        .from('leads')
        .update({
          status_of_lead: leadData.status_of_lead,
          date: leadData.date,
          icp: leadData.icp,
          lead_name: leadData.lead_name,
          company: leadData.company
        })
        .eq('id', leadData.id)
        .select();
        
      if (lowerError) {
        console.error('Supabase update error with both table options:', { upperError, lowerError });
        return new Response(JSON.stringify({ 
          error: 'Database update error', 
          details: upperError.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Return data from lowercase table
      return new Response(JSON.stringify(lowerData[0] || { id: leadData.id, updated: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Return data from uppercase table
    return new Response(JSON.stringify(upperData[0] || { id: leadData.id, updated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
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