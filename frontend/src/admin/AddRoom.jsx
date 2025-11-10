import React, { useState, useEffect } from "react";
import { addRoom, getRoomTypes } from "../../service/ApiService";
import { Link } from "react-router-dom";

const AddRoom = () => {
    const [newRoom, setNewRoom] = useState({
        photo: null,
        roomType: "",
        roomPrice: ""
    });
    const [imagePreview, setImagePreview] = useState("");
    const [roomTypes, setRoomTypes] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        getRoomTypes().then(data => {
            setRoomTypes(data);
        }).catch(error => console.error("Error fetching room types:", error));
    }, []);

    const handleRoomInputChange = (e) => {
        const { name, value } = e.target;
        setNewRoom({ ...newRoom, [name]: value });
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setNewRoom({ ...newRoom, photo: selectedImage });
        setImagePreview(URL.createObjectURL(selectedImage));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const success = await addRoom(newRoom.photo, newRoom.roomType, newRoom.roomPrice);
            if (success) {
                setSuccessMessage("A new room was added successfully!");
                setNewRoom({ photo: null, roomType: "", roomPrice: "" });
                setImagePreview("");
                setErrorMessage("");
            } else {
                setErrorMessage("Error adding new room");
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
        setTimeout(() => {
            setSuccessMessage("");
            setErrorMessage("");
        }, 3000);
    };

    return (
        <section className="container mx-auto mt-5 mb-5">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Add a New Room</h2>
                {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{successMessage}</div>}
                {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{errorMessage}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="roomType" className="block text-gray-700 text-sm font-bold mb-2">Room Type</label>
                        <select id="roomType" name="roomType" value={newRoom.roomType} onChange={handleRoomInputChange} className="w-full px-3 py-2 border rounded-md">
                            <option value="">Select a room type</option>
                            {roomTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="roomPrice" className="block text-gray-700 text-sm font-bold mb-2">Room Price</label>
                        <input type="number" id="roomPrice" name="roomPrice" value={newRoom.roomPrice} onChange={handleRoomInputChange} className="w-full px-3 py-2 border rounded-md" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="photo" className="block text-gray-700 text-sm font-bold mb-2">Room Photo</label>
                        <input id="photo" name="photo" type="file" onChange={handleImageChange} className="w-full px-3 py-2 border rounded-md" />
                        {imagePreview && <img src={imagePreview} alt="Room Preview" className="mt-4 max-h-48 rounded-md" />}
                    </div>
                    <div className="flex items-center justify-between">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Save Room</button>
                        <Link to={"/admin"} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">Back to Admin</Link>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default AddRoom;