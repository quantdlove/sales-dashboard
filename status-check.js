// ESM-compatible script
const http = require('http');

function checkLeadStatuses() {
  console.log('Fetching leads from API...');
  
  const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/api/get-leads',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const leads = JSON.parse(data);
        console.log(`Total leads: ${leads.length}`);
        
        // Count by original status (as stored in database)
        const originalStatusCount = {};
        leads.forEach(lead => {
          // Check both uppercase and lowercase field names
          const status = lead.Status_of_lead || lead.status_of_lead || 'Unknown';
          originalStatusCount[status] = (originalStatusCount[status] || 0) + 1;
        });
        console.log('Original status counts:', originalStatusCount);
        
        // Show the first few leads with their statuses for debugging
        console.log('\nSample leads with statuses:');
        leads.slice(0, 5).forEach((lead, i) => {
          console.log(`Lead ${i+1}:`, {
            id: lead.id,
            original_status: lead.Status_of_lead || lead.status_of_lead,
            lead_name: lead.Lead_Name || lead.lead_name,
            company: lead.Company || lead.company
          });
        });
        
        // Show any leads with "Opened" status
        console.log('\nLeads with "Opened" status:');
        const openedLeads = leads.filter(lead => {
          const status = (lead.Status_of_lead || lead.status_of_lead || '').toString();
          return status.includes('Open') || status.includes('open');
        });
        
        console.log(`Found ${openedLeads.length} leads with "Opened" status`);
        openedLeads.forEach((lead, i) => {
          console.log(`Opened Lead ${i+1}:`, {
            id: lead.id,
            status: lead.Status_of_lead || lead.status_of_lead,
            lead_name: lead.Lead_Name || lead.lead_name,
            company: lead.Company || lead.company
          });
        });
        
      } catch (error) {
        console.error('Error parsing response:', error);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error fetching data:', error.message);
  });
  
  req.end();
}

checkLeadStatuses();