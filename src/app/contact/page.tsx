"use client";
import React, { useState } from "react";

const Contact: React.FC = () => {
  const [formData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual submission logic (e.g. sending data to your API)
    console.log(formData);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Hero Section */}
      <header className="relative py-20 bg-transparent">
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-5xl font-bold text-primary mb-6">
            Let&apos;s Get in Touch
          </h1>
          <p className="text-2xl md:text-2xl text-secondary max-w-2xl">
            Schedule a call to enhance your departments capabilities.
          </p>
        </div>
      </header>

      {/* Contact Form Section */}
      <section id="contact-form" className="bg-transparent">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-coral/90 p-8 rounded-lg shadow-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral mb-2">
                    Organization Type
                  </label>
                  <select 
                    className="w-full p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select your organization type</option>
                    <option value="government">Government Planning Department</option>
                    <option value="urban-planning">Urban Planning Firm</option>
                    <option value="engineering">Engineering Consultancy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-neutral mb-2">
                Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-neutral mb-2">
                Work Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-neutral mb-2">
                Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral mb-2">
                Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    className="w-full p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full p-3 border bg-cta text-white border-secondary/20 rounded-lg focus:outline-none focus:border-primary"
                  >
                    Send 
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
                <p className="text-neutral">
                  We&apos;ll be in touch within 1 business day to schedule your personalized demo.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
    );
};

export default Contact;
