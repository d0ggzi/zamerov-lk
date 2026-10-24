import {useState} from "react";
import Nav from "../nav/Nav.jsx";
import {Outlet} from "react-router-dom";
import Sidebar from "../sidebar/Sidebar.jsx";

function PageWrapper() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <Nav onToggleSidebar={() => setSidebarOpen((open) => !open)}/>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
            <div className="p-4 sm:ml-64 mt-14">
                <Outlet/>
            </div>
        </>
    );
}

export default PageWrapper;
