import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/app/App.jsx";
import {BrowserRouter} from "react-router-dom";
import {UserProvider} from "./context/user-context.jsx";
import ErrorBoundary from "./components/error-boundary/ErrorBoundary.jsx";
import './index.css';
import posthog from 'posthog-js';
import { PostHogProvider } from '@posthog/react'

posthog.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  defaults: '2026-01-30',
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ErrorBoundary>
            <PostHogProvider client={posthog}>
                <BrowserRouter>
                    <UserProvider>
                        <App/>
                    </UserProvider>
                </BrowserRouter>
            </PostHogProvider>
        </ErrorBoundary>
    </React.StrictMode>
);