import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Small School",
      price: "49",
      description: "Perfect for schools with up to 200 students",
      features: [
        "Up to 200 students",
        "10 teacher accounts",
        "Basic analytics",
        "Email support",
        "Mobile app access",
        "Grade management",
        "Attendance tracking"
      ],
      popular: false,
      buttonText: "Start Free Trial",
      buttonClass: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
    },
    {
      name: "Medium School",
      price: "99",
      description: "Ideal for schools with 201-800 students",
      features: [
        "Up to 800 students",
        "Unlimited teacher accounts",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "Parent portal",
        "Communication tools",
        "Timetable management"
      ],
      popular: true,
      buttonText: "Start Free Trial",
      buttonClass: "bg-blue-600 text-white hover:bg-blue-700"
    },
    {
      name: "Large School",
      price: "199",
      description: "For schools with 800+ students",
      features: [
        "Unlimited students",
        "Unlimited teacher accounts",
        "Premium analytics",
        "24/7 dedicated support",
        "Custom integrations",
        "API access",
        "Advanced reporting",
        "Multi-campus support",
        "Custom training"
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonClass: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose the Perfect Plan for Your School
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible pricing that grows with your school. All plans include a 30-day free trial 
            and can be cancelled anytime.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-2xl border-2 p-8 ${plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${plan.buttonClass}`}>
                <span>{plan.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need a custom solution? We work with large districts and international schools.
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Contact our Enterprise team →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;