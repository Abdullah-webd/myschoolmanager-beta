function About() {
  const benefits = [
    {
      icon: "📝",
      title: "Assign Exams Easily",
      description: "Create, schedule, and distribute exams with our intuitive exam management system. Set up automated grading and instant result notifications."
    },
    {
      icon: "📊",
      title: "Track Student Progress",
      description: "Monitor individual student performance with detailed analytics, attendance tracking, and comprehensive progress reports for informed decision-making."
    },
    {
      icon: "👥",
      title: "Manage Teachers Seamlessly",
      description: "Streamline teacher management with scheduling tools, performance tracking, and communication features that enhance collaboration."
    }
  ]

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            About My School Manager
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            My School Manager is a comprehensive digital platform designed to revolutionize how educational 
            institutions operate. We provide schools with powerful tools to manage students, teachers, 
            assessments, and communications all in one centralized system, making education management 
            more efficient and effective than ever before.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up border border-gray-100"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className="text-4xl mb-6 text-center">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About