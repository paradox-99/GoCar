# GoCar — Admin Role

Documentation for the **Admin** role. Admins have full visibility and control over the entire GoCar platform.

---

## Table of Contents

- [Overview](#overview)
- [Routes](#routes)
- [Features](#features)
  - [Dashboard](#dashboard)
  - [User Management](#user-management)
  - [Vehicle Management](#vehicle-management)
  - [Agency Management](#agency-management)
  - [Driver Management](#driver-management)
  - [Booking Management](#booking-management)
  - [Payment Tracking](#payment-tracking)
  - [Review Moderation](#review-moderation)
  - [Damage Management](#damage-management)
  - [License Approvals & Verification](#license-approvals--verification)
  - [Notifications](#notifications)
  - [Address Management](#address-management)
  - [Analytics & Reports](#analytics--reports)
  - [Platform Settings](#platform-settings)
- [Screenshots](#screenshots)

---

## Overview

Admins oversee every aspect of the GoCar platform. From verifying agencies and drivers to resolving booking disputes, monitoring revenue, and configuring platform settings — the admin dashboard is the operational control centre of the application.

---

## Routes

All admin routes are protected and require the `admin` role.

| Path | Page |
|---|---|
| `/dashboard/admin` | Admin dashboard home |
| `/dashboard/admin/users` | User management |
| `/dashboard/admin/users/:id` | User detail |
| `/dashboard/admin/vehicles` | Vehicle management |
| `/dashboard/admin/vehicles/:id` | Vehicle detail |
| `/dashboard/admin/agencies` | Agency management |
| `/dashboard/admin/agencies/:id` | Agency detail |
| `/dashboard/admin/drivers` | Driver management |
| `/dashboard/admin/drivers/:id` | Driver detail |
| `/dashboard/admin/bookings` | All bookings |
| `/dashboard/admin/payments` | Payment records |
| `/dashboard/admin/reviews` | Review moderation |
| `/dashboard/admin/damage-reports` | Damage claim management |
| `/dashboard/admin/notifications` | System notifications |
| `/dashboard/admin/address` | Address / location management |
| `/dashboard/admin/license-approvals` | License verification queue |
| `/dashboard/admin/verification-queue` | Document verification queue |
| `/dashboard/admin/reports` | Analytics & reports |
| `/dashboard/admin/settings` | Platform settings |

---

## Features

### Dashboard

The admin dashboard home (`/dashboard/admin`) aggregates platform-wide data:

- **KPI cards** — total users, active agencies, ongoing bookings, revenue today
- **Revenue chart** — daily/weekly/monthly revenue trend
- **Recent bookings** — latest booking activity with status badges
- **Recent damage reports** — newly submitted damage claims
- **Upcoming bookings** — bookings starting in the next 24–48 hours
- **Top performers** — highest-rated agencies and drivers
- **Revenue by payment method** — breakdown by bKash, Nagad, Rocket, Card, Cash
- **Global search** — search users, agencies, bookings, and vehicles from one bar
- **Booking calendar** — monthly calendar view of all bookings

---

### User Management

From `/dashboard/admin/users`:

- **Filtered list** — search and filter by role, status, city, date joined
- **User detail** (`/dashboard/admin/users/:id`) — full profile, contact info, license status, booking history
- **Update user** — change account status (active / suspended / pending / deleted), role assignment
- **View bookings** — all bookings made by a specific user

---

### Vehicle Management

From `/dashboard/admin/vehicles`:

- **Car list** and **bike list** with filtering
- **Vehicle detail** — full specs, documentation (license, insurance, fitness certificate) with validity status, agency owner, booking history
- **Update car/bike status** — set to available / maintenance / unavailable / booked
- Monitor documentation expiry and flag expired records

---

### Agency Management

From `/dashboard/admin/agencies`:

- **Filtered list** — filter by status (active / inactive / suspended / pending), city
- **Agency detail** (`/dashboard/admin/agencies/:id`) — owner info, business documents (TIN, trade license), address, fleet size, driver count, reviews, booking history
- **Update agency** — change status, verify documents, add admin notes
- **Cities with agencies** — location-based overview

---

### Driver Management

From `/dashboard/admin/drivers`:

- **Full driver list** with search and filters
- **Driver detail** (`/dashboard/admin/drivers/:id`) — personal info, NID, license details, agency affiliation, trip history, ratings
- **Verify driver** — approve license and background check
- **Update driver info** — correction of details, status changes
- License expiry tracking and renewal reminders

---

### Booking Management

From `/dashboard/admin/bookings`:

- All bookings across the platform with status filtering
- **Booking detail** — full record: user, agency, vehicle, driver, dates, status timeline, payment, damage reports
- **Admin update** — override booking status for dispute resolution
- Export booking data

---

### Payment Tracking

From `/dashboard/admin/payments`:

- **Payment history** — all transactions with method, amount, date, booking reference
- **Filtered list** — filter by payment method, date range, status
- **Payment stats** — total collected, pending, refunded
- **Revenue analytics** — trends and breakdowns
- **Payment detail** — individual transaction record with SSLCommerz transaction ID

---

### Review Moderation

From `/dashboard/admin/reviews`:

- View all reviews across vehicles, drivers, and agencies
- **Review detail** — full text, rating, booking reference, reviewer info
- **Moderation actions** — flag, hide, or remove inappropriate reviews
- **Review analytics** — distribution, average ratings over time, most-reviewed entities

---

### Damage Management

From `/dashboard/admin/damage-reports`:

- All damage reports platform-wide
- **Damage detail** — severity, status, photos, cost estimate, booking reference
- **Update status** — reported → under_review → resolved / disputed
- **Damage analytics** — most-damaged vehicles, severity trends, cost tracking
- Identify agencies or vehicles with high damage frequency

---

### License Approvals & Verification

**License Approvals** (`/dashboard/admin/license-approvals`):

- Queue of user and driver licenses awaiting review
- Approve or reject with status update (valid / expired / suspended)
- Bulk approve/reject actions
- License expiry analytics

**Verification Queue** (`/dashboard/admin/verification-queue`):

- Documents awaiting admin verification (agency trade licenses, TINs, driver NIDs)
- Stats: total pending, approved this week, rejection rate

---

### Notifications

From `/dashboard/admin/notifications`:

- View all system notifications
- **Broadcast notifications** — send to specific users, all users, agencies, or drivers
- **Bulk delete** — clear old notifications
- **Notification analytics** — delivery stats, open rates
- **Recipient search** — search for specific notification targets

---

### Address Management

From `/dashboard/admin/address`:

- List of all addresses registered on the platform (users, agencies, drivers)
- **Address stats** — distribution by city
- **Map view** — geographic spread of registrations
- **Cities list** — cities with active users/agencies
- **Bulk delete** — remove stale or orphaned address records

---

### Analytics & Reports

From `/dashboard/admin/reports`:

Dedicated analytics views per domain:

| Report | What It Shows |
|---|---|
| **Revenue** | Daily/monthly revenue, payment method breakdown, growth rate |
| **Bookings** | Booking volume, completion rate, average duration |
| **Cancellations** | Cancellation rate, reasons, patterns |
| **Drivers** | Active driver count, top earners, trip completion rate |
| **Agencies** | Fleet utilisation, revenue per agency, rating trends |
| **Vehicles** | Most-booked vehicles, availability rate, damage frequency |

Data can be filtered by date range and exported.

---

### Platform Settings

From `/dashboard/admin/settings`:

**Admin profile:**
- View and update admin name, email, photo
- Change password

**Other admins:**
- List all admin accounts
- Update admin permissions

**Notification preferences:**
- Configure which system events trigger admin notifications

**Activity log:**
- Full audit trail of admin actions (entity type, action, timestamp, before/after state)

**Platform settings:**
- Key-value config store for platform-wide settings (stored as JSONB)
- Update operational parameters without a code deploy

---

## Screenshots

### Dashboard Home

![Admin Dashboard](screenshots/admin_dashboard.png)

---

### KPI Cards & Revenue Chart

| KPI Overview | Revenue Chart |
|---|---|
| ![KPIs](screenshots/admin_kpis.png) | ![Revenue](screenshots/admin_revenue_chart.png) |

---

### User Management

| User List | User Detail |
|---|---|
| ![Users](screenshots/admin_users.png) | ![Detail](screenshots/admin_user_detail.png) |

---

### Vehicle Management

| Vehicle List | Vehicle Detail |
|---|---|
| ![Vehicles](screenshots/admin_vehicles.png) | ![Detail](screenshots/admin_vehicle_detail.png) |

---

### Agency Management

| Agency List | Agency Detail |
|---|---|
| ![Agencies](screenshots/admin_agencies.png) | ![Detail](screenshots/admin_agency_detail.png) |

---

### Driver Management

| Driver List | Driver Detail |
|---|---|
| ![Drivers](screenshots/admin_drivers.png) | ![Detail](screenshots/admin_driver_detail.png) |

---

### Booking Management

![Bookings](screenshots/admin_bookings.png)

---

### Payments

| Payment List | Payment Analytics |
|---|---|
| ![Payments](screenshots/admin_payments.png) | ![Analytics](screenshots/admin_payment_analytics.png) |

---

### Review Moderation

![Reviews](screenshots/admin_reviews.png)

---

### Damage Reports

| Damage List | Damage Detail |
|---|---|
| ![Damage](screenshots/admin_damage.png) | ![Detail](screenshots/admin_damage_detail.png) |

---

### License Approvals

![License Approvals](screenshots/admin_license_approvals.png)

---

### Analytics & Reports

| Revenue | Bookings | Vehicles |
|---|---|---|
| ![Revenue](screenshots/admin_analytics_revenue.png) | ![Bookings](screenshots/admin_analytics_bookings.png) | ![Vehicles](screenshots/admin_analytics_vehicles.png) |

---

### Platform Settings

| Profile | Activity Log |
|---|---|
| ![Settings](screenshots/admin_settings.png) | ![Log](screenshots/admin_activity_log.png) |

---

> Replace placeholder paths with actual screenshots once captured.
