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
//import { Input } from '@/components/ui/input';
//import { Button } from '@/components/ui/button';
//import { Card, CardContent } from '@/components/ui/card';
import Image from "next/image";
import JsonLd from '@/components/JsonLd';
import animationData from "@/Heading.json";
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import FeatureSection from "@/app/features/page";

{/*interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  metadata?: {
    title: string | null;
  };
}
interface GradioClient {
  predict: (
    endpoint: string,
    data: {
      message: string;
      history: ChatMessage[];
    }
  ) => Promise<{
    data: [ChatMessage[], string];
  }>;
}

//const SPACE_NAME = "neuracities-ai/NeuraCitiesDemo";
//const MAX_MESSAGES = 3;


function formatAssistantMessage(content: string): React.ReactNode {
  // Split the content by newline
  const lines = content.split("\n");
  return (
    <div>
      {lines.map((line, idx) => {
        // Check for common bullet point patterns:
        //  - A number followed by a period (e.g. "1.")
        //  - A lowercase letter followed by a period (e.g. "a.")
        //  - A dash followed by a space
        if (/^\s*(?:\d+\.|[a-z]\.|-)\s+/.test(line)) {
          return (
            <p key={idx} className="border-l-4 border-gray-300 pl-2 my-1">
              {line}
            </p>
          );
        }
        return (
          <p key={idx} className="my-1">
            {line}
          </p>
        );
      })}
      {/* Append the Citation link }
      <p className="mt-4 text-right">
        <a
          href="https://opendata.vancouver.ca/pages/home/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm"
        >
          Citation
        </a>
      </p>
    </div>
  );
}*/}
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
          <p className="text-secondary mb-6 text-sm md:text-base">
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

const HomePage = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const router = useRouter();
  {/*const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [mapContent, setMapContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<GradioClient | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const [isClientReady, setIsClientReady] = useState(false);
  const [, setStep] = useState(''); // Add this line to define setStep

useEffect(() => {
    const initClient = async () => {
      try {
        const { Client } = await import("@gradio/client");
        const gradioClient = await Client.connect(SPACE_NAME) as GradioClient;
        setClient(gradioClient);
        setIsClientReady(true);
      } catch (err) {
        console.error("Failed to initialize Gradio client:", err);
        setError("Failed to initialize the chat interface. Please try again later.");
      }
    };

    initClient();
  }, []);
  const processMessage = async (userMessage: string) => {
    if (!client || !isClientReady) {
      console.error("Client not ready:", { client, isClientReady });
      throw new Error("Chat interface not initialized");
    }
    try {
      const result = await client.predict("/process_message", {
        message: userMessage,
        history: chatHistory
      });
      if (!Array.isArray(result.data) || result.data.length !== 2) {
        throw new Error("Invalid response format from server");
      }
      return result.data;
    } catch (error) {
      console.error("API error:", error);
      if (error instanceof Error) {
        throw new Error(`Request failed: ${error.message}`);
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  };

  const handleSubmit = async (e?: FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    // Use overrideQuery if provided; otherwise use the message state.
    const currentMessage = (overrideQuery ?? message).trim();
    if (!currentMessage || isLoading) return;
    if (chatHistory.length >= MAX_MESSAGES * 2) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newUserMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        metadata: { title: null }
      };
      // Immediately clear the input so the user sees the query appear.
      setMessage("");
      const updatedHistory = [...chatHistory, newUserMessage];
      setChatHistory(updatedHistory);
      setStep('full');
  
      const [newHistory, newMapContent] = await processMessage(currentMessage);
      setChatHistory(newHistory);
      setMapContent(newMapContent);
    } catch (error) {
      console.error("Error processing message:", error);
      setError("Failed to process your message. Please try again.");
      setChatHistory(chatHistory);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExampleQuery = async (query: string) => {
    // Directly process the query using the override parameter.
    await handleSubmit(undefined, query);
    // Optionally hide example buttons after a selection
    setShowExamples(false);
  };*/}
  
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
            {/*<div className="inline-block bg-coral/10 font-bold text-coral px-4 py-2 rounded-full mb-4">
              Do More.
            </div>*/}
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
                className="bg-white border text-coral px-8 py-2 sm:px-8 sm:py-3 rounded-lg text-base sm:text-lg font-medium transition-transform hover:bg-coral hover:text-white hover:scale-105"
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

      {/* Solutions Section */}
      <section className="py-0 bg-transparent">
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

      <section className="py-0 bg-transparent">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative">
          <SponsorshipSection />
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
