import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Search, Mail, Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is Evently and how does it work?",
          answer: "Evently is a comprehensive event management platform that connects event organizers with participants. Users can discover, register for, and participate in events, while organizers can create, manage, and track their events with powerful analytics and tools."
        },
        {
          question: "Is Evently free to use?",
          answer: "Yes! Evently offers a free tier for basic event discovery and registration. We also have premium features for organizers who need advanced analytics, custom branding, and priority support."
        },
        {
          question: "How do I get started with Evently?",
          answer: "Getting started is easy! Simply create a free account, complete your profile, and start exploring events. You can browse by category, search for specific topics, or let our recommendation engine suggest events based on your interests."
        }
      ]
    },
    {
      category: "Events",
      questions: [
        {
          question: "How do I register for an event?",
          answer: "To register for an event, simply browse our events page, find an event that interests you, and click the 'Register Now' button. You'll receive a confirmation email with all the event details and any additional instructions."
        },
        {
          question: "Can I cancel my registration?",
          answer: "Yes, you can cancel your registration up to 24 hours before the event starts. Simply go to your dashboard, find the event, and click 'Cancel Registration'. Please note that some events may have specific cancellation policies."
        },
        {
          question: "How do I know if an event is legitimate?",
          answer: "All events on our platform are verified by our team. We check organizer credentials, event details, and maintain a review system. Look for the verified badge next to event organizers and read participant reviews before registering."
        },
        {
          question: "What types of events are available?",
          answer: "We host a wide variety of events including tech conferences, workshops, networking meetups, educational seminars, cultural events, sports activities, and much more. Events are categorized to help you find exactly what you're looking for."
        }
      ]
    },
    {
      category: "Organizers",
      questions: [
        {
          question: "How do I create an event?",
          answer: "To create an event, log in to your account and click 'Create Event' in your dashboard. Fill out the event details including title, description, date, time, location, and any special requirements. Our platform will guide you through the process step by step."
        },
        {
          question: "What tools are available for event organizers?",
          answer: "Organizers have access to comprehensive tools including attendee management, real-time analytics, email marketing, certificate generation, payment processing, and detailed reporting. You can also customize your event pages with your branding."
        },
        {
          question: "How do I manage event attendees?",
          answer: "Our dashboard provides a complete attendee management system where you can view registrations, send updates, check-in attendees, generate reports, and communicate with participants through built-in messaging tools."
        },
        {
          question: "Can I generate certificates for attendees?",
          answer: "Yes! Our platform includes a certificate generation feature that allows you to create and distribute digital certificates to attendees. You can customize the design and include event details, attendee names, and completion dates."
        }
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          question: "What devices and browsers are supported?",
          answer: "Evently works on all modern devices including desktop computers, tablets, and smartphones. We support all major browsers including Chrome, Firefox, Safari, and Edge. Our responsive design ensures optimal experience across all screen sizes."
        },
        {
          question: "How secure is my data?",
          answer: "We take data security seriously and use enterprise-grade encryption, secure servers, and follow industry best practices. Your personal information is protected and we never share your data with third parties without your explicit consent."
        },
        {
          question: "What if I experience technical issues?",
          answer: "If you encounter any technical problems, please contact our support team through the help center or email support@evently.com. We typically respond within 24 hours and have a comprehensive knowledge base with troubleshooting guides."
        },
        {
          question: "Can I integrate Evently with other platforms?",
          answer: "Yes, we offer API access and integrations with popular platforms like Zoom, Google Calendar, Slack, and various CRM systems. Contact our team to learn more about available integrations for your specific needs."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-purple-200" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                Find answers to common questions about Evently. Can't find what you're looking for? Contact our support team.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg"
            />
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFaqs.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                  {categoryIndex + 1}
                </div>
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = `${categoryIndex}-${faqIndex}`;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <motion.div
                      key={faqIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: faqIndex * 0.1 }}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
        ))}
      </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Our support team is here to help you get the most out of Evently.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 rounded-xl">
                <Mail className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Get help via email within 24 hours</p>
                <a href="mailto:yazhinigp2006.com" className="text-purple-600 hover:text-purple-700 font-medium">
                  yazhinigp2006@gmail.com
                </a>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-xl">
                <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with us in real-time</p>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  Start Chat
                </button>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-xl">
                <Phone className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-4">Call us for urgent issues</p>
                <a href="tel:+91 9345655102" className="text-purple-600 hover:text-purple-700 font-medium">
                  +91 9345655102
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
