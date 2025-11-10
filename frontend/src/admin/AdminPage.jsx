import React, { useState } from 'react';
import ExistingRooms from '../admin/ExistingRooms';
import AllBookings from '../admin/AllBookings';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('rooms');

    const tabClass = (tabName) => 
        `px-4 py-2 font-semibold rounded-t-lg focus:outline-none transition-colors duration-300 ${
            activeTab === tabName 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`;

    return (
        <section className="container mx-auto mt-20 p-4 md:p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Admin Panel</h1>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                    <button onClick={() => setActiveTab('rooms')} className={tabClass('rooms')}>
                        Manage Rooms
                    </button>
                    <button onClick={() => setActiveTab('bookings')} className={tabClass('bookings')}>
                        Manage Bookings
                    </button>
                </nav>
            </div>

            <div className="mt-8">{activeTab === 'rooms' ? <ExistingRooms /> : <AllBookings />}</div>
        </section>
    );
};

export default AdminPage;