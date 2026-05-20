# CuraMind Frontend
- This is the frontend for the CuraMind application, built with React, TypeScript, and Tailwind CSS.
- It provides a modern and responsive user interface for patients and doctors to interact with the CuraMind system.
- The frontend communicates with the backend APIs for authentication, health assessments, prediction results, doctor reviews, and follow-up management.


## Project Structure
```
frontend/
├── src/
│   ├── components/                   
│   │   ├── common/                       # Common reusable components (buttons, forms, modals, etc.)
│   │   ├── layout/                       # Layout components (header, footer, sidebar, etc.)
│   │   └── ui/                           # UI components (cards, tables, charts, etc.)
│   │
│   ├── contexts/                         # React contexts for global state management
│   ├── hooks/                            # Custom React hooks for data fetching, form handling, etc.
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx                 # Login page component
│   │   │   └── Register.tsx              # Registration page component
│   │   │
│   │   ├── patient/
│   │   │   ├── Dashboard.tsx             # Patient dashboard page component  
│   │   │   ├── HealthInput.tsx           # Health input form page component
│   │   │   ├── Predictions.tsx           # Prediction results page component
│   │   │   ├── Risk.tsx                  # Risk assessment page component
│   │   │   ├── Progress.tsx              # Progress tracking page component
│   │   │   ├── FollowUp.tsx              # Follow-up management page component
│   │   │   └── DoctorNotes.tsx           # Doctor notes page component
│   │   │
│   │   ├── doctor/
│   │   │   ├── Dashboard.tsx             # Doctor dashboard page component
│   │   │   ├── Queue.tsx                 # Doctor queue management page component
│   │   │   └── Review.tsx                # Doctor review page component
│   │   │
|   |   ├── admin/
|   |   │   └── AdminDashboard.tsx        # Admin dashboard page component
|   |   │   
|   |   └── LandingPage.tsx               # Public landing page component
│   │   └── NotFound.tsx                  # 404 Not Found page component
│   │
│   ├── routes/                           # React Router route definitions
│   ├── services/                         # API functions for making HTTP requests to the backend    
│   ├── styles/                           # Global styles and Tailwind CSS configuration
│   ├── types/                            # TypeScript type definitions and interfaces
│   ├── utils/                            # Utility functions for data formatting, validation, etc.
│   │
│   ├── App.tsx                           # Main application component with route setup
│   ├── main.tsx                          # Entry point for React application
│   └── index.css                         # Global CSS styles
│
├── .env.example                          # Example environment variables file
├── index.html                            # HTML template for the React application
├── package.json                          # NPM package configuration file
├── package-lock.json                     # NPM package lock file
├── vite.config.js                        # Vite configuration file
├── tailwind.config.js                    # Tailwind CSS configuration file
├── postcss.config.js                     # PostCSS configuration file
├── eslint.config.js                      # ESLint configuration file
├── tsconfig.json                         # TypeScript configuration file
├── tsconfig.app.json                     # TypeScript configuration for application code
├── tsconfig.node.json                    # TypeScript configuration for Node.js code
│
└── README.md                             # Frontend project documentation
```

## API Integration
The frontend communicates with the backend APIs using HTTP requests. The API service functions are defined in the `src/services/` directory and utilize the Fetch API or Axios for making requests. Each service function corresponds to a specific backend endpoint and handles the necessary request parameters, headers, and response parsing.

