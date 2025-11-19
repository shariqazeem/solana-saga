'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Users, TrendingUp, Zap, Lock, Award, ArrowRight, ChevronDown, CheckCircle, Globe, DollarSign, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { WalletButton } from './WalletButton';

interface LandingPageProps {
  onGetStarted?: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Trust-Verified",
      description: "Blockchain-powered reputation system ensuring community trust",
      color: "from-emerald-400 to-emerald-600"
    },
    {
      icon: Users,
      title: "Community First",
      description: "Traditional committee savings reimagined for the digital age",
      color: "from-emerald-400 to-emerald-600"
    },
    {
      icon: Lock,
      title: "Secure by Design",
      description: "Smart contracts audited on Solana blockchain",
      color: "from-emerald-400 to-emerald-600"
    },
    {
      icon: TrendingUp,
      title: "Transparent Growth",
      description: "Track every contribution and payout in real-time",
      color: "from-emerald-400 to-emerald-600"
    }
  ];

  const stats = [
    { label: "Active Committees", value: "50+", icon: Users },
    { label: "Total Value Locked", value: "$100K+", icon: DollarSign },
    { label: "Successful Payouts", value: "500+", icon: CheckCircle },
    { label: "Community Members", value: "1000+", icon: Globe }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-hidden relative"
         style={{
           background: `
             radial-gradient(circle at 80% 10%, rgba(22,219,101,0.1), transparent 60%),
             radial-gradient(circle at 20% 90%, rgba(59,130,246,0.08), transparent 60%),
             linear-gradient(to bottom right, rgb(2,6,23), rgb(15,23,42), rgb(6,78,59))
           `
         }}>
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-0 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
        }}
        transition={{ type: "spring", stiffness: 50 }}
      />
      <motion.div
        className="absolute top-0 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
        animate={{
          x: -mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
        }}
        transition={{ type: "spring", stiffness: 50 }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/2 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
        animate={{
          x: mousePosition.x * 0.015,
          y: -mousePosition.y * 0.015,
        }}
        transition={{ type: "spring", stiffness: 50 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div
          className="min-h-screen flex flex-col items-center justify-center px-6"
          style={{ opacity, scale }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex mb-8">
              <div className="px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">
                    Powered by Solana Blockchain
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-bold mb-6 leading-tight text-emerald-400"
            >
              RizqFi
            </motion.h1>

            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-5xl font-bold mb-8 text-gray-300"
            >
              Community Savings,
              <br />
              <span className="text-emerald-400">
                Blockchain Trust
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Traditional committee savings meets modern blockchain technology.
              Build trust, save together, and grow your wealth in a transparent,
              secure community.
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={itemVariants}>
              <div className="wallet-button-wrapper">
                <WalletButton />
              </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              variants={itemVariants}
              className="mt-20"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown className="w-8 h-8 text-gray-500 mx-auto" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
                    <div className="text-3xl font-bold text-emerald-400 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-20 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-emerald-400">
                Why Choose RizqFi?
              </h2>
              <p className="text-xl text-gray-400">
                Experience the future of community savings
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-20 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-emerald-400">
                How It Works
              </h2>
              <p className="text-xl text-gray-400">
                Simple, transparent, and secure
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect Wallet",
                  description: "Link your Solana wallet to get started instantly",
                  icon: Zap
                },
                {
                  step: "02",
                  title: "Join Committee",
                  description: "Choose or create a savings committee that fits your goals",
                  icon: Users
                },
                {
                  step: "03",
                  title: "Save & Earn",
                  description: "Make regular contributions and receive payouts when it's your turn",
                  icon: TrendingUp
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative text-center"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-8xl font-bold text-emerald-500/10">
                    {item.step}
                  </div>
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all">
                    <div className="inline-flex p-4 rounded-2xl bg-emerald-500 mb-6">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-20 px-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-10 h-10 text-yellow-400" />
                      <h3 className="text-3xl font-bold">Solana Hackathon</h3>
                    </div>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      Built with passion for the Solana Cypherpunk Hackathon.
                      Bringing traditional Pakistani committee savings (Committee/Kamaiti) to the blockchain.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold">Open Source</span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold">Audited Contracts</span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold">Community Driven</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-32 px-6"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-16 h-16 text-emerald-400" />
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-emerald-400">
              Ready to Start Saving?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of users already building wealth together on RizqFi
            </p>
            <div className="wallet-button-wrapper">
              <WalletButton />
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="border-t border-white/10 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400">
              © 2025 RizqFi. Built on Solana.
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <a href="https://github.com/shariqazeem/rizqfi?tab=readme-ov-file#rizqfi---trustless-community-savings-on-solana" className="hover:text-purple-400 transition-colors">Docs</a>
              <a href="https://github.com/shariqazeem/rizqfi" className="hover:text-purple-400 transition-colors">GitHub</a>
              <a href="https://x.com/rizqfi" className="hover:text-purple-400 transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }

        .wallet-button-wrapper button {
          padding: 1.5rem 3rem !important;
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          border-radius: 1rem !important;
          background: rgb(16, 185, 129) !important;
          border: none !important;
          box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.15) !important;
          transition: all 0.3s ease !important;
          color: white !important;
        }

        .wallet-button-wrapper button:hover {
          transform: scale(1.05) !important;
          background: rgb(5, 150, 105) !important;
          box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.7), 0 0 80px rgba(16, 185, 129, 0.2) !important;
        }

        .wallet-adapter-dropdown {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
        }

        .wallet-adapter-dropdown-list-item {
          background: transparent !important;
          transition: all 0.2s ease !important;
        }

        .wallet-adapter-dropdown-list-item:hover {
          background: rgba(16, 185, 129, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
