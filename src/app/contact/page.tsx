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
  const formDataToUrlSearchParams = (formData: FormData): URLSearchParams => {
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      params.append(key, value as string);
    });
    return params;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Encode form data for Netlify
    const formData = new FormData(e.currentTarget);
    
    try {
      // Send form data directly to Netlify's form handler
      const response = await fetch("/forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formDataToUrlSearchParams(formData).toString(),
      });
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        console.error("Form submission error:", response.statusText);
        alert("There was an error submitting the form. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("There was an error submitting the form. Please try again.");
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
                className="grid grid-cols-1 gap-4 sm:gap-6 bg-coral/90 p-6 sm:p-8 rounded-lg shadow-lg"
                name="contact-form"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                action="/forms.html"
                autoComplete="on"
              >
                {/* Hidden fields required by Netlify */}
                <input type="hidden" name="form-name" value="contact" />
                <div hidden>
                  <input name="bot-field" autoComplete="off" />
                </div>

                {/* Organization Type */}
                <div className="col-span-1">
                  <label
                    htmlFor="contact-organization"
                    className="block text-sm font-medium text-neutral mb-1 sm:mb-2"
                  >
                    Organization Type
                  </label>
                  <select
                    id="contact-organization"
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    required
                    autoComplete="organization"
                    className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                  >
                    <option value="">Select your organization type</option>
                    <option value="government">Government Planning Department</option>
                    <option value="urban-planning">Urban Planning Firm</option>
                    <option value="land">Land Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Name */}
                <div className="col-span-1">
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-neutral mb-1 sm:mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    required
                    onChange={handleChange}
                    autoComplete="name"
                    className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                  />
                </div>

                {/* Job Title */}
                <div className="col-span-1">
                  <label
                    htmlFor="contact-jobTitle"
                    className="block text-sm font-medium text-neutral mb-1 sm:mb-2"
                  >
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="contact-jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    required
                    onChange={handleChange}
                    autoComplete="organization-title"
                    className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                  />
                </div>

                {/* Work Email */}
                <div className="col-span-1">
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-neutral mb-1 sm:mb-2"
                  >
                    Work Email
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    required
                    onChange={handleChange}
                    autoComplete="email"
                    className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                  />
                </div>

                {/* Phone */}
                <div className="col-span-1">
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-medium text-neutral mb-1 sm:mb-2"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                  />
                </div>

                {/* Message */}
                <div className="col-span-1">
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-neutral mb-1 sm:mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    rows={3}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full p-2 sm:p-3 border border-secondary/20 rounded-lg focus:outline-none focus:border-primary text-base"
                  />
                </div>

                {/* Submit */}
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