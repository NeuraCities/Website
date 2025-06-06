"use client";
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export async function getStaticProps() {
  return { props: {} };
}

interface FAQ {
  question: string;
  answer: string;
}

type FooterFormData = {
  name: string;
  email: string;
  message: string;
};

const ContactAndFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FooterFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const faqs: FAQ[] = [
    {
      question: "How secure is the platform?",
      answer: "The platform is deployed within your organization's firewall - your data never leaves your secure environment. We follow all government security protocols and work with your IT team to ensure compliance."
    },
    {
      question: "How does it simplify our planning workflows?",
      answer: "Our platform combines GIS operations, data analysis, and reporting in one interface. No more switching between GIS softwares, Excel, and other tools. Create maps, run analysis, and generate reports seamlessly."
    },
    {
      question: "What's the pricing and implementation process?",
      answer: "We offer custom pricing and a simple 3-step setup: deploy behind your firewall, connect to your data sources, and customize to your workflows. Contact us to discuss your needs."
    },
    {
      question: "What GIS capabilities are included?",
      answer: "NeuraCities has all the GIS capabilities that Advanced GIS softwares have and more! Create and share maps instantly within the platform."
    },
    {
      question: "How customizable is the system?",
      answer: "The platform adapts to your department's unique standards and workflows. We customize it to your specific criteria, zoning regulations, and departmental requirements."
    }
  ];

  const toggleAccordion = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        setFormData({
          name: "",
          email: "",
          message: "",
        });
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
    <section className="py-8 sm:py-12 md:py-16 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col space-y-12 md:space-y-0 md:grid md:grid-cols-5 md:gap-6 items-start">
          {/* FAQs */}
          <div className="w-full md:col-span-3 md:mx-8 mx-auto order-1 md:order-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left flex justify-between items-center bg-white hover:bg-neutral transition-colors"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-primary pr-2">
                      {faq.question}
                    </h3>
                    <ChevronDown 
                      className={`flex-shrink-0 w-5 h-5 text-secondary transition-transform duration-200 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      openIndex === index ? 'max-h-96 bg-gradient-to-b from-white to-neutral px-3 sm:px-4 pb-3 sm:pb-4' : 'max-h-0'
                    }`}
                  >
                    <p className="text-sm sm:text-base text-secondary">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="w-full md:col-span-2 max-w-md mx-auto md:mx-18 order-2 md:order-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-4 sm:mb-6">
              Get In Touch
            </h2>
            {!submitted ? (
              <form
                name="footer-form"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                action="/forms.html"
                autoComplete="on"
                className="space-y-3 sm:space-y-4 text-center text-secondary"
              >
                <input type="hidden" name="form-name" value="footer-form" />
                <div hidden>
                  <input name="bot-field" autoComplete="off" />
                </div>

                {/* NAME FIELD */}
                <div className="text-left">
                  <label htmlFor="footer-name" className="block text-sm font-medium text-secondary mb-1">
                    
                  </label>
                  <input
                    type="text"
                    id="footer-name"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full px-3 sm:px-4 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                {/* EMAIL FIELD */}
                <div className="text-left">
                  <label htmlFor="footer-email" className="block text-sm font-medium text-secondary mb-1">
                    
                  </label>
                  <input
                    type="email"
                    id="footer-email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full px-3 sm:px-4 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
                  />
                </div>

                {/* MESSAGE FIELD */}
                <div className="text-left mb-2">
                  <label htmlFor="footer-message" className="block text-sm font-medium text-secondary mb-1">
                    
                  </label>
                  <textarea
                    id="footer-message"
                    name="message"
                    placeholder="Your message…"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 sm:px-4 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-cta text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:opacity-90 transition-colors text-base font-medium"
                >
                  Send
                </button>
              </form>

            ) : (
              <div className="bg-coral p-6 sm:p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  Thank You!
                </h2>
                <p className="text-neutral">
                  We&apos;ll be in touch soon about your inquiry.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactAndFAQ;