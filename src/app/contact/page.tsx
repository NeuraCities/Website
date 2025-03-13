"use client";
import React, { useState } from "react";

type FormDataType = {
  name: string;
  email: string;
  message: string;
  organizationType: string;
  jobTitle: string;
  phone: string;
};

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    message: "",
    organizationType: "",
    jobTitle: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert formData into URLSearchParams format
    const params = new URLSearchParams();
    params.append("form-name", "contact"); // must match the form name in both your hidden HTML file and here
    for (const key in formData) {
      params.append(key, formData[key as keyof FormDataType]);
    }

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      // You can handle error state here
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Hero Section */}
      <header className="relative py-16 md:py-16 sm:py-32 bg-transparent">
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 sm:mb-6">
            Let&apos;s Get in Touch
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-secondary max-w-2xl px-2">
            Schedule a call to enhance your department&apos;s capabilities.
          </p>
        </div>
      </header>

      {/* Contact Form Section */}
      <section id="contact-form" className="bg-transparent px-4 pb-12">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 sm:gap-6 bg-coral/90 p-6 sm:p-8 rounded-lg shadow-lg"
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
            >
              {/* Hidden fields required by Netlify */}
              <input type="hidden" name="form-name" value="contact" />
              <input type="hidden" name="bot-field" />

              <div className="col-span-1">
                <label className="block text-sm font-medium text-neutral mb-1 sm:mb-2">
                  Organization Type
                </label>
                <select
                  name="organizationType"
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                  required
                >
                  <option value="">Select your organization type</option>
                  <option value="government">
                    Government Planning Department
                  </option>
                  <option value="urban-planning">
                    Urban Planning Firm
                  </option>
                  <option value="engineering">
                    Engineering Consultancy
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-neutral mb-1 sm:mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-neutral mb-1 sm:mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  required
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-neutral mb-1 sm:mb-2">
                  Work Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-neutral mb-1 sm:mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-neutral mb-1 sm:mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={3}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                ></textarea>
              </div>

              <div className="col-span-1 pt-2">
                <button
                  type="submit"
                  className="w-full p-3 border bg-cta text-white border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base font-medium"
                >
                  Send
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-coral p-6 sm:p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                Thank You!
              </h2>
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