import React from 'react';

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      <div className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-4xl font-extrabold text-green-700 mb-4">About Green City</h1>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            <strong>Green City</strong> is a digital platform dedicated to making our urban spaces more sustainable,
            livable, and eco-friendly. Whether it's reporting issues, promoting community action, or tracking
            environmental initiatives — Green City empowers citizens and authorities alike to take part in building a
            smarter, cleaner future.
          </p>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-green-600">🌱 Our Mission</h2>
              <p className="text-gray-700 mt-2">
                We aim to foster a culture of sustainability by connecting people, ideas, and actions.
                Our goal is to reduce pollution, improve waste management, and enhance civic engagement
                through modern technology.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-green-600">🔧 What We Offer</h2>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Report local environmental issues (waste, water, air, etc.)</li>
                <li>Track and manage civic complaints</li>
                <li>Access real-time data and analytics</li>
                <li>Earn points and rewards for eco-friendly actions</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-green-600">🌍 Why It Matters</h2>
              <p className="text-gray-700 mt-2">
                Urban areas generate over 70% of global emissions. By involving citizens directly in sustainability
                efforts, we can reduce our carbon footprint, conserve resources, and create cities that are cleaner,
                greener, and more inclusive.
              </p>
            </div>
          </div>

          {/* Optional Call to Action */}
          <div className="mt-8 bg-green-100 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold text-green-700 mb-2">Join the Movement 🌏</h3>
            <p className="text-green-800 mb-4">
              Together, we can build a more sustainable city — one action at a time.
            </p>
            <button className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition">
              Get Involved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
