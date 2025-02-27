"use client";
import React, { useState } from 'react';
import { Shield, Server, Cloud, Lock, CheckCircle2, ArrowRight, Blend } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const SecurityPage = () => {
  const [selectedDeployment, setSelectedDeployment] = useState('hybrid');

  const deploymentOptions = [
    {
      id: 'hybrid',
      title: 'Hybrid Deployment',
      description: 'Recommended setup with data and inference model remaining within your infrastructure while leveraging cloud capabilities.',
      icon: <Blend className="w-8 h-8 text-coral" />,
      features: [
        'Data stays within your infrastructure',
        'Flexible resource allocation',
        'Enhanced performance and scalability',
        'Custom security policies integration'
      ]
    },
    {
      id: 'onprem',
      title: 'On-Premise',
      description: 'Full deployment within your existing infrastructure, providing maximum control and security.',
      icon: <Server className="w-8 h-8 text-coral" />,
      features: [
        'Complete data sovereignty',
        'Integration with internal systems',
        'Customizable infrastructure setup',
        'Existing security framework compatibility'
      ]
    },
    {
      id: 'cloud',
      title: 'Cloud-Based',
      description: 'Fully managed solution hosted on NeuraCities secure infrastructure.',
      icon: <Cloud className="w-8 h-8 text-coral" />,
      features: [
        'Rapid deployment',
        'Automatic updates and maintenance',
        'Scalable resources',
        'Enterprise-grade security'
      ]
    }
  ];

  const securityFeatures = [
    {
      title: 'Data Protection',
      description: 'End-to-end encryption for all data at rest and in transit',
      icon: <Lock className="w-6 h-6 text-coral" />
    },
    {
      title: 'Access Control',
      description: 'Role-based access control with detailed audit logging',
      icon: <Shield className="w-6 h-6 text-coral" />
    },
    {
      title: 'Compliance',
      description: 'Built to meet government and enterprise security standards',
      icon: <CheckCircle2 className="w-6 h-6 text-coral" />
    }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <header className="relative bg-transparent py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl">
            <div className="inline-block bg-coral/10 text-coral px-4 py-2 rounded-full mb-6">
              Enterprise-Grade Security
            </div>
            <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">
              Secure and Flexible <span className="text-coral">Deployment Options</span>
            </h1>
            <p className="text-xl text-secondary leading-relaxed">
              Deploy NeuraCities with confidence using our enterprise-ready security features and flexible infrastructure options.
            </p>
          </div>
        </div>
      </header>

      {/* Security Features Section */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="bg-white">
                <CardHeader>
                  <div className="bg-coral/10 p-3 rounded-xl w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-primary">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Options Section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Flexible Deployment Options
            </h2>
            <p className="text-xl text-secondary">
              Choose the deployment model that best fits your organization&lsquo;s needs and security requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {deploymentOptions.map((option) => (
              <div
                key={option.id}
                className={`bg-white rounded-xl shadow-sm p-8 border-2 transition-all duration-300 ${
                  selectedDeployment === option.id
                    ? 'border-coral shadow-xl'
                    : 'border-transparent hover:border-coral/50'
                }`}
                onClick={() => setSelectedDeployment(option.id)}
              >
                <div className="bg-coral/10 p-3 rounded-xl w-fit mb-6">
                  {option.icon}
                </div>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  {option.title}
                </h3>
                <p className="text-secondary mb-8">
                  {option.description}
                </p>
                <ul className="space-y-4">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-coral flex-shrink-0 mt-1" />
                      <span className="text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-coral text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Contact us to discuss your specific deployment requirements and security needs.
          </p>
          <Link href="/contact">
            <button className="bg-white text-coral px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-opacity-90 transition-all inline-flex items-center gap-2">
              Schedule Consultation <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;