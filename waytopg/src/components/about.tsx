import React from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Building2, ShieldCheck, Globe, Heart } from 'lucide-react';
import Navbar from './navbar';
import Footer from './Footer';

const AboutPage: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats = [
    { number: '20,000+', label: 'Happy Students', icon: GraduationCap },
    { number: '1,500+', label: 'Accommodations', icon: Building2 },
    { number: '50+', label: 'Cities', icon: Globe },
    { number: '100%', label: 'Verified Listings', icon: ShieldCheck },
  ];

  const values = [
    {
      title: 'Trust & Safety',
      description: 'We verify every listing and owner to ensure a safe experience for our students.',
      icon: ShieldCheck,
    },
    {
      title: 'Student-First',
      description: 'Every decision we make puts students\' needs and well-being first.',
      icon: GraduationCap,
    },
    {
      title: 'Community',
      description: 'Building connections and fostering a supportive environment for everyone.',
      icon: Users,
    },
    {
      title: 'Quality Living',
      description: 'Ensuring comfortable and well-maintained accommodations for the best experience.',
      icon: Heart,
    },
  ];

  const team = [
    {
      name: 'Manoj Patil',
      role: 'Founder & CEO',
      image: '/placeholder.svg?height=400&width=400',
    },
    {
      name: 'lol',
      role: 'Head of Operations',
      image: '/placeholder.svg?height=400&width=400',
    },
    {
      name: 'lol',
      role: 'Student Success Lead',
      image: '/placeholder.svg?height=400&width=400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-24">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px]" />
        <div className="container mx-auto px-4 text-center relative">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Making Student Housing
            <span className="block text-blue-200">Simple & Secure</span>
          </motion.h1>
          <motion.p 
            className="text-xl max-w-2xl mx-auto text-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We're on a mission to revolutionize how students find their perfect home away from home.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            {...fadeInUp}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              Our Story
            </span>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">From Vision to Reality</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Way2pg started with a simple idea: make student housing search stress-free. We understand the challenges students face when looking for accommodation in a new city. That's why we've created a platform that connects students with verified property owners, ensuring a smooth and reliable housing experience.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we're proud to serve thousands of students across multiple cities, helping them find their perfect home away from home. Our commitment to trust, safety, and student satisfaction remains at the heart of everything we do.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              Our Values
            </span>
            <h2 className="text-3xl font-bold text-gray-900">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
              Our Team
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Meet the People Behind Way2pg</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <div className="absolute inset-0 bg-blue-100 rounded-full" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative z-10 rounded-full object-cover w-full h-full border-4 border-white shadow-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-1 text-gray-900">{member.name}</h3>
                <p className="text-blue-600">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;