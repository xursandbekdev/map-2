import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const TaxiMap = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([longitude, latitude]);
                },
                (error) => {
                    console.error("Joylashuvni aniqlashda xatolik:", error);
                    setUserLocation([69.2401, 41.3111]);
                }
            );
        } else {
            setUserLocation([69.2401, 41.3111]);
        }
    }, []);

    useEffect(() => {
        if (userLocation && !map) {
            const initMap = new maplibregl.Map({
                container: "map",
                style: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
                center: userLocation,
                zoom: 12,
            });

            initMap.addControl(new maplibregl.NavigationControl());

            const initMarker = new maplibregl.Marker({ color: "blue" })
                .setLngLat(userLocation)
                .addTo(initMap);

            setMap(initMap);
            setMarker(initMarker);
        }
    }, [userLocation, map]);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    value
                )}&addressdetails=1&limit=5&countrycodes=UZ`
            );
            const results = await response.json();
            setSuggestions(results);
        } catch (error) {
            console.error("Qidiruvda xatolik:", error);
        }
    };

    const handleSelectSuggestion = (lat, lon) => {
        const newLocation = [parseFloat(lon), parseFloat(lat)];

        map.setCenter(newLocation);

        marker.setLngLat(newLocation);

        setUserLocation(newLocation);

        setSuggestions([]);
        setSearchQuery("");
    };

    const handleToggleInput = () => {
        setShowInput((prev) => !prev);
    };

    return (
        <div className="relative">
            <div className="absolute bottom-32 right-2 z-10">
                <button
                    className="bg-blue-500 text-white p-2 rounded shadow-md"
                    onClick={handleToggleInput}
                >
                    Manzilni o'zgartirish
                </button>
            </div>
            {showInput && (
                <div className=" w-full max-w-md mx-auto mb-4 z-50">
                    <input
                        type="text"
                        className="border-2 p-2 w-full rounded-md mb-2 outline-none border-gray-400 focus:border-blue-600 "
                        placeholder="Manzilni kiriting..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    {suggestions.length > 0 && (
                        <ul className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-50">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() =>
                                        handleSelectSuggestion(
                                            suggestion.lat,
                                            suggestion.lon
                                        )
                                    }
                                >
                                    {suggestion.display_name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div id="map" className="w-full min-h-screen mt-6" />
        </div>
    );
};

export default TaxiMap;
