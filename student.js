# Nixor Attendance Lite

A lightweight QR attendance system for Student Affairs.

## Features

- Student Affairs creates a timed attendance session
- A QR code is generated automatically
- Students enter Student ID, name, and optional program/class
- Browser location is checked against an allowed radius
- Late students must provide a reason
- Students receive a configurable next-step message
- Duplicate attendance is blocked per session
- Student Affairs can view the log and export it to Excel

## 1. Create a Supabase project

1. Create a new Supabase project.
2. Open the SQL Editor.
3. Run the contents of `supabase-schema.sql`.
4. Copy the Project URL and the `service_role` key from project settings.

Never place the service-role key in frontend JavaScript.

## 2. Deploy to Netlify

Upload this folder to GitHub and connect the repository to Netlify, or use Netlify CLI.

Netlify will install the dependency from `package.json`.

## 3. Add Netlify environment variables

In Netlify Site configuration → Environment variables, add:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PIN`

Choose a strong private PIN for Student Affairs.

## 4. Use the system

- Open `/admin.html`
- Enter the admin PIN
- Set the time window and location
- Click **Use My Current Location** while standing at the approved attendance point
- Create the session
- Display or share the QR code
- Students scan the QR and submit attendance
- Refresh the log and export Excel when needed

## Important notes

- The website must run on HTTPS for browser geolocation. Netlify provides HTTPS.
- Browser location can be spoofed by advanced users. This is a lightweight operational tool, not an exam-security system.
- The Student ID is used to prevent duplicate attendance within the same session.
- Location accuracy depends on the student's device and environment.
