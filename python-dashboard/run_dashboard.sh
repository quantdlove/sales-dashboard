#!/bin/bash

# Activate the virtual environment
source dashboard_env/bin/activate

# Try to run the dashboard on default port (8501)
echo "Starting dashboard on port 8501..."
streamlit run dashboard.py --server.headless true &
PID1=$!

# Give it 5 seconds to start
sleep 5

# Check if it's running
if ps -p $PID1 > /dev/null; then
    echo "Dashboard is running on port 8501. Access at http://localhost:8501"
    wait $PID1
else
    echo "Failed to start on port 8501. Trying port 8502..."
    
    # Try alternate port (8502)
    streamlit run dashboard.py --server.port=8502 --server.headless true &
    PID2=$!
    
    # Give it 5 seconds to start
    sleep 5
    
    # Check if it's running
    if ps -p $PID2 > /dev/null; then
        echo "Dashboard is running on port 8502. Access at http://localhost:8502"
        wait $PID2
    else
        echo "Failed to start dashboard on multiple ports. Please check for any errors above."
        exit 1
    fi
fi