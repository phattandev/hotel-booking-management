import React, { useState, useEffect } from 'react';
import { getRoomById, updateRoom, getRoomTypes } from '../../service/ApiService';
import { useParams, Link } from 'react-router-dom';

const EditRoom = () => {
    const { roomId } = useParams();
    const [room, setRoom] = useState({
        photo: null,
        roomType: "",
        roomPrice: ""
    });
    const [imagePreview, setImagePreview] = useState("");
    const [roomTypes, setRoomTypes] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Fetch room types
        getRoomTypes().then(data => setRoomTypes(data));

        // Fetch room data
        const fetchRoom = async () => {
            try {
                const roomData = await getRoomById(roomId);
                setRoom({
                    roomType: roomData.roomType,
                    roomPrice: roomData.roomPrice,
                    photo: null // Photo will be handled separately
                });
                // Assuming the backend provides a full URL for the photo
                setImagePreview(`data:image/png;base64,${roomData.photo}`);
            } catch (error) {
                console.error(error);
                setErrorMessage("Error fetching room data.");
            }
        };
        fetchRoom();
    }, [roomId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoom({ ...room, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setRoom({ ...room, photo: file });
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await updateRoom(roomId, room);
            if (response.status === 200) {
                setSuccessMessage("Room updated successfully!");
                // Optionally, refetch room data to show updated state
                const updatedRoomData = await getRoomById(roomId);
                setRoom({
                    roomType: updatedRoomData.roomType,
                    roomPrice: updatedRoomData.roomPrice,
                    photo: null
                });
                setImagePreview(`data:image/png;base64,${updatedRoomData.photo}`);
                setErrorMessage("");
            } else {
                setErrorMessage("Error updating room.");
            }
        } catch (error) {
            console.error(error);
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
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Edit Room</h2>
                {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{successMessage}</div>}
                {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{errorMessage}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="roomType" className="block text-gray-700 text-sm font-bold mb-2">Room Type</label>
                        <select id="roomType" name="roomType" value={room.roomType} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
                            <option value="">Select a room type</option>
                            {roomTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="roomPrice" className="block text-gray-700 text-sm font-bold mb-2">Room Price</label>
                        <input type="number" id="roomPrice" name="roomPrice" value={room.roomPrice} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="photo" className="block text-gray-700 text-sm font-bold mb-2">Room Photo</label>
                        <input id="photo" name="photo" type="file" onChange={handleImageChange} className="w-full px-3 py-2 border rounded-md" />
                        {imagePreview && <img src={imagePreview} alt="Room Preview" className="mt-4 max-h-48 rounded-md" />}
                    </div>
                    <div className="flex items-center justify-between">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Update Room</button>
                        <Link to={"/admin"} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">Back to Admin</Link>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default EditRoom;
