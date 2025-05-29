"use client";
import React, { useState } from "react";

type FormDataType = {
  name: string;
  email: string;
  organizationType: string;
  jobTitle: string;
  city: string;
  interests: string;
};

const Waitlist: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    organizationType: "",
    jobTitle: "",
    city: "",
    interests: "",
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
      <header className="relative py-16 md:py-20 sm:py-24">
        <div className="absolute inset-0"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
              🚀 Early Access Available
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-6">
            The Future of Planning is Here
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-secondary max-w-4xl leading-relaxed">
            Join our exclusive waitlist. Be the first to harness the power of AI in geospatial planning.
          </p>
        </div>
      </header>
      {/* Futuristic Stats */}
      <section>
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            <div className="bg-white backdrop-blur-sm rounded-2xl p-6 border border-blue-400">
              <div className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">100+</div>
              <div className="text-cyan-400 text-2xl text-center">Regions Data</div>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-2xl p-6 border border-purple-400">
              <div className="text-center text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">June 2025</div>
              <div className="text-violet-400 text-center text-2xl">Launch</div>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-2xl p-6 border border-cyan-400">
              <div className="text-4xl text-center font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">10</div>
              <div className="text-emerald-400 text-center text-2xl">AI Agents</div>
            </div>
          </div>
      </section>

      {/* Waitlist Form Section */}
      <section id="waitlist-form" className="px-4 pb-16">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            {!submitted ? (
                <form
                name="waitlist"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                action="/forms.html"
              >
                {/* Hidden fields required by Netlify */}
                <input type="hidden" name="form-name" value="waitlist" />
                <div hidden>
                  <input name="bot-field" />
                </div>
              <div className="bg-white backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-secondary">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
                    Secure Your Early Access
                  </h2>
                  <p className="text-secondary">
                    Be among the first to experience the next generation of urban planning tools
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        required
                        onChange={handleChange}
                        className="w-full p-4 border border-secondary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent text-base focus:bg-white bg-neutral/30 backdrop-blur-sm transition-all"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Work Email*
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        required
                        onChange={handleChange}
                        className="w-full p-4 border border-secondary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent text-base focus:bg-white bg-neutral/30 backdrop-blur-sm transition-all"
                        placeholder="your@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-2">
                        Organization Type*
                      </label>
                      <select
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleChange}
                        className="w-full p-4 border border-secondary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent text-base focus:bg-white bg-neutral/30 backdrop-blur-sm transition-all"
                        required
                      >
                        <option value="">Select organization type</option>
                        <option value="government">Government Planning Department</option>
                        <option value="urban-planning">Urban Planning Firm</option>
                        <option value="land-development">Land Development</option>
                        <option value="architecture">Retail</option>
                        <option value="real-estate">Real Estate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Job Title*
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        required
                        onChange={handleChange}
                        className="w-full p-4 border border-secondary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent text-base focus:bg-white bg-neutral/30 backdrop-blur-sm transition-all"
                        placeholder="e.g., Senior Planner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      City/Region <span className="text-xs">(This will get NeuraCities to your region!)</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                        className="w-full p-4 border border-secondary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent text-base focus:bg-white bg-neutral/30 backdrop-blur-sm transition-all"
                      placeholder="Where are you planning?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-2">
                      What excites you most about NeuraCities?
                    </label>
                    <textarea
                      name="interests"
                      value={formData.interests}
                      rows={3}
                      onChange={handleChange}
                        className="w-full p-4 border border-secondary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent text-base focus:bg-white bg-neutral/30 backdrop-blur-sm transition-all"
                      placeholder="Tell us what features or capabilities you're most looking forward to..."
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

                  <p className="text-xs text-secondary text-center mt-4">
                    By joining, youll get exclusive early access, beta features, and priority support. No spam, ever.
                  </p>
                </div>
              </div>
              </form>
            ) : (
              <div className="bg-gradient-to-r from-coral/50 to-secondary/50 p-8 sm:p-10 rounded-2xl shadow-xl border border-coral/20 text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                  Welcome to the Future!
                </h2>
                <p className="text-lg text-secondary mb-6">
                  You&apos;re now on the NeuraCities waitlist. We&apos;ll notify you as soon as early access becomes available.
                </p>
                <div className="bg-white p-4 rounded-xl border border-neutral">
                  <p className="text-sm text-secondary font-medium">
                    Expected early access: <span className="text-cta font-bold">Q2 2025</span>
                  </p>
                </div>
                <p className="text-sm text-secondary mt-4">
                  Keep an eye on your inbox for exclusive updates and behind-the-scenes content.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Waitlist;