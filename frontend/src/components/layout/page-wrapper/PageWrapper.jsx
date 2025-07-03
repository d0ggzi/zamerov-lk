import Nav from "../nav/Nav.jsx";
import {Outlet} from "react-router-dom";
import Sidebar from "../sidebar/Sidebar.jsx";

function PageWrapper() {
    return (
        <>
            <Nav/>
            <Sidebar/>
            <div className="p-4 sm:ml-64 mt-14">
                <Outlet/>
            </div>
        </>
    );
}

export default PageWrapper;