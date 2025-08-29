"use client";
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How long does it take to set up MySchoolManager?",
      answer: "Most schools can be up and running within 24-48 hours. Our setup process includes data migration, user account creation, and basic configuration. We provide dedicated support throughout the entire process."
    },
    {
      question: "Is my school's data secure?",
      answer: "Absolutely. We use enterprise-grade security measures including SSL encryption, secure data centers, regular backups, and comply with FERPA and other educational privacy regulations. Your data is protected with bank-level security."
    },
    {
      question: "Can I import data from our current system?",
      answer: "Yes! We support data import from most major school management systems and spreadsheet formats. Our team will help you migrate student records, grades, attendance data, and other important information seamlessly."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer comprehensive support including email support for all plans, priority support for Medium and Large plans, and 24/7 dedicated support for Large plans. We also provide training materials, video tutorials, and webinars."
    },
    {
      question: "Can parents access the system?",
      answer: "Yes! Parents get their own portal where they can view their child's grades, attendance, assignments, and communicate with teachers. They also receive automated notifications about important updates."
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes, we have mobile apps for both iOS and Android. Teachers, students, and parents can access their dashboards, receive notifications, and stay connected from anywhere."
    },
    {
      question: "What happens if I need to cancel?",
      answer: "You can cancel your subscription at any time. We provide 30 days notice before cancellation to help you export your data. There are no cancellation fees or long-term contracts."
    },
    {
      question: "Do you offer training for our staff?",
      answer: "Yes! We provide comprehensive training including live webinars, recorded tutorials, user guides, and for Large plans, we offer custom on-site or virtual training sessions for your staff."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Get answers to common questions about MySchoolManager
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-gray-500" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;