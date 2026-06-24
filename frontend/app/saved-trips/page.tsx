'use client'; // This tells Next.js this is an interactive UI component

import { useEffect, useState } from 'react';

export default function SavedTripsPage() {
  // We set up "state" to hold the trips once the API hands them to us
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect runs the very first time the page opens
  useEffect(() => {
    // 1. The UI places the order with the Waiter
    fetch('/api/trips')
      .then((response) => response.json())
      .then((data) => {
        // 2. The Waiter brings back the data, and we save it into state
        setTrips(data);
        setIsLoading(false);
      });
  }, []);

  // Show a loading message while we wait for the database
  if (isLoading) {
    return <div className="p-10 text-xl font-bold">Loading your adventures...</div>;
  }

  // Draw the data on the screen
  // Draw the data on the screen
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">My Saved Trips</h1>
      
      {trips.length === 0 ? (
        <p>No trips planned yet! Time to start exploring.</p>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <div key={trip.id} className="p-6 border rounded-lg shadow-md bg-white">
              <h2 className="text-2xl text-blue-600 font-semibold mb-3">
                {trip.destination_name}
              </h2>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <p>
                  <strong className="font-semibold text-gray-900">Status:</strong>{" "}
                  <span className="capitalize">{trip.status || 'Draft'}</span>
                </p>
                
                <p>
                  <strong className="font-semibold text-gray-900">Travel Mode:</strong>{" "}
                  <span className="capitalize">{trip.travel_mode || 'Not selected'}</span>
                </p>

                <p>
                  <strong className="font-semibold text-gray-900">Duration:</strong>{" "}
                  {trip.trip_days ? `${trip.trip_days} Days` : 'Not set'}
                </p>

                <p>
                  <strong className="font-semibold text-gray-900">Dates:</strong>{" "}
                  {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'TBD'} 
                  {" to "} 
                  {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'TBD'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}