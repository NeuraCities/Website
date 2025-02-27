"use client";
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const ContactAndFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: "How secure is the platform?",
      answer: "The platform is deployed within your organization's firewall - your data never leaves your secure environment. We follow all government security protocols and work with your IT team to ensure compliance."
    },
    {
      question: "How does it simplify our planning workflows?",
      answer: "Our platform combines GIS operations, data analysis, and reporting in one interface. No more switching between ArcGIS, Excel, and other tools. Create maps, run analysis, and generate reports seamlessly."
    },
    {
      question: "What's the pricing and implementation process?",
      answer: "We offer custom pricing and a simple 3-step setup: deploy behind your firewall, connect to your data sources, and customize to your workflows. Contact us to discuss your needs."
    },
    {
      question: "What GIS capabilities are included?",
      answer: "NeuraCities has all the GIS capabilities that ArcGIS Pro and other GIS softwares have and more! Create and share maps instantly within the platform."
    },
    {
      question: "How customizable is the system?",
      answer: "The platform adapts to your department's unique standards and workflows. We customize it to your specific criteria, zoning regulations, and departmental requirements."
    }
  ];

  const toggleAccordion = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-transparent">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-5 items-start">
          {/* FAQs */}
          <div className="col-span-3 md:mx-8 mx-auto">
            <h2 className="text-3xl font-bold text-primary text-center mb-6">
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
                    className="w-full px-4 py-3 text-left flex justify-between items-center bg-white hover:bg-neutral transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-primary">
                      {faq.question}
                    </h3>
                    <ChevronDown 
                      className={`w-5 h-5 text-secondary transition-transform duration-200 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      openIndex === index ? 'max-h-96 bg-gradient-to-b from-white to-neutral px-4 pb-4' : 'max-h-0'
                    }`}
                  >
                    <p className="text-secondary">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Contact Form */}
          <div className="col-span-2 max-w-md mx-auto md:mx-0">
            <h2 className="text-3xl font-bold text-primary text-center mb-6">
              Get In Touch
            </h2>
            <form className="space-y-4 text-center text-secondary">
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <textarea
                placeholder="Message"
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button 
                type="submit"
                className="w-full bg-cta text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactAndFAQ;