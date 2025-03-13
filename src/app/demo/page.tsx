"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Checkbox from "@/components/ui/Checkbox";
import { 
  Send, 
  Loader2, 
  Car, 
  Building, 
  Waves, 
  Droplets,
  Maximize2,
  Minimize2,
  Share,
  MapPinned,
  SquarePen
} from "lucide-react";

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
const challenges = [
  {
    id: 'geospatial',
    title: "Advanced GIS Tooling",
    description:
      "Perform complex GIS operations through plain language commands!",
    icon: <MapPinned className="w-8 h-8 text-coral" />
  },
  {
    id: 'standardization',
    title: "Edit and Export",
    description: 
      "Edit and export maps, reports and tables on a canvas with NeuraCities assisting you!",
    icon: <SquarePen className="w-8 h-8 text-coral" />
  },
  {
    id: 'collaboration',
    title: "Easy Collaboration",
    description:
      "Share maps, data, and analysis instantly with anyone!",
    icon: <Share className="w-8 h-8 text-coral" />
  }
];
const SPACE_NAME = "neuracities-ai/NeuraCitiesDemo";
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
const DemoPage: React.FC = () => {
  const [step, setStep] = useState('login');
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [mapContent, setMapContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<GradioClient | null>(null);
  const [newsletter, setNewsletter] = useState<boolean>(false);
  const [user, setUser] = useState({ name: '', email: '' });
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  


  useEffect(() => {
    const initClient = async () => {
      try {
        const { Client } = await import("@gradio/client");
        const gradioClient = await Client.connect(SPACE_NAME) as GradioClient;
        setClient(gradioClient);
      } catch (err) {
        console.error("Failed to initialize Gradio client:", err);
        setError("Failed to initialize the chat interface. Please try again later.");
      }
    };

    initClient();
  }, []);

  const processMessage = async (userMessage: string) => {
    if (!client) {
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

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Use formData.get() to retrieve values
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    
    // Update local state for the demo
    setUser({
      name,
      email
    });
    setStep('chat');
    
    // Prepare the URLSearchParams
    const params = new URLSearchParams();
    params.append('form-name', 'demo-form'); // Add this line
    params.append('name', name);
    params.append('email', email);
    params.append('newsletter', newsletter ? 'yes' : 'no'); // Add this line
    
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
    } catch (error) {
      console.error('Error submitting form to Netlify:', error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, overrideQuery?: string) => {
    e.preventDefault();
    // Use the override query if provided; otherwise use the message state.
    const query = overrideQuery ?? message;
    if (!query.trim()) return;
  
    setIsLoading(true);
    setError(null);
  
    try {
      const newMessage: ChatMessage = {
        role: "user",
        content: query,
        metadata: { title: null }
      };
  
      const updatedHistory = [...chatHistory, newMessage];
      setChatHistory(updatedHistory);
      setStep('full');
  
      const [newHistory, newMapContent] = await processMessage(query);
      setChatHistory(newHistory);
      setMapContent(newMapContent);
    } catch (error) {
      setError("Failed to process your message. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setMessage("");
    }
  };  

  const handleExampleQuery = async (query: string) => {
    setMessage(query);
    const fakeEvent = { preventDefault: () => {} } as FormEvent<HTMLFormElement>;
    await handleSubmit(fakeEvent, query);
  };

  const toggleMapFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };
  
  const getCardStyles = (id: string) => {
    return `bg-white border rounded-xl shadow-sm p-8 h-full transition-all duration-300 ${
      hoveredCard === id ? 'shadow-xl transform -translate-y-1' : ''
    }`;
  };

  const FeaturesComingSoon = () => (
    <section className="py-8 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Features Coming Soon!
          </h2>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (step === 'login') {
    return (
      <div className="bg-transparent">
        <div className="min-h-screen bg-transparent flex flex-col">
          <div className="flex-grow flex items-center justify-center px-4 py-28">
            <div className="w-full max-w-xl">
              <h1 className="text-5xl font-bold text-center text-primary mb-4">Welcome to NeuraCities</h1>
              <div className="text-lg text-center mb-2 text-secondary">Please Sign up to access the free City of Vancouver demo!</div>
              <form 
                name="demo-form" 
                method="POST" 
                data-netlify="true" 
                netlify-honeypot="bot-field"
                onSubmit={handleLogin} 
                className="space-y-6"
              >
                <input type="hidden" name="form-name" value="demo-form" />
                <input type="hidden" name="bot-field" />
                
                <Input
                  name="name"
                  placeholder="Name"
                  required
                  className="w-full text-lg h-12 bg-white"
                />
                
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full text-lg h-12 bg-white"
                />
                
                <div className="flex items-center font-semibold bg-coral/1 space-x-2 text-md">
                <Checkbox
                  id="newsletter"
                  checked={newsletter}
                  onCheckedChange={(checked) => setNewsletter(checked as boolean)}
                  label="Keep me updated with NeuraCities!"
                />
                </div>
                
                <div className="text-md text-primary">
                  We respect your privacy. Your information will never be shared.
                </div>
                
                <Button type="submit" className="w-full h-12 text-lg text-white bg-coral hover:bg-coral/95">
                  Get Started
                </Button>
              </form>
            </div>
          </div>
          
          {/* Added features coming soon section to login page */}
          <FeaturesComingSoon />
        </div>
      </div>
    );
  }

  if (step === 'chat') {
    return (
      <div className="min-h-screen py-32 bg-transparent flex flex-col">
        <div className="flex-grow flex items-center bg-gradient-to-r from-transparent via-white to-transparent justify-center px-4 py-8">
          <div className="w-full max-w-3xl space-y-5">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-2">Hi {user.name}</h1>
              <p className="text-xl text-secondary">How can I help you?</p>
              <p className="text-md text-secondary/80">Try the examples below or ask anything about Vancouver&apos;s unique Urban Planning landscape!</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                value={message}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                placeholder="Ask me anything about Vancouver's urban planning..."
                className="w-full text-lg h-12 bg-white text-secondary"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto py-3 px-4 whitespace-normal bg-coral hover:bg-coral/95 hover:text-neutral text-left flex items-start gap-2"
                  onClick={() => handleExampleQuery("I want to analyze the Traffic")}
                >
                  <Car className="w-5 h-5 mt-1 flex-shrink-0" />
                  <span>I want to analyze the Traffic in Vancouver, can you show it on a map?</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto py-3 px-4 whitespace-normal  bg-coral hover:bg-coral/95 hover:text-neutral text-left flex items-start gap-2"
                  onClick={() => handleExampleQuery("Can you map the most recently issued building permits in Kitsilano?")}
                >
                  <Building className="w-5 h-5 mt-1 flex-shrink-0" />
                  <span>Can you map the most recently issued building permits in Kitsilano?</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto py-3 px-4 whitespace-normal  bg-coral hover:bg-coral/95 hover:text-neutral text-left flex items-start gap-2"
                  onClick={() => handleExampleQuery("Let's analyze the stormwater network in Vancouver")}
                >
                  <Waves className="w-5 h-5 mt-1 flex-shrink-0" />
                  <span>Let us analyze the stormwater network in Vancouver</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto py-3 px-4 whitespace-normal text-left  bg-coral hover:bg-coral/95 hover:text-neutral flex items-start gap-2"
                  onClick={() => handleExampleQuery("Show me some of the water infrastructure elements")}
                >
                  <Droplets className="w-5 h-5 mt-1 flex-shrink-0" />
                  <span>Show me some of the water infrastructure elements</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Added features coming soon section to chat page */}
        <FeaturesComingSoon />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="text-center py-16 bg-transparent text-xl text-prinmary">
         <h1>You&apos;re acessing the free demo version of NeuraCities for the city of <span className="font-semibold text-coral">Vancouver</span>!</h1>
      </div>
      <div className="container mx-auto px-6 pb-6">
        <div className={`grid ${isMapFullscreen ? '' : 'grid-cols-1 lg:grid-cols-2'} gap-6 transition-all duration-300`}>
          {/* Chat Interface */}
          <div className={`h-[80vh] bg-white rounded-lg shadow-lg p-6 flex flex-col ${isMapFullscreen ? 'hidden' : ''}`}>
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
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
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about urban planning..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 bg-primary text-white" />
                )}
              </Button>
            </form>
            {error && <p className="text-cta text-sm mt-2">{error}</p>}
          </div>
  
          {/* Map View */}
          <div className={`${isMapFullscreen ? 'h-[90vh] w-full' : 'h-[80vh]'} bg-white rounded-lg shadow-lg p-6 relative transition-all duration-300`}>
            <Button
              onClick={toggleMapFullscreen}
              className="absolute top-4 right-4 z-10"
              variant="ghost"
            >
              {isMapFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {mapContent ? (
              <div className="w-full h-[50vh]" dangerouslySetInnerHTML={{ __html: mapContent }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-secondary">
                Map visualization will appear here
              </div>
              
            )}
          </div>
        </div>
      </div>
      
      {/* Features Coming soon section was already here in the full view */}
      <FeaturesComingSoon />
    </div>
  );  
};

export default DemoPage;