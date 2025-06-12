"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMap, FiDatabase, FiMessageSquare, FiShare2, FiTool, FiFileText } from "react-icons/fi";
import Image from "next/image";
{/*interface Founder {
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
    { icon: <FiMap className="w-6 h-6 md:w-8 md:h-8" />, label: "Instant Map Creation" },
    { icon: <FiDatabase className="w-6 h-6 md:w-8 md:h-8" />, label: "Secure Data Integration" },
    { icon: <FiMessageSquare className="w-6 h-6 md:w-8 md:h-8" />, label: "Natural Language Interface" },
    { icon: <FiShare2 className="w-6 h-6 md:w-8 md:h-8" />, label: "Seamless Collaboration" },
    { icon: <FiTool className="w-6 h-6 md:w-8 md:h-8" />, label: "Custom GIS Tools" },
    { icon: <FiFileText className="w-6 h-6 md:w-8 md:h-8" />, label: "Automated Reports" }
  ];

  return (
    <section className="py-0 bg-transparent mb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">Our Mission</h2>
            <p className="text-lg md:text-xl text-secondary leading-relaxed mb-6 md:mb-8">
              Transforming workflows with an AI-powered geospatial platform that unifies data, mapping, and collaboration—empowering teams to unlock actionable insights and drive innovative solutions across every industry.
            </p>
            <div className="space-y-3 md:space-y-4">
              <p className="text-secondary">We enable teams:</p>
              <ul className="space-y-2 md:space-y-3">
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
                    <div className="h-2 w-2 bg-coral rounded-full flex-shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-6 mt-6 md:mt-0">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-3 md:p-6 border border-secondary/20 rounded-lg text-center hover:shadow-lg transition-all"
              >
                <div className="text-coral mb-2 md:mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <p className="text-secondary font-medium text-sm md:text-base">{feature.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const SponsorshipSection: React.FC = () => {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">Supported By</h2>
          <p className="text-secondary text-sm md:text-base">
            We&apos;re proud to be a part of the Microsoft Founders Hub, 
            empowering us with resources and support.
          </p>
          <div className="flex justify-center">
            <div className="w-64 md:w-80">
              <Image
                src="/images/MS_Startups_FH_lockup_hrz_OnLght_RGB.png"
                alt="Microsoft Founders Hub"
                width={800}
                height={600}
                className="object-contain h-full w-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Section */}
      <header className="relative py-16 md:py-20 bg-transparent">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold text-primary mb-2 md:mb-6"
          >
            About Us
          </motion.h1>
        </div>
      </header>

      {/* Mission Section */}
      <section className="py-0 bg-white/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative">
            <MissionSection />
          </div>
        </div>
      </section>
      <section className="py-0 bg-transparent">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative">
          <SponsorshipSection />
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
      <section className="py-10 md:py-12 bg-coral">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              Ready to Transform Urban Planning?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
              Join innovative cities and planning departments already using NeuraCities 
              to build smarter, more resilient communities.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact" className="bg-white text-coral px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold transition-all hover:bg-primary-500 hover:scale-105 text-sm md:text-base">
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