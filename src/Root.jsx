import { Outlet } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Root = () => {
    return (
        <div>
            <Navbar></Navbar>
            <Outlet>
                <HomePage></HomePage>
            </Outlet>
            <Footer></Footer>
        </div>
    );
};

export default Root;