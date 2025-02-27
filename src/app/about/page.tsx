"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMap, FiDatabase, FiMessageSquare, FiShare2, FiTool, FiFileText } from "react-icons/fi";
{/*import Image from "next/image";
interface Founder {
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin?: string;
}

const founders: Founder[] = [
  {
    name: "Satish Kamath",
    role: "Co-founder",
    image: "/images/Satish.jpeg",
    bio: "20+ years experience in Infrastructure projects. Led digital transformation initiatives for major cities.",
    linkedin: "https://www.linkedin.com/in/kamathsatish"
  },
  {
    name: "Rad Almuallim",
    role: "Co-founder",
    image: "/images/Rad.jpeg",
    bio: "Experience in creating AI solutions for different industries. Worked on GIS tools and spatial data analysis",
    linkedin: "https://www.linkedin.com/in/rad-almuallim-533289245"
  },
];*/}

const MissionSection: React.FC = () => {
  const features = [
    { icon: <FiMap className="w-8 h-8" />, label: "Instant Map Creation" },
    { icon: <FiDatabase className="w-8 h-8" />, label: "Secure Data Integration" },
    { icon: <FiMessageSquare className="w-8 h-8" />, label: "Natural Language Interface" },
    { icon: <FiShare2 className="w-8 h-8" />, label: "Seamless Collaboration" },
    { icon: <FiTool className="w-8 h-8" />, label: "Custom GIS Tools" },
    { icon: <FiFileText className="w-8 h-8" />, label: "Automated Reports" }
  ];

  return (
    <section className="py-0 bg-transparent mb-8">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-primary mb-6">Our Mission</h2>
            <p className="text-xl text-secondary leading-relaxed mb-8">
              Transforming workflows with an AI-powered geospatial platform that unifies data, mapping, and collaboration—empowering teams to unlock actionable insights and drive innovative solutions across every industry.
            </p>
            <div className="space-y-4">
              <p className="text-secondary">We enable teams:</p>
              <ul className="space-y-3">
                {[
                  "Reduce data gathering time from days to minutes",
                  "Generate high-quality maps and reports instantly",
                  "Collaborate seamlessly across departments",
                  "Leverage insights from diverse data sources"
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3 text-secondary"
                  >
                    <div className="h-2 w-2 bg-coral rounded-full" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 border border-secondary/20 rounded-lg text-center hover:shadow-lg transition-all"
              >
                <div className="text-coral mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <p className="text-secondary font-medium">{feature.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Section */}
      <header className="relative py-20 bg-transparent">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-bold text-primary mb-6"
          >
            About Us
          </motion.h1>
        </div>
      </header>

      {/* Mission Section */}
      <section className="py-0 bg-white/70">
        <div className="container mx-auto px-6">
          <div className="relative">
            <MissionSection />
          </div>
        </div>
      </section>

      {/*  Founders Section
      <section className="py-20 bg-gradient-to-b from-white to-transparent">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-4xl font-bold text-primary mb-12 text-center"
          >
            Meet Our Team
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={founder.image}
                        alt={founder.name}
                        width={128}
                        height={120}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-primary">{founder.name}</h3>
                      <p className="text-coral font-medium mb-2">{founder.role}</p>
                      <p className="text-secondary">{founder.bio}</p>
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-coral hover:text-coral-dark"
                        >
                          View LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>*/}

      {/* Enhanced CTA Section */}
      <section className="py-12 bg-coral">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Urban Planning?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join innovative cities and planning departments already using NeuraCities 
              to build smarter, more resilient communities.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact" className="bg-white text-coral px-8 py-4 rounded-lg font-semibold transition-all hover:bg-primary-500 hover:scale-105">
                Contact
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
