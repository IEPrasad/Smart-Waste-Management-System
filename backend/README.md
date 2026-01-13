# Waste Management System - Admin & Driver Implementation Update

## Overview
This document summarizes the changes made to implement the **secure driver onboarding** flow and **Admin Panel authentication**.

## key Features Implemented

### 1. Supabase Edge Function: `create-driver`
A secure server-side function was created to handle the creation of new drivers. 
- **Location**: `supabase/functions/create-driver/index.ts`
- **Functionality**:
    - Verifies the caller is an authenticated Admin.
    - Accepts driver details (`fullName`, `email`, `mobile`, `empNo`, `nic`).
    - Generates a secure, random 8-character password.
    - Creates a new user in **Supabase Auth** (auto-confirmed).
    - Inserts the driver profile into the `public.driver` database table.
        - *Note*: Handles `empno` vs `empNo` column naming.
    - Sends a welcome email to the driver with their temporary password using the **Resend API**.
    - Returns specific error messages for duplicate NICs or Emails.

### 2. Admin Panel Authentication
The Login page was updated to support real authentication and role-based access control.
- **Location**: `admin-panel/src/pages/login/login.jsx`
- **Features**:
    - **Real Login**: Replaced placeholder logic with `supabase.auth.signInWithPassword`.
    - **Admin RBAC**: After login, the system queries the `public.admin` table. If the user ID is not found there, they are immediately signed out and denied access.
    - **Sign Up flow**: Added a temporary "Sign Up" toggle to allow creating the initial Admin account. New sign-ups are automatically inserted into the `admin` table to grant them access.

### 3. Add Driver Modal
The frontend modal was connected to the backend edge function.
- **Location**: `admin-panel/src/components/Drivers/AddDriverModal.jsx`
- **Features**:
    - Calls the `create-driver` Edge Function securely using the current user's session token.
    - Displays specific error messages (e.g., "A driver with this NIC number already exists") returned from the server.
    - Handles loading states and form validation.

## Setup & Deployment Instructions

### Database Schema
Ensure the following tables exist in your Supabase database:

1. **`public.driver`**
   ```sql
   create table public.driver (
     id uuid references auth.users on delete cascade primary key,
     full_name text,
     email text unique,
     mobile_number text,
     empno text,
     nic_number text unique
   );
   ```

2. **`public.admin`** (For RBAC)
   ```sql
   create table public.admin (
     id uuid references auth.users on delete cascade primary key,
     email text
   );
   ```

### Environment Variables
The Edge Function requires the Resend API Key:
```bash
npx supabase secrets set RESEND_API_KEY=your_resend_api_key
```

### Deployment
To deploy changes to the Edge Function:
```bash
npx supabase functions deploy create-driver
```

## Usage
1. **Initial Admin Setup**: Use the "Sign Up" link on the Login page to create your admin account.
2. **Add Driver**: Log in as Admin, navigate to **Drivers**, click **Add New Driver**, and fill in the details. The driver will receive an email with their credentials.
