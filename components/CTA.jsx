import React from 'react';
import { ArrowRight, Users, Clock, Shield } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of schools worldwide that trust MySchoolManager to streamline 
            their operations and enhance the educational experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-200" />
            </div>
            <h3 className="text-lg font-semibold mb-2">500+ Schools</h3>
            <p className="text-blue-200">Already trust our platform</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-200" />
            </div>
            <h3 className="text-lg font-semibold mb-2">24-48 Hours</h3>
            <p className="text-blue-200">Average setup time</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-200" />
            </div>
            <h3 className="text-lg font-semibold mb-2">99.9% Uptime</h3>
            <p className="text-blue-200">Reliable and secure</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
              <span>Start Your Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="border-2 border-white hover:bg-white hover:text-blue-900 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
              <span>Schedule a Demo</span>
            </button>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;