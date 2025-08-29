import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Principal",
      school: "Lincoln Elementary School",
      content: "MySchoolManager has revolutionized how we operate. The admin dashboard gives me complete visibility into our school's performance, and the communication tools have improved parent engagement significantly.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Michael Chen",
      role: "Math Teacher",
      school: "Roosevelt High School",
      content: "The teacher portal is incredibly intuitive. I can track student progress, manage assignments, and communicate with parents all in one place. It's saved me hours every week.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Emily Rodriguez",
      role: "Student",
      school: "Washington Middle School",
      content: "I love being able to check my grades and assignments online. The student portal is so easy to use, and I never miss homework deadlines anymore!",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Dr. Robert Kim",
      role: "Superintendent",
      school: "Jefferson School District",
      content: "We've implemented MySchoolManager across all 15 schools in our district. The analytics and reporting features provide invaluable insights for district-wide decision making.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Lisa Thompson",
      role: "School Administrator",
      school: "Oakwood Academy",
      content: "The attendance tracking and grade management features have streamlined our operations significantly. Parents love the real-time updates and transparency.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "James Wilson",
      role: "IT Director",
      school: "Madison School District",
      content: "Implementation was smooth, and the security features give us peace of mind. The platform is reliable, scalable, and the support team is exceptional.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Schools Everywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of educators, administrators, and students who trust MySchoolManager 
            to transform their educational experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <Quote className="w-8 h-8 text-blue-500 mr-3" />
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-blue-600">{testimonial.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>4.9/5 average rating from 500+ schools</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;