import React, { useState, useEffect } from "react";
import { getAllBookings } from '../../service/ApiService';

const AllBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getAllBookings();
                setBookings(data);
            } catch (err) {
                setError(err.message || "Failed to fetch bookings.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (isLoading) {
        return <p className="text-center mt-4">Loading bookings...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 mt-4">Error: {error}</p>;
    }

    return (
        <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Bookings</h2>
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left">Booking ID</th>
                                <th className="py-3 px-4 border-b text-left">Room ID</th>
                                <th className="py-3 px-4 border-b text-left">Check-in</th>
                                <th className="py-3 px-4 border-b text-left">Check-out</th>
                                <th className="py-3 px-4 border-b text-left">Guest Name</th>
                                <th className="py-3 px-4 border-b text-left">Guest Email</th>
                                <th className="py-3 px-4 border-b text-left">Confirmation Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">{booking.id}</td>
                                    <td className="py-3 px-4 border-b">{booking.room.id}</td>
                                    <td className="py-3 px-4 border-b">{booking.checkInDate}</td>
                                    <td className="py-3 px-4 border-b">{booking.checkOutDate}</td>
                                    <td className="py-3 px-4 border-b">{booking.guestFullName}</td>
                                    <td className="py-3 px-4 border-b">{booking.guestEmail}</td>
                                    <td className="py-3 px-4 border-b font-mono">{booking.bookingConfirmationCode}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default AllBookings;