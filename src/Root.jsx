import { Outlet } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import Navbar from "./components/Navbar";

const Root = () => {
    return (
        <div>
            <Navbar></Navbar>
            <Outlet>
                <HomePage></HomePage>
            </Outlet>
        </div>
    );
};

export default Root;