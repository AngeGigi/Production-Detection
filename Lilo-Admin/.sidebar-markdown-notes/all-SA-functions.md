# Clean Archi -- SA 
all the functions as of 1-17

<br>

>- [x] LOGIN
-- login function
-- forgot password and reset password using email whitepochaco (to edit, go to env)

>- [x] NOTICE IN BOTH SUPERADMIN AND ADMIN
-- image and file in register
-- image and file displayed in tables
-- image and file in notif box superadmin
-- image and file in notif box admin
-- schedule message function
-- search function

<br>

>- [x] DASHBOARD
-- company count
-- trial, pro, premium
-- home, office
-- gps, extended user, api log, loc tracking
-- recently added
-- daily usage 
-- list of companies na mag eexpire na latest 5
-- kulang: daily usage and chart

<br>

>- [x] COMPANY LIST
-- all the company
-- edit and delete function

<br>

>- [x] SUBSCRIBERS
-- table for schedule messages
-- registr admin
-- register company
-- create notice

<br>

>- [x] REPORTS
-- date from and to filter (the  to shoukd not mas mataas sa from and future dates are not available to select)
-- export logs
-- table (has a order of expiration)
-- add automate notice if the exp is one week, 3 dyas, one week
-- indication in reports to see if notif has been sent or not


<br>

>- [x] EXPIRATION NOTIF
-- working using pm2
-- check if notice is existed before sending to avoid duplicates
-- has a notif for 7 days, 3 days, one day, expired
-- go to runNotificationCheck and NotificationService in service folder to see the functions


<br>


>- [x] SETTINGS
-- change password