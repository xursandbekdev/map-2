import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-blue-600 p-4">
            <ul className="flex space-x-4">
                <li>
                    <Link
                        to="/"
                        className="text-white font-semibold hover:text-gray-200 hover:underline "
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <Link
                        to="/taxi"
                        className="text-white font-semibold hover:text-gray-200 hover:underline "
                    >
                        Taxi Map
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
