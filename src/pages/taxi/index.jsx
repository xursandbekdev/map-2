import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const TaxiMap = () => {
    const [userLocation, setUserLocation] = useState(null); // User's current location
    const [searchQueryStart, setSearchQueryStart] = useState(""); // Starting location query
    const [searchQueryEnd, setSearchQueryEnd] = useState(""); // Destination location query
    const [suggestionsStart, setSuggestionsStart] = useState([]); // Suggestions for starting location
    const [suggestionsEnd, setSuggestionsEnd] = useState([]); // Suggestions for destination
    const [map, setMap] = useState(null); // The map instance
    const [markerStart, setMarkerStart] = useState(null); // Marker for the starting point
    const [markerEnd, setMarkerEnd] = useState(null); // Marker for the destination
    const [showInputStart, setShowInputStart] = useState(false); // Toggle for start location input
    const [showInputEnd, setShowInputEnd] = useState(false); // Toggle for end location input
    const [directions, setDirections] = useState(null); // Holds the step-by-step directions
    const [totalDistance, setTotalDistance] = useState(0); // Total distance of the route

    useEffect(() => {
        // Get the user's current location using the Geolocation API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([longitude, latitude]);
                },
                (error) => {
                    console.error("Error getting user location:", error);
                    setUserLocation([69.2401, 41.3111]); // Default to Tashkent
                }
            );
        } else {
            setUserLocation([69.2401, 41.3111]); // Default to Tashkent
        }
    }, []);

    useEffect(() => {
        // Initialize the map after the user's location is known
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
            setMarkerStart(initMarker);
        }
    }, [userLocation, map]);

    const handleSearchStart = async (e) => {
        const value = e.target.value;
        setSearchQueryStart(value);

        if (value.length < 3) {
            setSuggestionsStart([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    value
                )}&addressdetails=1&limit=5&countrycodes=UZ`
            );
            const results = await response.json();
            setSuggestionsStart(results);
        } catch (error) {
            console.error("Error fetching start location:", error);
        }
    };

    const handleSearchEnd = async (e) => {
        const value = e.target.value;
        setSearchQueryEnd(value);

        if (value.length < 3) {
            setSuggestionsEnd([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    value
                )}&addressdetails=1&limit=5&countrycodes=UZ`
            );
            const results = await response.json();
            setSuggestionsEnd(results);
        } catch (error) {
            console.error("Error fetching end location:", error);
        }
    };

    const handleSelectSuggestionStart = (lat, lon) => {
        const newLocation = [parseFloat(lon), parseFloat(lat)];

        // Move marker to the new starting location
        map.setCenter(newLocation);
        markerStart.setLngLat(newLocation);

        // Update user's location
        setUserLocation(newLocation);

        // Clear the input field and suggestions
        setSuggestionsStart([]);
        setSearchQueryStart("");
    };

    const handleSelectSuggestionEnd = async (lat, lon) => {
        const newLocationEnd = [parseFloat(lon), parseFloat(lat)];

        // Move marker to the new destination location
        if (!markerEnd) {
            const endMarker = new maplibregl.Marker({ color: "red" })
                .setLngLat(newLocationEnd)
                .addTo(map);
            setMarkerEnd(endMarker);
        } else {
            markerEnd.setLngLat(newLocationEnd);
        }

        // Clear the input field and suggestions
        setSuggestionsEnd([]);
        setSearchQueryEnd("");

        // Fetch route and directions between the two points
        await fetchRoute(userLocation, newLocationEnd);
    };

    const fetchRoute = async (start, end) => {
        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true`
            );
            const data = await response.json();
            const route = data.routes[0];

            // Draw the route on the map
            drawRoute(route.geometry);

            // Extract and set turn-by-turn directions including distance
            const detailedDirections = route.legs[0].steps.map((step) => ({
                instruction: step.maneuver.instruction,
                distance: step.distance, // distance in meters
                type: step.maneuver.type, // type of maneuver (e.g., turn, roundabout)
            }));
            setDirections(detailedDirections);

            // Calculate total distance
            const totalDistanceInMeters = route.legs.reduce(
                (acc, leg) => acc + leg.distance,
                0
            );
            setTotalDistance(totalDistanceInMeters); // Store total distance in meters
        } catch (error) {
            console.error("Error fetching the route:", error);
        }
    };

    const drawRoute = (geojson) => {
        // Remove previous route if any
        if (map.getSource("route")) {
            map.removeLayer("route");
            map.removeSource("route");
        }

        // Add new route layer to the map
        map.addSource("route", {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: geojson,
            },
        });

        map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": "#007cbf",
                "line-width": 4,
            },
        });
    };

    const handleToggleInputStart = () => {
        setShowInputStart((prev) => !prev);
    };

    const handleToggleInputEnd = () => {
        setShowInputEnd((prev) => !prev);
    };

    return (
        <div className="relative">
            {/* Button to toggle start location input */}
            <div className="absolute bottom-32 right-2 z-10">
                <button
                    className="bg-blue-500 text-white p-2 rounded shadow-md"
                    onClick={handleToggleInputStart}
                >
                    Boshlang'ich manzilni o'zgartirish
                </button>
            </div>

            {/* Button to toggle end location input */}
            <div className="absolute bottom-20 right-2 z-10">
                <button
                    className="bg-green-500 text-white p-2 rounded shadow-md"
                    onClick={handleToggleInputEnd}
                >
                    Boradigan manzilni kiriting
                </button>
            </div>

            {showInputStart && (
                <div className="w-full max-w-md mx-auto mb-4 z-50">
                    <input
                        type="text"
                        className="border-2 p-2 w-full rounded-md mb-2 outline-none border-gray-400 focus:border-blue-600 "
                        placeholder="Boshlang'ich manzilni kiriting..."
                        value={searchQueryStart}
                        onChange={handleSearchStart}
                    />
                    {suggestionsStart.length > 0 && (
                        <ul className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-50">
                            {suggestionsStart.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() =>
                                        handleSelectSuggestionStart(
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

            {showInputEnd && (
                <div className="w-full max-w-md mx-auto mb-4 z-50">
                    <input
                        type="text"
                        className="border-2 p-2 w-full rounded-md mb-2 outline-none border-gray-400 focus:border-blue-600 "
                        placeholder="Boradigan manzilni kiriting..."
                        value={searchQueryEnd}
                        onChange={handleSearchEnd}
                    />
                    {suggestionsEnd.length > 0 && (
                        <ul className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-50">
                            {suggestionsEnd.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() =>
                                        handleSelectSuggestionEnd(
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

            <div id="map" className="w-full h-screen" />

            {/* Directions display */}
            {directions && (
                <div className="absolute top-4 left-2 bg-white p-4 shadow-md rounded">
                    <h2 className="font-bold">Yo’nalishlar:</h2>
                    <ul>
                        {directions.map((step, index) => (
                            <li key={index} className="mb-2">
                                <span>{step.instruction}</span> -{" "}
                                <span>
                                    {(step.distance / 1000).toFixed(2)} km
                                </span>
                            </li>
                        ))}
                    </ul>
                    {/* Total distance */}
                    <div className="font-bold mt-2">
                        Umumiy masofa: {(totalDistance / 1000).toFixed(2)} km
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxiMap;
