# Waste Management System - Backend API

This is the core server-side application for the Waste Management System, built using Node.js, Express, and MongoDB. It acts as the "digital air traffic control tower" to synchronize residents, drivers, and city officials.

## 📁 Directory Structure
- `models/`: MongoDB schemas (User, Pickup, WasteLog, Reward).
- `routes/`: API endpoints for scheduling, tracking, and reporting.
- `controllers/`: Logic for handling business rules like reward calculations.
- `config/`: Database and Supabase configuration files.
- `.env`: Environment variables (Database URLs, API Keys).

## 🚀 Key Features Implemented
- **User Authentication**: Secure login management via Firebase/Supabase.
- **Reward Engine**: Logic to calculate points based on waste weight and type.
- **Data Archival**: Long-term storage for pickups (12 months) and deleted accounts (6 months).
- **Issue Handling**: Backend processing for missed pickup reports and resolutions.

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Archival) & Supabase (Real-time)