import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Mic, 
  Zap, 
  ArrowRight, 
  ExternalLink,
  Twitter,
  MessageSquare,
  Workflow,
  Sparkles,
  Star,
  Globe,
  Mail,
  Linkedin,
  ChevronRight,
  Cpu,
  BrainCircuit,
  Rocket
} from 'lucide-react';

const Footer = () => {
  const [hoveredService, setHoveredService] = useState(null);
  const [floatingElements, setFloatingElements] = useState([]);

  // Create floating animation elements
  useEffect(() => {
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
    setFloatingElements(elements);
  }, []);

  const services = [
    {
      id: 'twitter-bot',
      title: 'Twitter Bot',
      description: 'Intelligent social media automation',
      icon: Twitter,
      gradient: 'from-blue-400 to-cyan-600',
      features: ['Auto-posting', 'Engagement tracking', 'Content optimization'],
    },
    {
      id: 'voice-assistant',
      title: 'AI Voice Assistant',
      description: 'Natural conversation AI companion',
      icon: Mic,
      gradient: 'from-purple-400 to-pink-600',
      features: ['Voice recognition', 'Natural responses', 'Multi-language'],
    },
    {
      id: 'ai-automation',
      title: 'AI Automation',
      description: 'Streamline workflows with intelligence',
      icon: Zap,
      gradient: 'from-orange-400 to-red-600',
      features: ['Process automation', 'Smart triggers', 'Custom workflows'],
    },
    {
      id: 'ai-solutions',
      title: 'Custom AI Solutions',
      description: 'Tailored AI for your unique needs',
      icon: BrainCircuit,
      gradient: 'from-green-400 to-emerald-600',
      features: ['Custom models', 'API integration', 'Scalable solutions'],
    },
  ];

  const stats = [
    { label: 'AI Models Deployed', value: '50+', icon: Cpu },
    { label: 'Happy Clients', value: '200+', icon: Star },
    { label: 'Automations Created', value: '50+', icon: Workflow },
    { label: 'Hours Saved Daily', value: '10K+', icon: Rocket },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`,
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-pink-500/30 to-orange-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {/* Brand & Introduction */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">AI Solutions</h3>
              </div>
              <p className="text-purple-200 leading-relaxed mb-6">
                Transforming businesses with intelligent automation and AI-powered solutions. 
                From smart email crafting to comprehensive workflow automation.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="h-4 w-4 text-purple-300" />
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                    </div>
                    <p className="text-xs text-purple-200">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Connect Links */}
            <div className="space-y-3">
              <a
                href="https://www.linkedin.com/in/jaweria-batool/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-purple-200 hover:text-white transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Linkedin className="h-4 w-4 text-white" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-300">Connect with Jaweria Batool</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </a>
              
              <a
                href="https://uinfo.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-purple-200 hover:text-white transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-300">Visit uinfo.org Platform</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </a>
              
              <a
                href="https://www.linkedin.com/company/uinfo/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-purple-200 hover:text-white transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Linkedin className="h-4 w-4 text-white" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform duration-300">Follow uinfo on LinkedIn</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </a>
            </div>
          </div>

          {/* Services Showcase */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Explore Our AI Services</h3>
              <p className="text-purple-200">Discover how our intelligent solutions can transform your workflow</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                const isHovered = hoveredService === service.id;
                
                return (
                  <div
                    key={service.id}
                    className={`group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:shadow-2xl ${
                      isHovered ? 'ring-2 ring-purple-400' : ''
                    }`}
                    onMouseEnter={() => setHoveredService(service.id)}
                    onMouseLeave={() => setHoveredService(null)}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`bg-gradient-to-r ${service.gradient} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">
                          {service.title}
                        </h4>
                      </div>
                      
                      <p className="text-purple-200 mb-4 group-hover:text-white transition-colors duration-300">
                        {service.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {service.features.map((feature, featureIndex) => (
                          <div 
                            key={feature}
                            className="flex items-center gap-2 text-sm text-purple-300 group-hover:text-purple-200 transition-all duration-300"
                            style={{ 
                              opacity: isHovered ? 1 : 0.7,
                              transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                              transitionDelay: `${featureIndex * 0.1}s`
                            }}
                          >
                            <ChevronRight className="h-3 w-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 text-purple-300 group-hover:text-white transition-all duration-300">
                        <span className="text-sm font-medium">Learn More</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 backdrop-blur-sm rounded-2xl border border-white/20 p-8 mb-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Automate Your Workflow?
            </h3>
            <p className="text-purple-200 text-lg mb-6">
              Join hundreds of businesses already leveraging AI to save time and increase productivity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://uinfo.org/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Get In Touch
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              <a
                href="https://uinfo.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 border border-white/30"
              >
                <Globe className="h-5 w-5" />
                Explore Platform
                <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-purple-300">
              <span>© {new Date().getFullYear()} AI Solutions Platform</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Powered by 
                <a 
                  href="https://uinfo.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-200 font-medium hover:text-white transition-colors duration-300 mx-1"
                >
                  uinfo.org
                </a>
                <span className="text-purple-400">•</span>
                <a 
                  href="https://www.linkedin.com/in/jaweria-batool/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-200 hover:text-white transition-colors duration-300 ml-1 flex items-center gap-1"
                >
                  <Linkedin className="h-3 w-3" />
                  <span className="text-xs">AI Expert</span>
                </a>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <Sparkles className="h-4 w-4" />
                <span>Intelligent • Automated • Efficient</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;