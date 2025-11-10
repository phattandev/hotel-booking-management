import React, { useState, useEffect } from "react";
import { getAllRooms, deleteRoom } from '../../service/ApiService';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';

const ExistingRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setIsLoading(true);
        try {
            const result = await getAllRooms();
            setRooms(result);
            setIsLoading(false);
        } catch (error) {
            setErrorMessage(error.message);
            setIsLoading(false);
        }
    };

    const handleDelete = async (roomId) => {
        if (window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
            try {
                const result = await deleteRoom(roomId);
                setSuccessMessage(result);
                fetchRooms(); // Tải lại danh sách phòng
            } catch (error) {
                setErrorMessage(error.message);
            }
            setTimeout(() => {
                setSuccessMessage("");
                setErrorMessage("");
            }, 3000);
        }
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Existing Rooms</h2>
                <Link to={"/add-room"} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    <FaPlus className="mr-2" /> Add New Room
                </Link>
            </div>

            {isLoading && <p>Loading existing rooms...</p>}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}

            {!isLoading && rooms.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left">ID</th>
                                <th className="py-3 px-4 border-b text-left">Room Type</th>
                                <th className="py-3 px-4 border-b text-left">Room Price</th>
                                <th className="py-3 px-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">{room.id}</td>
                                    <td className="py-3 px-4 border-b">{room.roomType}</td>
                                    <td className="py-3 px-4 border-b">${room.roomPrice}</td>
                                    <td className="py-3 px-4 border-b text-center">
                                        <div className="flex justify-center items-center space-x-3">
                                            <Link to={`/edit-room/${room.id}`} title="Edit">
                                                <span className="text-blue-500 hover:text-blue-700">
                                                    <FaEdit size={18} />
                                                </span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(room.id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete"
                                            >
                                                <FaTrashAlt size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default ExistingRooms;