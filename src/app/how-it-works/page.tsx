"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Check, Map, Database, Share2, Workflow,CheckCircle} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
const AnimatedDataRetrieval = dynamic(() => import('@/app/how-it-works/solution-visualizations').then(mod => mod.AnimatedDataRetrieval), { ssr: false });
const AnimatedMapping = dynamic(() => import('@/app/how-it-works/solution-visualizations').then(mod => mod.AnimatedMapping), { ssr: false });
const AnimatedWorkflow = dynamic(() => import('@/app/how-it-works/solution-visualizations').then(mod => mod.AnimatedWorkflow), { ssr: false });
const AnimatedCollaboration = dynamic(() => import('@/app/how-it-works/solution-visualizations').then(mod => mod.AnimatedCollaboration), { ssr: false });

const SolutionsPage = () => {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const solutions = [
    {
      id: 'intelligent-mapping',
      title: 'Easy Maps & Tooling',
      description: 'One platform for all your planning and GIS needs',
      icon: <Map className="w-8 h-8" />,
      features: [
        'Natural language GIS commands',
        'Integration with GIS softwares and Excel workflows',
        'Automated spatial analysis tools',
        'Custom planning tools without coding'
      ],
      benefit: 'Replace 5+ different software tools with one intelligent interface',
      animation: AnimatedMapping
    },
    {
      id: 'smart-data-retrieval',
      title: 'Quick Data Collection',
      description: 'Transform scattered data into standardized insights automatically',
      icon: <Database className="w-8 h-8" />,
      features: [
        'Automated data gathering from multiple sources',
        'Standardized data processing workflows',
        'Intelligent document analysis and extraction',
        'Self-documenting data collection process'
      ],
      benefit: 'Reduce data collection and processing time by 85%',
      animation: AnimatedDataRetrieval
    },
    {
      id: 'seamless-collaboration',
      title: 'Seamless Collaboration',
      description: 'Share and standardize planning processes across teams',
      icon: <Share2 className="w-8 h-8" />,
      features: [
        'Standardized planning workflows',
        'Real-time project sharing',
        'Automated documentation generation',
        'Cross-department analysis tools'
      ],
      benefit: 'Maintain 100% process consistency across teams and projects',
      animation: AnimatedCollaboration
    },
    {
      id: 'workflow-automation',
      title: 'Process Automation',
      description: 'Automate repetitive planning tasks and standardize workflows',
      icon: <Workflow className="w-8 h-8" />,
      features: [
        'Automated report generation',
        'Standardized planning processes',
        'Built-in best practices',
        'Department-specific workflow templates'
      ],
      benefit: 'Save 70% time on routine planning tasks',
      animation: AnimatedWorkflow
    }
  ]

  // Use IntersectionObserver for scroll tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) setActiveSection(index);
          }
        });
      },
      { 
        threshold: 0.5,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Smooth scroll with easing
  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };


  return (
    <div className="min-h-screen bg-transparent">
      {/* Enhanced Hero Section */}
      <header className="relative py-24 overflow-hidden bg-gradient-to-b from-coral-50 to-coral-100/50">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 animate-fade-in">
            Simplify. Integrate. Succeed.
          </h1>
          <p className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto leading-relaxed mb-8 animate-fade-in-delay">
          Transform different data, mapping challenges, and workflow bottlenecks into instant insights and actions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-delay-2">
            <Link href="/contact" className="bg-coral text-white px-8 py-3 rounded-lg transition-transform hover:bg-primary-500 hover:scale-105">
                Get Started!
            </Link>
            <Link href="/demo" className="bg-white border text-secondary px-8 py-3 rounded-lg transition-transform hover:bg-secondary hover:text-white">
                Try Demo
            </Link>
          </div>
        </div>
      </header>

      
      <main className="container mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Enhanced Left Navigation */}
          <nav className="hidden lg:block sticky top-20 h-auto max-h-[calc(100vh-5rem)] overflow-hidden w-52">
            <div className="space-y-4 pt-12">
              {solutions.map((solution, index) => (
                <Button
                  key={solution.id}
                  variant="ghost"
                  onClick={() => scrollToSection(index)}
                  className={`
                    w-full justify-start gap-3 transition-all duration-300
                    ${activeSection === index 
                      ? 'bg-gradient-to-r from-coral/10 to-coral/5 text-coral transform scale-105' 
                      : 'text-secondary/80 hover:bg-gradient-to-r from-secondary/10 to-secondary/5 hover:text-coral'}
                  `}
                >
                  <div className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${activeSection === index 
                      ? 'bg-coral scale-105 hover:bg-white' 
                      : 'bg-secondary/80'}
                  `} />
                  {solution.title}
                </Button>
              ))}
            </div>
          </nav>

          {/* Enhanced Main Content */}
          <div className="flex-1 space-y-24">
            {solutions.map((solution, index) => (
              <section
              key={solution.id}
              ref={(el) => { sectionRefs.current[index] = el; }}
              className={`
                transform transition-all duration-700 ease-out
                ${activeSection === index 
                  ? 'scale-100 opacity-100 translate-y-0' 
                  : 'scale-95 opacity-50 translate-y-4'}
              `}
            >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-br from-coral/10 to-coral/5 text-coral rounded-lg">
                        {solution.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-coral mb-1">
                          {solution.title}
                        </h3>
                        <p className="text-secondary">
                          {solution.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        {solution.features.map((feature, featureIndex) => (
                          <div 
                            key={featureIndex}
                            className={`
                              flex items-start gap-2 p-4 bg-neutral/5 rounded-lg
                              transform transition-all duration-500 hover:scale-102
                            `}
                            style={{ transitionDelay: `${featureIndex * 100}ms` }}
                          >
                            <div className="p-1 bg-coral/20 rounded-full">
                              <Check className="w-4 h-4 text-coral" />
                            </div>
                            <p className="text-secondary">{feature}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-center bg-transparent rounded-md shadow-inner">
                        <solution.animation />
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-coral/10 to-coral/5 rounded-lg transform hover:scale-102 transition-transform duration-300">
                      <p className="text-coral font-semibold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {solution.benefit}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* Enhanced CTA Section */}
      <section className="bg-coral p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-6 animate-fade-in">
            Ready to Transform Your Planning Process?
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90 animate-fade-in-delay">
            Join planning departments who are completing weeks of analysis in hours. 
            No software training required - just ask questions and get answers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in-delay-2">
            <Link href="/demo" className="bg-white border text-coral px-8 py-3 rounded-lg transition-transform hover:bg-neutral hover:text-secondary">
                Try Demo
            </Link>
            <Link href="/contact" className="bg-white border text-coral px-8 py-3 rounded-lg transition-transform hover:bg-neutral hover:text-secondary">
                Schedule Meeting
            </Link>
          </div>
        </div>
      </section>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .scale-102 {
          scale: 1.02;
        }
      `}</style>
    </div>
  );
};

export default SolutionsPage;