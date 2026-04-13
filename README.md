# Fitness Tracking App

## Description

**FitPro** is a cross-platform mobile app built with **Expo** and **React Native** (TypeScript) for **CSCI 380**. It supports multiple user roles—**members**, **trainers**, and **admins**—each with tailored flows behind a shared authentication layer.

- **Members** can use a home dashboard with workout tracking, progress views, and profile-related content.
- **Trainers** can manage a client roster, build workouts, schedule sessions, and use messaging-oriented screens.
- **Admins** can access management and oversight screens (e.g. users, trainers, analytics, and system settings).

Navigation uses **React Navigation** (stacks and tabs); local state and auth are wired through an **Auth** context. The app is intended as a fitness-coaching and tracking experience with role-based access, not a production backend—data flows are structured for UI and course demonstration.

### Tech stack

- Expo ~54, React Native, TypeScript  
- React Navigation, Async Storage, gesture handler & safe area  

### Run locally

```bash
npm install
npm start
```

Then open the project in the Expo dev tools and run on iOS, Android, or web as needed.
# CSCI-380-FITNESS-APP
