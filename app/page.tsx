
import Header from '../components/Header'
import Hero from '../components/Hero'
import ProductShowcase from '../components/ProductShowcase'
import Testimonials from '../components/Testimonials'
import Pricing from '../components/Pricing'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'
import Features from '../components/Features'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'

export default function Home() {
  return (
    <div className=" bg-white">
      <Header/>
      <Hero />
      <Features/>
      <ProductShowcase />
      <Testimonials />
      <Pricing />
      <Newsletter />
      <FAQ/>
      <CTA/>
      <Footer />
    </div>
  );
}
