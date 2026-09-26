# Privacy Policy for Secure Ambulance (Arvaya Driver App)

**Application:** Secure Ambulance / Arvaya Driver App  
**Package Name:** `com.secureambulance`  
**Effective Date:** September 24, 2026  
**Last Updated:** September 24, 2026  

---

This Privacy Policy explains how **Secure Ambulance** (also operating under the **Arvaya Ambulance Tracking System** ecosystem) ("we", "us", or "our") collects, uses, stores, and protects personal and telemetry data when you use the **Secure Ambulance** mobile application designed for licensed drivers and emergency medical personnel.

We are dedicated to safeguarding the privacy and confidentiality of our ambulance drivers, EMTs, dispatchers, and the patients we transport.

---

## 1. Important Disclosure: Real-Time & Background Location Tracking

> ### 🚨 CRITICAL GOOGLE PLAY PROMINENT LOCATION DISCLOSURE:
> **Secure Ambulance** collects real-time location data (including in the background and via foreground services) to enable:
> 1. **Automated Emergency Dispatch:** Locating the nearest available ambulance to dispatch to critically ill or injured patients with minimum latency (< 5-10 minutes target response).
> 2. **Live Turn-by-Turn Navigation:** Routing emergency responders to the patient pickup point and hospital destination.
> 3. **Live Patient Tracking & Safety:** Allowing patients and hospital triage teams to view the approaching ambulance's real-time ETA and route.
>
> **Location tracking occurs even when the app is closed or running in the background**, as long as your driver status is set to **"ONLINE"** or while handling an active emergency trip. Background location tracking is automatically suspended when you toggle your status to **"OFFLINE"**.

---

## 2. Information We Collect

To operate an authorized, verified, and safe emergency ambulance service, we collect the following types of information:

### A. Location Information (Precise and Coarse)
- **Continuous GPS Coordinates:** Real-time latitude, longitude, speed, heading, and altitude gathered via high-accuracy GPS and network triangulation.
- **Foreground & Background Tracking:** Location updates running as a foreground service with a persistent notification (via `FOREGROUND_SERVICE_LOCATION` and `ACCESS_BACKGROUND_LOCATION`).

### B. Driver Profile & Identity Data
- **Account Details:** Full name, verified mobile phone number, email address, profile photo, and emergency contact numbers.
- **Identity & Verification Documents:** Driver's license number, expiry date, digital copies/photos of commercial driving license.

### C. Vehicle & Compliance Documents
- **Vehicle Metadata:** Ambulance registration number (plate number), vehicle class/type (Basic Life Support, Advanced Life Support, Patient Transport).
- **Regulatory Documents:** Vehicle Registration Certificate (RC), commercial vehicle insurance policy, fitness certificates, and pollution under control (PUC) certificates.

### D. Operational, Trip & Dispatch Data
- **Trip Records:** Timestamped incident logs, assigned route paths, patient pickup and destination coordinates, trip duration, odometer distance, and pickup OTP verification logs.
- **Duty Status:** Timestamps when driver toggles Online / Offline / On-Break.

### E. Device, Technical & Diagnostic Information
- **Device Identifiers:** Firebase Cloud Messaging (FCM) registration token, device model, operating system version, screen resolution, and IP address.
- **Diagnostics & Telemetry:** Battery level, GPS signal accuracy, network connectivity state, and crash error logs.

---

## 3. How We Use Your Information

All collected data is strictly utilized to operate and improve emergency response operations:
- **Emergency Assignment:** Matching critical 108/emergency SOS patient requests to the nearest driver to minimize response time.
- **Live Navigation & ETAs:** Calculating optimal routing and real-time arrival estimates using mapping integrations.
- **Verification & Patient Safety:** Authenticating patient handovers at the scene via secure digital One-Time Passwords (OTP).
- **Hospital Pre-Arrival Coordination:** Notifying receiving emergency departments of incoming critical cases and estimated arrival times.
- **Regulatory Compliance & Audits:** Maintaining official transport logs, patient transfer compliance records, and driver verification records.
- **Compensation & Earnings:** Computing duty hours, distance traveled, and driver remuneration.

---

## 4. Android Permissions Utilized

| Permission | Classification | Operational Justification |
| :--- | :--- | :--- |
| `ACCESS_FINE_LOCATION`<br>`ACCESS_COARSE_LOCATION` | Location | Captures high-accuracy GPS coordinates for real-time dispatch and turn-by-turn routing to patients and hospitals. |
| `ACCESS_BACKGROUND_LOCATION` | Location (Background) | Enables dispatchers to assign emergency calls to nearest available units and updates the patient live even when the app is minimized. |
| `FOREGROUND_SERVICE`<br>`FOREGROUND_SERVICE_LOCATION` | Foreground Service | Runs continuous high-reliability location tracking during active emergency dispatches and duty hours with an ongoing notification. |
| `POST_NOTIFICATIONS` | Notifications | Sends urgent emergency trip alerts, critical status updates, and dispatch sound alerts. |
| `INTERNET`<br>`ACCESS_NETWORK_STATE` | Network | Communicates securely with central dispatch servers and API endpoints. |
| `WAKE_LOCK` | Device Power | Prevents the processor from sleeping during vital emergency dispatch events and route navigation. |

---

## 5. Data Sharing and Third-Party Disclosures

We do **NOT** sell, rent, monetize, or trade driver or user personal data to advertisers or commercial third parties. Data is shared strictly on a need-to-know basis as follows:

1. **With Assigned Patients:** During an active trip, the assigned patient can view the driver's first name, vehicle registration number, and live vehicle location on their map.
2. **With Central Dispatchers & Hospitals:** Operations teams and emergency triage doctors view your duty status, real-time location, and hospital arrival ETA.
3. **Third-Party Technology Providers:**
   - **Google Maps Platform (Google LLC):** Used for mapping, geolocation, reverse geocoding, and directions ([Google Privacy Policy](https://policies.google.com/privacy)).
   - **Firebase Cloud Messaging (Google LLC):** Used to deliver push notifications for critical dispatch assignments.
4. **Legal & Emergency Mandates:** Data may be disclosed to law enforcement, road safety regulators, or health authorities if required by law or during a verified medical catastrophe.

---

## 6. Data Retention, Storage & Security

- **Encryption:** All network traffic between the mobile application and our servers is encrypted using industry-standard Transport Layer Security (TLS 1.3 / HTTPS).
- **Storage Security:** Authentication tokens and sensitive session data are stored securely on the device using sandboxed, encrypted storage.
- **Retention Period:** Active driver profile data is retained as long as the driver maintains an active account with the organization. Trip records, GPS breadcrumbs, and compliance logs are retained for a minimum statutory period (typically 3–5 years) to satisfy emergency medical transport and legal auditing requirements.

---

## 7. User Rights & Data Deletion Request (Google Play Compliance)

In accordance with Google Play Developer Policies and global data protection regulations, drivers and users hold the following rights:

- **Right to Access & Rectify:** You can view and update your profile details, vehicle documents, and credentials directly within the app's Profile section.
- **Right to Withdraw Location Consent:** You can turn off duty mode by toggling to "OFFLINE" or revoke location permissions at any time via Android device settings (note: being Online is required to receive trip assignments).
- **Account & Data Deletion:** You have the right to request deletion of your account and personal data.  
  To initiate an account or data deletion request:
  1. Send an email to **privacy@arvaya.com** or **support@uvtechsoft.com** with the subject line *"Account Deletion Request - Secure Ambulance"*.
  2. Specify your registered mobile number and driver ID.
  3. Upon verification, your profile, credentials, and authentication records will be permanently deleted or anonymized within thirty (30) business days, except for non-identifiable trip audit records required by law.

---

## 8. Children's Privacy

The **Secure Ambulance** driver application is exclusively designed for certified, licensed adult commercial drivers and emergency medical responders. The app is not directed at or intended for children under the age of 18, and we do not knowingly collect personal information from minors.

---

## 9. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect operational, legal, or regulatory modifications. Any changes will become effective when published with a revised "Last Updated" date. In case of material changes, we will notify drivers via an in-app notice or push alert.

---

## 10. Contact Us & Grievance Redressal

If you have any questions, concerns, feedback, or complaints regarding this Privacy Policy or our data handling practices, please contact our Privacy & Compliance Officer:

- **Organization:** Arvaya Ambulance Tracking System / UVTechSoft
- **App:** Secure Ambulance (`com.secureambulance`)
- **Email:** [privacy@arvaya.com](mailto:privacy@arvaya.com) / [support@uvtechsoft.com](mailto:support@uvtechsoft.com)
- **Helpdesk Phone:** +91 80 1234 5678
- **Website:** [https://arvaya.uvtechsoft.com](https://arvaya.uvtechsoft.com)

---
*© 2026 Arvaya Inc. / UVTechSoft. All rights reserved.*  
*Secure Ambulance – Care · Track · Save Lives*
