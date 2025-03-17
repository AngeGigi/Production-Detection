PUBLIC
> bootstrap
> files in notices
> script
> pics in front end
> styles>

SRC
> Adapters
   > Controllers
   > Repositories
   > Routes
   > Views
> Application
    > Services
    > Usecases
> Entities
> Frameworks
    > models
    > web
        - server.js
        > middleware
> Infrastructure
    - database.js
    > database


uses http://localhost:2024 for admin and superadmin
go to http://localhost:2024/admin/login for admin
go to http://localhost:2024/superadmin/login for superadmin

uses uses http://localhost:2023 for employee

use "nodemon src/app.js" to run the program
use node "src/application/services/runNotificationCheck.js" to run the pm2 / io
and use "npm start" to simultaneouly run both of them using concurrently 

to see the latest functions of superadmin, see the "all-SA-functions" in .sidebar-markdown-notes
to see the latest functions of admin, see the "all-admin-functions" in .sidebar-markdown-notes






LILO VERSION 2 - SuperAdmin and Admin
Description
This project is a web-based dashboard that allows SuperAdmin and Admin users 
to manage employees, companies, notices, reports, and various settings within the system. 

SUPERADMIN FEATURES
Login
Login functionality with forgot password and reset password via email.

Notice Management
Upload and display images and files in notices.
Schedule and send messages with image and file attachments.
View and manage notices in the notification box.

Dashboard
Company count and subscription status (trial, pro, premium).
Tracking of home/office locations, GPS, users, and logs.
Recently added companies and daily usage.
Expiration notification for the top 5 companies approaching their expiration.

Company Management
View all companies.
Edit and delete company information.
Export company data as CSV.

Subscriber Management
Manage schedule messages.
Register admin and companies.
Create notices for subscribers.

Reports
Filter reports by date range, ensuring no future dates are selected.
Export logs.
Display ordered tables and automated notice sending for expiring subscriptions.

Expiration Notifications
Automate and send notifications for expiring subscriptions (7 days, 3 days, 1 day, expired).
Run notification checks using PM2 to avoid duplicate notifications.

Settings
Change password functionality for SuperAdmin users.


ADMIN FEATURES
Login
Login functionality with forgot password and reset password via email.

Notice Management
Upload and manage images and files in the admin's notification box.
Schedule and search for notices.

Dashboard
Total number of employees, and employee statuses (active, inactive, pending).
Daily usage statistics.
Data on employees who logged in and logged out today.
Weekly data analysis and start map feature.

Employee Management
Register employees individually or in bulk.
Employee card and list views.
Export employee data.
Edit employee status, details, and delete employee records.
Edit and register departments with custom CSS.

Reports
DTR Logs: View daily time records (card and list views).
Rejected Logs: Manage rejected logs with date filters and export functionality.
Start of Day and End of Day Reports: Manage employees' login statuses, late arrivals, employees without log-out, etc.
Export and search options for logs.

Reviews
Does not have any functions yet.

Settings
Manage location tracking by adding, editing, and viewing locations.