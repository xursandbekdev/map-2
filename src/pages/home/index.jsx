import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const handleBtn = () => {
        navigate("/taxi");
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">
                Mini taksi ilovasi
            </h1>
            <p className="text-lg text-gray-700">
                1-qism bunda Openstreetmap orqali locatsiyani o'zgartirish
                funksiyasi mavjud
            </p>
            <button className=" mt-4 px-5 py-3 rounded bg-blue-600 text-white outline-none "
               onClick={handleBtn}
            >
                Maps ga o'tish
            </button>
        </div>
    );
};

export default Home;
