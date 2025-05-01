import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { 
  Search, Star, ArrowRight, Shield, Clock, Building,
   Sparkles, CheckCircle,
  GraduationCap
} from 'lucide-react';
import Footer from './Footer';
import Button from './Button';
import Navbar from './navbar';

const cities = [
  { name: "Mumbai", count: "500+", image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875" },
  { name: "Bangalore", count: "450+", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2" },
  { name: "Delhi", count: "400+", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5" },
  { name: "Chennai", count: "350+", image: "https://images.unsplash.com/photo-1585999322539-fee6e6321a39" }
];

const stats = [
  { number: "20,000+", label: "Happy Students", icon: GraduationCap },
  { number: "1,500+", label: "Verified Properties", icon: CheckCircle },
  { number: "50+", label: "Cities Covered", icon: Building },
  { number: "100%", label: "Satisfaction Rate", icon: Star }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const citiesRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });
  const citiesInView = useInView(citiesRef, { once: true });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to accommodations page with the search query and set focus to false
      setIsSearchFocused(false);
      navigate(`/accommodations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-300 via-blue-400 to-emerald-300 overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: heroInView ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-20 pt-16 pb-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-4"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md text-blue-600 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Trusted by </span>
                <span> 20,000+ Students</span>
                <span className="hidden sm:inline"> Across India</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 tracking-tight"
            >
              Find Your Perfect
              <motion.span
                animate={{ 
                  color: ['#2563EB', '#1D4ED8', '#2563EB'],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="block"
              >
                Student Home
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto"
            >
              Discover verified, affordable, and comfortable PGs & hostels
              near your college
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="max-w-2xl mx-auto mt-8"
            >
              <motion.div
                animate={isSearchFocused ? {
                  scale: 1.02,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
                } : {
                  scale: 1,
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                }}
                transition={{ duration: 0.3 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-3"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by college, area or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    />
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    className="sm:w-auto"
                  >
                    <Button 
                      variant="primary" 
                      size="large" 
                      onClick={handleSearch}
                      className="w-full sm:w-auto rounded-xl px-8 py-4 text-base font-semibold shadow-md bg-blue-600 hover:bg-blue-700"
                    >
                      <span className="flex items-center whitespace-nowrap">
                        Find Accommodation
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              <div className="mt-8 flex flex-wrap justify-center gap-6">
                {[
                  { icon: CheckCircle, text: "Verified Listings" },
                  { icon: Shield, text: "Secure Payments" },
                  { icon: Clock, text: "24/7 Support" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 20 }}
                    transition={{ duration: 0.6, delay: 1.3 + index * 0.1 }}
                    className="flex items-center text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:text-blue-600 transition-colors duration-300"
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 320" className="w-full">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 sm:py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: statsInView ? 1 : 0, y: statsInView ? 0 : 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 sm:p-6 rounded-xl bg-blue-50 relative z-10"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-gray-900">
                    {stat.number}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">{stat.label}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section ref={citiesRef} className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: citiesInView ? 1 : 0, y: citiesInView ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: citiesInView ? 1 : 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4"
            >
              Featured Cities
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: citiesInView ? 1 : 0, y: citiesInView ? 0 : 20 }}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 px-2 sm:px-0"
            >
              Find Accommodations in Top Educational Hubs
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {cities.map((city, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: citiesInView ? 1 : 0, y: citiesInView ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-lg"
                onClick={() => navigate('/accommodations', { state: { city: city.name } })}
              >
                <div className="aspect-w-4 aspect-h-3">
                  <img 
                    src={city.image} 
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white group-hover:text-blue-200 transition-colors duration-300">
                        {city.name}
                      </h3>
                      <p className="text-blue-200 font-medium flex items-center text-sm sm:text-base">
                        <Building className="w-4 h-4 mr-2" />
                        {city.count} Properties
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white px-2 sm:px-0">
              Ready to Find Your Perfect Home?
            </h3>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-10 px-2 sm:px-0">
              Join thousands of students who have found their ideal accommodation through Way2PG
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  size="large" 
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 inline-block" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button 
                  size="large" 
                  onClick={() => navigate('/about')}
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;