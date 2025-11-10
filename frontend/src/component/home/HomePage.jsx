import React from 'react';

const HomePage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Banner Section */}
      <header className="relative bg-cover bg-center h-96 text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center animate-fade-in-down">
            Welcome to <span className="text-green-300">Hotel Booking</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-center animate-fade-in-up">
            Your perfect getaway starts here.
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {/* Services Section */}
        <section className="my-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service Card 1: Free Wifi */}
            <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Wi-Fi</h3>
              <p className="text-gray-600">Stay connected with high-speed internet access throughout the hotel.</p>
            </div>

            {/* Service Card 2: Parking */}
            <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Front Desk</h3>
              <p className="text-gray-600">Our team is available around the clock to assist you with any needs.</p>
            </div>

            {/* Service Card 3: Restaurant */}
            <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1014.12 11.88l-4.242 4.242z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Restaurant</h3>
              <p className="text-gray-600">Enjoy delicious meals from local and international cuisines at our restaurant.</p>
            </div>

            {/* Service Card 4: Swimming Pool */}
            <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.8 9.928l.012.012M12 9.928l.012.012M16.2 9.928l.012.012M5 16H4a2 2 0 01-2-2v-1a2 2 0 012-2h1"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Swimming Pool</h3>
              <p className="text-gray-600">Relax and unwind in our beautiful and clean swimming pool.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage