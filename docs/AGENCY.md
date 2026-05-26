# GoCar — Agency Role

Documentation for the **Agency** role. Agencies are rental businesses that list vehicles, manage drivers, and handle bookings on the platform.

---

## Table of Contents

- [Overview](#overview)
- [Routes](#routes)
- [Features](#features)
  - [Sign Up](#sign-up)
  - [Dashboard](#dashboard)
  - [Fleet Management](#fleet-management)
  - [Bookings](#bookings)
  - [Driver Management](#driver-management)
  - [Damage Reports](#damage-reports)
  - [Reviews & Ratings](#reviews--ratings)
  - [Profile Management](#profile-management)
  - [Notifications & Chat](#notifications--chat)
- [Screenshots](#screenshots)

---

## Overview

Agencies are the supply side of GoCar. An agency owner registers the business, lists their vehicle fleet (cars and bikes), manages a pool of drivers, and handles incoming bookings. The agency dashboard provides real-time stats, booking management, fleet status, driver oversight, and customer reviews.

---

## Routes

### Sign Up

| Path | Step |
|---|---|
| `/sign-up/agency` | Start agency registration |
| `/sign-up/agency/email-verification` | Verify email |
| `/sign-up/agency/personal-info` | Owner personal info |
| `/sign-up/agency/driving-info` | Agency business info (TIN, trade license) |
| `/sign-up/agency/photo-upload` | Owner & agency photos |
| `/sign-up/agency/information-review` | Review & submit |

### Agency Dashboard (login required)

| Path | Page |
|---|---|
| `/dashboard/agency` | Dashboard home |
| `/dashboard/agency/profile` | Owner & agency profile |
| `/dashboard/agency/vehicles` | Fleet management |
| `/dashboard/agency/vehicles/:id` | Vehicle detail |
| `/dashboard/agency/add-cars` | Add new vehicle |
| `/dashboard/agency/bookings` | Booking management |
| `/dashboard/agency/bookings/:id` | Booking detail |
| `/dashboard/agency/drivers` | Driver management |
| `/dashboard/agency/damage-reports` | Fleet damage reports |
| `/dashboard/agency/reviews` | Agency reviews & ratings |
| `/dashboard/notifications` | Notification centre |
| `/dashboard/chat` | In-app messaging |

---

## Features

### Sign Up

Multi-step agency registration:

1. Enter business email
2. Email verification
3. Owner personal information (name, NID, date of birth)
4. Agency business details (agency name, TIN, trade license, business address)
5. Upload owner and agency photos
6. Review and submit for admin approval

Agency accounts enter a **pending** state until an admin verifies the business documents.

---

### Dashboard

The agency dashboard home (`/dashboard/agency`) provides:

- **Summary stats** — total vehicles, active bookings, revenue this month, driver count
- **Revenue trend chart** — earnings over time
- **Active bookings** — quick list of in-progress rentals
- **Fleet status** — available vs booked vs maintenance
- **Driver overview** — available vs on-trip drivers
- **Recent damage** — latest damage reports
- **Recent reviews** — latest customer feedback

---

### Fleet Management

From `/dashboard/agency/vehicles`:

- **Add vehicle** (`/dashboard/agency/add-cars`) — fill in specs, documentation (license, insurance, fitness certificate), photos, and rental price
- **Edit vehicle** — update status (available / maintenance / unavailable), price, and description
- **View vehicle detail** — full spec sheet with documentation status and booking history
- **Filter fleet** — by status, type, brand

Vehicles become searchable by users once status is set to **available** and documentation is verified.

---

### Bookings

From `/dashboard/agency/bookings`:

- View all incoming and active bookings
- **Accept / reject** pending booking requests
- **Update booking status** — confirm → ongoing → completed
- View full booking detail including user info, vehicle, dates, driver assignment, and payment
- Coordinate with assigned driver via in-app chat

---

### Driver Management

From `/dashboard/agency/drivers`:

- View all drivers registered under the agency
- Assign drivers to available vehicles
- **Suspend** a driver (temporarily remove from assignment pool)
- **Remove** a driver from the agency
- Register a new driver (`POST /api/driverRoutes/createDriver`)
- Monitor driver availability and active trip status

---

### Damage Reports

From `/dashboard/agency/damage-reports`:

- View all damage reports for agency vehicles
- **Create pickup form** — record vehicle condition (fuel level, odometer, photos) before handing to user
- **Create return form** — record condition at vehicle return
- **Update damage status** — reported → under_review → resolved / disputed
- **Charge user** for damage costs
- Identify repeat-damage vehicles
- Bulk update report statuses

---

### Reviews & Ratings

From `/dashboard/agency/reviews`:

- View all reviews for the agency itself
- View reviews for each vehicle in the fleet
- View reviews for drivers under the agency
- Aggregated rating stats (average, distribution by stars)
- Filter by vehicle or driver

---

### Profile Management

From `/dashboard/agency/profile`:

**Owner info:**
- Name, photo, NID, date of birth, phone, address

**Agency info:**
- Agency name, description, logo
- Business address (with map)
- TIN, trade license number and expiry date
- Operational status (managed by admin)

---

### Notifications & Chat

- Real-time notifications for new bookings, payments, and damage updates at `/dashboard/notifications`
- In-app SendBird messaging at `/dashboard/chat` — communicate directly with users and drivers per booking

---

## Screenshots

### Dashboard Home

![Agency Dashboard](screenshots/agency_dashboard.png)

---

### Fleet Management

| Vehicle List | Vehicle Detail | Add Vehicle |
|---|---|---|
| ![Fleet](screenshots/agency_fleet.png) | ![Detail](screenshots/agency_vehicle_detail.png) | ![Add](screenshots/agency_add_vehicle.png) |

---

### Bookings

| Booking List | Booking Detail |
|---|---|
| ![Bookings](screenshots/agency_bookings.png) | ![Detail](screenshots/agency_booking_detail.png) |

---

### Driver Management

![Drivers](screenshots/agency_drivers.png)

---

### Damage Reports

| Damage List | Damage Detail | Pickup Form |
|---|---|---|
| ![Damage](screenshots/agency_damage_list.png) | ![Detail](screenshots/agency_damage_detail.png) | ![Pickup](screenshots/agency_pickup_form.png) |

---

### Reviews

![Agency Reviews](screenshots/agency_reviews.png)

---

### Profile

| Owner Profile | Agency Info |
|---|---|
| ![Owner](screenshots/agency_owner_profile.png) | ![Agency](screenshots/agency_info.png) |

---

> Replace placeholder paths with actual screenshots once captured.
