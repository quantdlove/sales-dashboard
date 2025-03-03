import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import os
import requests
import json

# Hardcoded Supabase credentials since environment/secrets aren't working
SUPABASE_URL = "https://vfxvfmifmsugmrxkojkg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHZmbWlmbXN1Z21yeGtvamtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MzI4MDQsImV4cCI6MjA1NjAwODgwNH0.n2Wj9q4pxUyMahROC4mw_BW1tVIwV7JG046cD06hbfU"

# Set page configuration
try:
    st.set_page_config(
        page_title="Sales Pipeline Dashboard",
        page_icon="📊",
        layout="wide",
        initial_sidebar_state="expanded"
    )
except Exception as e:
    # This addresses the "Connection refused" error that can happen in localhost
    st.error(f"Connection issue: {str(e)}")
    st.warning("If you're seeing connection refused errors, try running on a different port: streamlit run dashboard.py --server.port=8502")

# Direct Supabase API call using requests instead of the SDK
def fetch_data_direct():
    if not SUPABASE_URL or not SUPABASE_KEY:
        st.error("Supabase URL and API Key must be provided!")
        return []
        
    st.info(f"Connecting to Supabase at {SUPABASE_URL}...")
    
    # Try uppercase "Leads" table first
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        # First try with uppercase "Leads" table
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/Leads?select=*",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if data:
                st.success(f"Successfully fetched {len(data)} records from 'Leads' table")
                return data
                
        # If no data or error, try with lowercase "leads" table
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/leads?select=*",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if data:
                st.success(f"Successfully fetched {len(data)} records from 'leads' table")
                return data
            else:
                st.warning("No data found in 'leads' table")
                
        # If still no data, try a table list to see what's available
        st.warning(f"Could not find 'Leads' or 'leads' tables. Status code: {response.status_code}")
        
        # Use dummy data as a fallback for demonstration
        return generate_dummy_data()
        
    except Exception as e:
        st.error(f"Error connecting to Supabase: {str(e)}")
        st.info("Using dummy data for demonstration")
        return generate_dummy_data()

# Generate dummy data for testing/demo purposes
def generate_dummy_data(num_records=100):
    st.warning("Using generated dummy data since Supabase connection failed")
    
    # Define possible values
    statuses = ["Lead Generated", "Emailed", "Opened", "Demo"]
    icps = ["IRO", "IRC", "BS"]
    companies = ["Acme Inc", "Globex", "Initech", "Umbrella Corp", "Stark Industries"]
    
    # Generate random data
    data = []
    for i in range(num_records):
        # Create realistic date distribution over past 8 weeks
        days_ago = int(i / 5) % 56  # Spread records over 8 weeks
        date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        
        # Weight status distribution to create a realistic funnel
        status_weights = [0.4, 0.3, 0.2, 0.1]
        status_idx = min(int(i / (num_records / 4)), 3)
        status = statuses[status_idx]
        
        # Random ICP with some NULL values
        icp = icps[i % len(icps)] if i % 10 != 0 else None
        
        data.append({
            "id": i + 1,
            "date": date,
            "lead_name": f"Lead {i+1}",
            "status_of_lead": status,
            "icp": icp,
            "company": companies[i % len(companies)]
        })
    
    return data

# Process and standardize the data
def process_data(data):
    if not data:
        return pd.DataFrame()
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Standardize column names (handle both upper and lower case)
    column_mapping = {
        'ID': 'id',
        'Date': 'date', 
        'date': 'date',
        'Lead_Name': 'lead_name', 
        'lead_name': 'lead_name',
        'Status_of_lead': 'status_of_lead', 
        'status_of_lead': 'status_of_lead',
        'ICP': 'icp', 
        'icp': 'icp',
        'Company': 'company', 
        'company': 'company'
    }
    
    # Rename columns that exist in the dataframe
    rename_dict = {col: column_mapping[col] for col in df.columns if col in column_mapping}
    df = df.rename(columns=rename_dict)
    
    # Fill missing values
    for col in ['lead_name', 'status_of_lead', 'icp', 'company']:
        if col in df.columns:
            df[col] = df[col].fillna('')
    
    # Convert date to datetime
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
    
    return df

# Function to get the Monday of the week containing the given date
def get_week_start(date):
    if pd.isna(date):
        return None
    weekday = date.weekday()  # 0 = Monday, 6 = Sunday
    return date - timedelta(days=weekday)

# Main title
st.title("SALES PIPELINE DASHBOARD")

# Load the data
with st.spinner("Loading data..."):
    raw_data = fetch_data_direct()
    df = process_data(raw_data)

# Check if data loaded successfully
if df.empty:
    st.error("No data available. Please check your connection and try again.")
    st.stop()

# Display current date and last updated
col1, col2 = st.columns([2, 1])
with col1:
    st.subheader(f"Week of {datetime.now().strftime('%b %d, %Y')}")

with col2:
    st.text(f"Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    if st.button("Refresh Data", type="primary"):
        st.rerun()

# Filter by ICP (Ideal Customer Profile)
icps = ['All'] + sorted([i for i in df['icp'].unique() if i])
selected_icp = st.selectbox("Filter by ICP:", icps)

# Apply filter
if selected_icp != 'All':
    filtered_df = df[df['icp'] == selected_icp]
else:
    filtered_df = df.copy()

# Calculate metrics
total_leads = len(filtered_df)

# Status counts with progressive pipeline logic 
# (each lead counts in all previous stages of the pipeline)
# First, count based on actual status
leads_raw = filtered_df[filtered_df['status_of_lead'].isin(['', 'Leads', 'Lead Generated']) | filtered_df['status_of_lead'].isna()].shape[0]
emailed_raw = filtered_df[filtered_df['status_of_lead'] == 'Emailed'].shape[0]
opened_raw = filtered_df[filtered_df['status_of_lead'].str.contains('Open|open|Opened', na=False)].shape[0]
demo_raw = filtered_df[filtered_df['status_of_lead'] == 'Demo'].shape[0]

# Every lead is in "Leads" stage (total count)
leads_status = total_leads

# Emailed includes: Emailed + Opened + Demo
emailed_status = emailed_raw + opened_raw + demo_raw

# Opened includes: Opened + Demo
opened_status = opened_raw + demo_raw

# Demo is just Demo
demo_status = demo_raw

# For charts and visualizations, we also keep track of total counts at each stage
emailed_leads = emailed_status
opened_leads = opened_status

# Calculate percentages
email_rate = round((emailed_leads / total_leads * 100), 1) if total_leads > 0 else 0
opened_rate = round((opened_leads / emailed_leads * 100), 1) if emailed_leads > 0 else 0
demo_rate = round((demo_status / opened_leads * 100), 1) if opened_leads > 0 else 0

# Create metrics section
metrics_cols = st.columns(4)
with metrics_cols[0]:
    st.metric("Total Leads", total_leads)
with metrics_cols[1]:
    st.metric("Emailed", emailed_status, f"{email_rate}% of Total")
with metrics_cols[2]:
    st.metric("Opened", opened_status, f"{opened_rate}% of Emailed")
with metrics_cols[3]:
    st.metric("Demo", demo_status, f"{demo_rate}% of Opened")

# Weekly data aggregation
if 'date' in filtered_df.columns:
    # Add week start date column
    filtered_df['week_start'] = filtered_df['date'].apply(get_week_start)
    
    # Group by week
    weekly_data = []
    
    for week, group in filtered_df.groupby('week_start'):
        if pd.isna(week):
            continue
            
        # Count raw numbers for each status
        leads_raw = group[group['status_of_lead'].isin(['', 'Leads', 'Lead Generated']) | group['status_of_lead'].isna()].shape[0]
        emails_raw = group[group['status_of_lead'] == 'Emailed'].shape[0]
        opens_raw = group[group['status_of_lead'].str.contains('Open|open|Opened', na=False)].shape[0]
        demos_raw = group[group['status_of_lead'] == 'Demo'].shape[0]
        
        # Total leads in this week
        total_leads_week = leads_raw + emails_raw + opens_raw + demos_raw
        
        # Apply pipeline logic (each lead counts in all previous stages)
        # Every lead is a "Lead"
        leads = total_leads_week
        
        # Emailed includes: Emailed + Opened + Demo
        emails = emails_raw + opens_raw + demos_raw
        
        # Opened includes: Opened + Demo
        opens = opens_raw + demos_raw
        
        # Demo is just Demo
        demos = demos_raw
        
        # Total emailed remains the same for calculations
        total_emailed = emails
        
        # Calculate rates
        email_rate_week = round((total_emailed / total_leads_week * 100), 1) if total_leads_week > 0 else 0
        demo_rate_week = round((demos / total_emailed * 100), 1) if total_emailed > 0 else 0
        
        weekly_data.append({
            'week': week,
            'week_label': week.strftime('%b %d'),
            'leads': total_leads_week,
            'emails': total_emailed,
            'opened': opens + demos,
            'demo': demos,
            'email_rate': email_rate_week,
            'demo_rate': demo_rate_week
        })
    
    # Convert to DataFrame and sort
    weekly_df = pd.DataFrame(weekly_data)
    if not weekly_df.empty:
        weekly_df = weekly_df.sort_values('week')

        # Create visualization section
        st.subheader("Weekly Pipeline Progress")
        tabs = st.tabs(["Chart", "Table"])
        
        with tabs[0]:
            # Create line chart
            fig = px.line(
                weekly_df, 
                x='week_label', 
                y=['leads', 'emails', 'opened', 'demo'],
                labels={'value': 'Count', 'variable': 'Stage', 'week_label': 'Week'},
                title='Weekly Pipeline Progress',
                markers=True
            )
            fig.update_layout(height=500)
            st.plotly_chart(fig, use_container_width=True)
        
        with tabs[1]:
            # Display table
            table_df = weekly_df[['week_label', 'leads', 'emails', 'opened', 'demo', 'email_rate', 'demo_rate']]
            table_df = table_df.rename(columns={
                'week_label': 'Week', 
                'leads': 'Leads',
                'emails': 'Emails',
                'opened': 'Opened',
                'demo': 'Demo',
                'email_rate': 'Email Rate (%)',
                'demo_rate': 'Demo Rate (%)'
            })
            st.dataframe(table_df, use_container_width=True)
    else:
        st.warning("No weekly data available. Check if dates are correctly formatted in your data.")
else:
    st.warning("Date column is missing in the data, weekly analysis cannot be performed.")

# Show funnel visualization
st.subheader("Pipeline Funnel")
funnel_data = [
    dict(
        y=['Total Leads', 'Emailed', 'Opened', 'Demo'],
        x=[total_leads, emailed_leads, opened_leads, demo_status],
        text=[str(total_leads), str(emailed_leads), str(opened_leads), str(demo_status)],
        textposition='auto'
    )
]

fig = go.Figure(data=[go.Funnel(
    funnel_data[0],
    marker={"color": ["royalblue", "darkorange", "forestgreen", "crimson"]},
    textinfo="value+percent previous"
)])

fig.update_layout(height=500)
st.plotly_chart(fig, use_container_width=True)

# Data explorer
with st.expander("Data Explorer"):
    st.dataframe(filtered_df, use_container_width=True)

# Footer
st.markdown("""
---
*Dashboard created with Streamlit and Supabase*

Debug info:
- Supabase URL: {url}
- API Key (first 10 chars): {key}...
""".format(url=SUPABASE_URL, key=SUPABASE_KEY[:10]))