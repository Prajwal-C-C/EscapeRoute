"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook as Facebook, FaInstagram as Instagram, FaLinkedin as Linkedin, FaTwitter as Twitter } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "Changelog"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Help Center", "Contact", "Privacy", "Terms"],
};

export function Footer() {
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const socialVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="bg-slate-900 text-slate-400 pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div 
              className="cursor-pointer mb-6"
              onClick={() => router.push("/")}
            >
              <div className="relative w-48 h-24">
                <Image
                  src="/images/logo-removebg-preview.png"
                  alt="EscapeRoute Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(39,120,142,0.5)]"
                  priority
                />
              </div>
            </div>
            
            <motion.p 
              variants={itemVariants}
              className="text-sm mb-6 leading-relaxed max-w-md"
            >
              Plan smarter. Travel better. AI-powered itineraries that help you discover the world effortlessly.
            </motion.p>
            
            {/* Social Icons with Framer Motion */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-4 mt-4"
            >
              <motion.a
                href="https://www.facebook.com/escaperoute"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                variants={socialVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <Facebook className="text-lg text-slate-400 hover:text-white transition-colors" />
              </motion.a>
              
              <motion.a
                href="https://www.instagram.com/escaperoute"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                variants={socialVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition-colors"
              >
                <Instagram className="text-lg text-slate-400 hover:text-white transition-colors" />
              </motion.a>
              
              <motion.a
                href="https://www.linkedin.com/company/escaperoute"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                variants={socialVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-700 flex items-center justify-center transition-colors"
              >
                <Linkedin className="text-lg text-slate-400 hover:text-white transition-colors" />
              </motion.a>
              
              <motion.a
                href="https://twitter.com/escaperoute"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                variants={socialVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-black flex items-center justify-center transition-colors"
              >
                <FaXTwitter className="text-lg text-slate-400 hover:text-white transition-colors" />
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div key={category} variants={itemVariants}>
              <motion.h3 
                className="text-white font-semibold text-sm mb-4"
              >
                {category}
              </motion.h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => router.push(`/${link.toLowerCase()}`)}
                      className="text-sm hover:text-white transition-colors relative group"
                    >
                      {link}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact Info with Animation */}
        <motion.div 
          variants={itemVariants}
          className="border-t border-slate-800 pt-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {[
                { icon: Mail, text: "hello@escaperoute.com", href: "mailto:hello@escaperoute.com" },
                { icon: Phone, text: "+1 (555) 123-4567", href: "tel:+15551234567" },
                { icon: MapPin, text: "San Francisco, CA", href: "#" },
              ].map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.text}</span>
                </motion.a>
              ))}
            </div>
            <motion.p 
              className="text-sm"
              whileHover={{ scale: 1.05 }}
            >
              © 2026 EscapeRoute. All rights reserved.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}