"use client";
import { useState} from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  Database,
  Share2,
  Brain,
  Shield,
  Lock
} from 'lucide-react';
import Image from "next/image";
import JsonLd from '@/components/JsonLd';
import animationData from "@/Heading.json";
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import FeatureSection from "@/app/(marketing)/features/page";

const challenges = [
  {
    id: 'geospatial',
    title: "Geospatial Analysis",
    description:
      "Perform complex GIS operations using plain language commands. Eliminate the need to juggle multiple tools like GIS softwares, Excel, Google Maps, and Python.",
    icon: <Brain className="w-8 h-8 text-coral" />,
    stats: [
      { label: "Analysis Time", value: "-85%" },
      { label: "Tools Unified", value: "5+" }
    ]
  },
  {
    id: 'standardization',
    title: "Quick Data Collection",
    description:
      "Automatically collect and standardize data from diverse sources. Transform scattered information into consistent, actionable insights.",
    icon: <Database className="w-8 h-8 text-coral" />,
    stats: [
      { label: "Fast Data Collection", value: "-80%" },
      { label: "Consistency", value: "100%" }
    ]
  },
  {
    id: 'collaboration',
    title: "Effortless Sharing",
    description:
      "Instantly share maps, reports, data, templates and insights with version control, enhancing teamwork and eliminating data silos.",
    icon: <Share2 className="w-8 h-8 text-coral" />,
    stats: [
      { label: "Faster Sharing", value: "10x" },
      { label: "Data Consistency", value: "100%" }
    ]
  }
];
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
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Supported By</h2>
          <p className="text-secondary mb-2 text-sm md:text-base">
            We&apos;re proud to be part of the Microsoft Founders Hub program, 
            empowering us with resources and support to build innovative solutions.
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

const VideoGallery: React.FC = () => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const videos = [
    {
      id: "Lw5FHHviCnM",
      title: "Opening a new Coffee Shop",
      description: "See how AI-driven analysis from NeuraCities aids in strategic site selection.",
      thumbnail: "https://img.youtube.com/vi/Lw5FHHviCnM/hqdefault.jpg"
    },
    {
      id: "YI0cQfx_aVc",
      title: "Flood Risk Analysis in Vancouver", 
      description: "Discover how NeuraCities' AI delivers rapid flood risk assessments, enhancing city resilience.",
      thumbnail: "https://img.youtube.com/vi/YI0cQfx_aVc/hqdefault.jpg"
    },
    {
      id: "6snCiDmemGU",
      title: "Dallas Housing Policy Analysis",
      description: "NeuraCities transforms siloed data into a single source of truth for real-time policy insights.",
      thumbnail: "https://img.youtube.com/vi/6snCiDmemGU/hqdefault.jpg"
    }
  ];

  const playVideo = (videoId: string) => {
    setPlayingVideo(videoId);
  };

  const closeVideo = () => {
    setPlayingVideo(null);
  };

  // Handle thumbnail error - fallback to default YouTube thumbnail
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const videoId = img.getAttribute('data-video-id');
    if (videoId) {
      // Try medium quality thumbnail first, then default
      if (img.src.includes('maxresdefault')) {
        img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      } else if (img.src.includes('mqdefault')) {
        img.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Video Thumbnail */}
            <div 
              className="relative aspect-video cursor-pointer group"
              onClick={() => playVideo(video.id)}
            >
              <Image
                src={video.thumbnail}
                alt={video.title}
                width={640}
                height={360}
                data-video-id={video.id}
                onError={handleImageError}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 hover:bg-white rounded-full p-4 transition-all duration-300 group-hover:scale-110 shadow-lg">
                  <svg className="w-8 h-8 text-coral ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Video Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-primary mb-2">
                {video.title}
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Playing Video */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-coral transition-colors duration-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1&rel=0`}
              title="Video Player"
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
};

const HomePage = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const router = useRouter();
  
  const getCardStyles = (id: string) => {
    return `bg-white border rounded-xl shadow-sm p-8 h-full transition-all duration-300 ${
      hoveredCard === id ? 'shadow-xl transform -translate-y-1' : ''
    }`;
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NeuraCities',
    url: 'https://neuracities.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://neuracities.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NeuraCities',
    url: 'https://neuracities.com',
    logo: 'https://neuracities.com/logo.png',
    sameAs: [
      'https://twitter.com/neuracities',
      'https://www.linkedin.com/company/neuracities',
      // add other social profiles as needed
    ],
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      {/* Hero Section */}
      <header className="relative bg-transparent py-32 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl sm:max-w-5xl mx-auto text-center">
            <h1 className="text-5xl sm:text-4xl text-center font-bold text-primary mb-4 sm:mb-6 leading-tight flex justify-center">
              <Lottie 
                animationData={animationData} 
                loop={true}
                autoplay={true}
                className="h-12 sm:h-28 md:h-24 lg:h-32"
              />
            </h1>
            <p className="text-xl sm:text-2xl text-secondary mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto">
              Efficient data to decisions: plain language insights for geospatial clarity.
            </p>
            <div className="flex flex-row gap-4 sm:gap-8 items-center justify-center">
              <button 
                onClick={() => router.push('/demo', { scroll: true })}
                className="bg-coral border text-white px-8 py-2 sm:px-8 sm:py-3 rounded-lg text-base sm:text-lg font-medium transition-transform hover:bg-white hover:text-coral hover:scale-105"
              >
                Try Demo
              </button>
              <button 
                onClick={() => router.push('/contact', { scroll: true })}
                className="bg-white border text-secondary px-8 py-2 sm:px-8 sm:py-3 rounded-lg text-base sm:text-lg font-medium transition-transform hover:bg-secondary hover:text-white hover:scale-105"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Video Gallery Section */}
      <section className="py-8 bg-coral">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <h2 className="text-4xl font-bold mb-2 text-white">
              See It In Action
            </h2>
            <p className="text-lg text-neutral">
              Click the videos to see them!
            </p>
          </div>
          
          <VideoGallery />
        </div>
      </section>
      
      {/* Solutions Section */}
      <section className="py-16 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-4xl font-bold text-primary mb-2">
              The All in One Solution
            </h2>
            <p className="text-xl text-secondary">
              Enabling you to work on problems that matter.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={getCardStyles(challenge.id)}
                  onMouseEnter={() => setHoveredCard(challenge.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-coral/10 p-3 rounded-xl w-fit flex-shrink-0">
                      {challenge.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-primary">
                      {challenge.title}
                    </h3>
                  </div>
                  <p className="text-secondary mb-8">
                    {challenge.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {challenge.stats.map((stat, index) => (
                      <div key={index} className="bg-neutral p-3 rounded-lg">
                        <div className="text-2xl text-center font-bold text-coral mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-center text-secondary">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        </div>
      </section>
      <section className="py-4 bg-transparent">
        <div className="container bg-neutral rounded-3xl p-8 sm:p-12 shadow-xl mx-auto px-4 md:px-6">
          <div className="relative">
          <SponsorshipSection />
          </div>
        </div>
      </section>
      {/* Features Section */}
        <FeatureSection />

      {/* Security Section */}
      <section className="py-16 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="bg-neutral rounded-3xl p-8 sm:p-12 shadow-xl">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl sm:text-4xl font-bold text-primary mb-4">
                Your Data, Your Control
              </h2>
              <p className="text-lg text-secondary max-w-4xl mx-auto">
                We prioritize your security with flexible deployment options that keep your data secure.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3">
                  <div className="bg-coral/10 p-3 rounded-xl inline-block mr-4">
                    <Shield className="w-10 h-10 text-coral" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">Flexible Deployment</h3>
                </div>
                <p className="text-secondary">
                  Keep complete control with deployment options behind your firewall, on your terms.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3">
                  <div className="bg-coral/10 p-3 rounded-xl inline-block mr-4">
                    <Database className="w-10 h-10 text-coral" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">Data Sovereignty</h3>
                </div>
                <p className="text-secondary">
                  Your sensitive data never leaves your servers or cloud infrastructure.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3">
                  <div className="bg-coral/10 p-3 rounded-xl inline-block mr-4">
                    <Lock className="w-10 h-10 text-coral" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">Custom Security</h3>
                </div>
                <p className="text-secondary">
                  Seamlessly integrate with your existing security policies and authentication protocols.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/security" className="group">
                <button className="bg-coral text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-opacity-90 transition-all inline-flex items-center gap-2 group-hover:gap-3">
                  Learn More About Security <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 bg-coral text-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Designed for Pioneers
            </h2>
            <p className="text-xl opacity-90">
              Join the next generation of agencies, enterprises, and innovators pioneering the future
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">70%</div>
              <p className="text-lg opacity-90">
                Reduction in data collection and analysis time.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-lg opacity-90">
                Process documentation and knowledge retention.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">5+</div>
              <p className="text-lg opacity-90">
                Software tools consolidated into one platform.
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/contact">
              <button className="bg-white text-coral px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-opacity-90 transition-all inline-flex items-center gap-2">
                Schedule Meeting <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
