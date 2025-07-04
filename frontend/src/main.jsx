import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/app/App.jsx";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/user-context.jsx";
import './index.css';
import 'flowbite';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);