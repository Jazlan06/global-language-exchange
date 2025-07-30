import React from 'react';

export default function LandingPage() {
    console.log('Tailwind test: ', window.getComputedStyle(document.body).backgroundImage);

    return (
        <div className="min-h-screen bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-400 flex flex-col items-center justify-center text-white px-6">
            <h1 className="text-5xl font-extrabold mb-4 text-center">
                🌐 Welcome to Global Language Exchange
            </h1>
            <p className="text-lg text-center max-w-2xl mb-8">
                Connect with people around the world to learn new languages and share your own.
                Practice speaking, listening, and cultural exchange with native speakers globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-md hover:bg-indigo-100 transition">
                    Get Started
                </button>
                <button className="bg-indigo-800 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 transition">
                    Learn More
                </button>
            </div>
        </div>
    );
}
