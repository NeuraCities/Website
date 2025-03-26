"use client";
import { useState, useEffect, FormEvent} from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Zap,
  Database,
  Share2,
  Brain,
  Send,
  Loader2,
  MapPin,
  Castle,
  Shield,
  Clock,
  Lock,
  CloudRainWind,
  Target,
  Droplets,
  Milestone,
  TrainFront,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from "next/image";
import JsonLd from '@/components/JsonLd';

interface ChatMessage {
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

const SPACE_NAME = "neuracities-ai/NeuraCitiesDemo";
const MAX_MESSAGES = 3;

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

const challenges = [
  {
    id: 'geospatial',
    title: "Advanced Geospatial Analysis",
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
    title: "Automated Data Collection & Standardization",
    description:
      "Automatically collect and standardize data from diverse sources. Transform scattered information into consistent, actionable insights.",
    icon: <Database className="w-8 h-8 text-coral" />,
    stats: [
      { label: "Data Collection Time", value: "-80%" },
      { label: "Process Consistency", value: "100%" }
    ]
  },
  {
    id: 'collaboration',
    title: "Seamless Collaboration & Sharing",
    description:
      "Share maps, data, templates, reports, and insights instantly with built-in version control. Experience real-time collaboration that unifies teams and eradicates data silos. ",
    icon: <Share2 className="w-8 h-8 text-coral" />,
    stats: [
      { label: "Faster Sharing", value: "10x" },
      { label: "Data Consistency", value: "100%" }
    ]
  }
];
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
      {/* Append the Citation link */}
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
}

const HomePage = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [mapContent, setMapContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<GradioClient | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const [isClientReady, setIsClientReady] = useState(false);
  const [, setStep] = useState(''); // Add this line to define setStep

  // Initialize Gradio client using the working method from your Demo page
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
  };
  
  const getCardStyles = (id: string) => {
    return `bg-white border rounded-xl shadow-sm p-8 h-full transition-all duration-300 ${
      hoveredCard === id ? 'shadow-xl transform -translate-y-1' : ''
    }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      {/* Hero Section */}
      <header className="relative bg-transparent py-32 overflow-hidden">
        <div className="absolute inset-0 bg-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl">
            <div className="inline-block bg-coral/5 font-bold text-coral px-4 py-2 rounded-full mb-6">
              AI-Powered Geospatial Assistant
            </div>
            <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">
              Your Team&apos;s <span className="text-coral">Geospatial Assistant</span>
            </h1>
            <p className="text-xl text-secondary leading-relaxed">
              Unify GIS analysis, data management, and collaboration in one intelligent solution.
            </p>
            <p className="text-xl text-secondary mb-8 leading-relaxed">
              Get from data to decisions in minutes, not weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link href="/demo">
                <Button size="lg" className="bg-coral text-white hover:bg-coral/90">
                  Try Demo <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-coral">
                  Contact <ChevronRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Solutions Section */}
      <section className="py-0 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-4xl font-bold text-primary mb-2">
              Tailored Solutions for Your Needs
            </h2>
            <p className="text-xl text-secondary">
              We enable your team to work on problems that matter with customized Geospatial AI.
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
                <div className="bg-coral/10 p-3 rounded-xl w-fit mb-6">
                  {challenge.icon}
                </div>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  {challenge.title}
                </h3>
                <p className="text-secondary mb-8">
                  {challenge.description}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {challenge.stats.map((stat, index) => (
                    <div key={index} className="bg-neutral p-4 rounded-lg">
                      <div className="text-2xl font-bold text-coral mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-secondary">
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

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-8">
                See it in action
              </h2>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4 items-start">
                  <div className="bg-coral/10 p-2 rounded-lg">
                    <Zap className="w-6 h-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      Natural Language Interface
                    </h3>
                    <p className="text-secondary">
                      Simply ask your questions in plain English—our AI handles the heavy lifting.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-coral/10 p-2 rounded-lg">
                    <Target className="w-6 h-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      Precision Analysis
                    </h3>
                    <p className="text-secondary">
                      Receive pinpoint insights with our advanced spatial analysis tools.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-coral/10 p-2 rounded-lg">
                    <Clock className="w-6 h-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      Rapid Results
                    </h3>
                    <p className="text-secondary">
                      Automate complex workflows and get your results in minutes.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-coral/10 p-2 rounded-lg">
                    <Share2 className="w-6 h-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      Seamless Collaboration
                    </h3>
                    <p className="text-secondary">
                      Experience instant updates and real-time data sharing across your team.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-coral/10 p-2 rounded-lg">
                    <MapPin className="w-6 h-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      Free Demo (City of Vancouver)
                    </h3>
                    <p className="text-secondary">
                      Access our live demo with Vancouver data—free for you to try!
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/demo">
                  <Button className="w-full sm:w-auto bg-coral text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-coral/90">
                    Try Demo <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full sm:w-auto bg-white text-primary border-2 border-primary/20 px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-white">
                    Contact Us <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="shadow-xl">
              <CardContent className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
                {showExamples ? (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-3">
                      Try these examples for City of Vancouver:
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        {
                          icon: <Droplets className="w-5 h-5" />,
                          text: "Show me some of the water infrastructure elements"
                        },
                        {
                          icon: <CloudRainWind className="w-5 h-5" />,
                          text: "Let's analyze the stormwater network in Vancouver"
                        },
                        {
                          icon: <Castle className="w-5 h-5" />,
                          text: "I want to look at cultural spaces in Vancouver"
                        },
                        {
                          icon: <Milestone className="w-5 h-5" />,
                          text: "Map the one way streets in Vancouver please!"
                        },
                        {
                          icon: <TrainFront className="w-5 h-5" />,
                          text: "Can you tell me the pros of the transit lines in Vancouver?"
                        }
                      ].map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleExampleQuery(example.text)}
                          disabled={!isClientReady || isLoading}
                          className="text-left p-3 rounded-lg border border-coral/20 hover:border-coral hover:bg-coral/5 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-coral">{example.icon}</span>
                          <span className="text-secondary">{example.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-neutral rounded-lg p-4 mb-4 h-64 overflow-y-auto">
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                          <div
                            className={`inline-block max-w-[80%] rounded-lg p-3 ${
                              msg.role === "user"
                                ? "bg-coral text-white"
                                : "bg-white border border-coral/20 text-secondary"
                            }`}
                          >
                            {msg.role === "assistant"
                              ? formatAssistantMessage(msg.content)
                              : msg.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    {mapContent ? (
                      <div className="bg-neutral rounded-lg p-4 mb-4 h-50">
                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: mapContent }} />
                      </div>
                    ) : (
                      <div className="bg-neutral rounded-lg p-4 mb-4 h-50">
                        Press Enter and see the magic!
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={isClientReady ? "Ask about Vancouver urban planning..." : "Initializing..."}
                        disabled={isLoading || !isClientReady}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !isClientReady || !message.trim()}
                        className="bg-coral hover:bg-coral/90"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-3 bg-gradient-to-b from-white/80 to-transparent">
        <div className="container mx-auto px-6">
          <div className="bg-coral/5 rounded-2xl p-12">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-primary mb-4">
                Your Data, Your Control
              </h2>
              <p className="text-xl text-secondary">
                We prioritize your security with flexible deployment options that keep your data secure.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <Shield className="w-12 h-12 text-coral mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-4">Flexible Deployment</h3>
                <p className="text-secondary">
                  Keep complete control with deployment behind your firewall.
                </p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <Database className="w-12 h-12 text-coral mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-4">Data Sovereignty</h3>
                <p className="text-secondary">
                  Your data never leaves your servers or infrastructure.
                </p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <Lock className="w-12 h-12 text-coral mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-4">Custom Security</h3>
                <p className="text-secondary">
                  Integrate with your existing security policies and protocols.
                </p>
              </div>
            </div>
            <div className="py-8 text-center">
              <Link href="/security">
                <button className="bg-coral text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-opacity-90 transition-all inline-flex items-center gap-2">
                  Learn More <ArrowRight className="w-5 h-5" />
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
            Trusted by Industry Leaders
            </h2>
            <p className="text-xl opacity-90">
            Join leading agencies, enterprises, and innovators transforming geospatial decision-making.
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
