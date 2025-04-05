"use client"

import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Code2, Zap, Database, FileText, Box, ArrowRight, Github, Twitter } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useInView } from "react-intersection-observer"

// Register ScrollTrigger with GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Animated Feature Card
function FeatureCard({ to, icon, title, description, delay = 0 }) {
  const cardRef = useRef(null)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        {
          y: 50,
          opacity: 0,
          rotationY: 15,
          transformPerspective: 1000,
        },
        {
          y: 0,
          opacity: 1,
          rotationY: 0,
          duration: 0.8,
          delay: delay,
          ease: "power3.out",
        },
      )
    }
  }, [inView, delay])

  return (
    <div ref={ref}>
      <Link
        to={to}
        className="group block p-6 bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform perspective-1000 hover:-translate-y-2 hover:scale-[1.02]"
        ref={cardRef}
      >
        <div className="text-indigo-600 mb-4 transform transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </Link>
    </div>
  )
}

// Animated Section with Parallax
function AnimatedSection({ children, className, parallax = false }) {
  const sectionRef = useRef(null)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView && sectionRef.current) {
      if (parallax) {
        gsap.to(sectionRef.current, {
          y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
      } else {
        gsap.fromTo(
          sectionRef.current,
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        )
      }
    }
  }, [inView, parallax])

  return (
    <div ref={ref} className={className}>
      <div ref={sectionRef} data-speed={parallax ? "0.1" : undefined}>{children}</div>
    </div>
  )
}

// Floating Background Elements with Parallax
function FloatingBackground() {
  const elementsRef = useRef([])

  useEffect(() => {
    elementsRef.current.forEach((element, index) => {
      gsap.to(element, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
    })
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        ref={el => elementsRef.current[0] = el}
        className="absolute top-20 left-20 w-64 h-64 bg-indigo-100 rounded-full opacity-20 animate-bounce-slow"
        data-speed="0.1"
      ></div>
      <div
        ref={el => elementsRef.current[1] = el}
        className="absolute top-40 right-40 w-48 h-48 bg-purple-100 rounded-full opacity-20 animate-bounce-slow animation-delay-1000"
        data-speed="0.15"
      ></div>
      <div
        ref={el => elementsRef.current[2] = el}
        className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-100 rounded-full opacity-20 animate-bounce-slow"
        data-speed="0.2"
      ></div>
      <div
        ref={el => elementsRef.current[3] = el}
        className="absolute bottom-40 right-20 w-56 h-56 bg-blue-100 rounded-full opacity-20 animate-bounce-slow animation-delay-1000"
        data-speed="0.25"
      ></div>
    </div>
  )
}

// Hero Background with Parallax
function HeroBackground() {
  const elementsRef = useRef([])

  useEffect(() => {
    elementsRef.current.forEach((element, index) => {
      gsap.to(element, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
        scale: (i, target) => 1 + (ScrollTrigger.maxScroll(window) * target.dataset.scale),
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
    })
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        ref={el => elementsRef.current[0] = el}
        className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50"
        data-speed="0.05"
        data-scale="0.0001"
      ></div>
      <div
        ref={el => elementsRef.current[1] = el}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full opacity-20 animate-pulse"
        data-speed="0.1"
        data-scale="0.0002"
      ></div>
      <div
        ref={el => elementsRef.current[2] = el}
        className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full opacity-20 animate-pulse animation-delay-1000"
        data-speed="0.15"
        data-scale="0.0003"
      ></div>
    </div>
  )
}

// Main Dashboard Component
export default function Dashboard() {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)
  const showcaseRef = useRef(null)

  useEffect(() => {
    // Initialize animations when component mounts
    const ctx = gsap.context(() => {
      // Hero section animation
      gsap.fromTo(
        heroRef.current.querySelector("h1"),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.2 },
      )

      gsap.fromTo(
        heroRef.current.querySelector("p"),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.4 },
      )

      gsap.fromTo(
        heroRef.current.querySelector(".buttons-container"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.6 },
      )

      // Features section scroll animation
      ScrollTrigger.create({
        trigger: featuresRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(
            featuresRef.current.querySelector("h2"),
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
          )
        },
      })

      // Showcase section parallax
      const showcaseElements = showcaseRef.current.querySelectorAll(".showcase-element")
      showcaseElements.forEach((element, index) => {
        gsap.to(element, {
          y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
      })

      // CTA section animation
      ScrollTrigger.create({
        trigger: ctaRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(
            ctaRef.current.children,
            { y: 30, opacity: 0, stagger: 0.1 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 },
          )
        },
      })
    })

    return () => ctx.revert() // Cleanup animations on unmount
  }, [])

  return (
    <div className="relative space-y-16 pb-16 overflow-hidden">
      {/* Floating background elements */}
      <FloatingBackground />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative text-center space-y-6 pt-16 pb-24 min-h-[700px] flex flex-col items-center justify-center"
      >
        {/* Hero Background */}
        <HeroBackground />

        {/* Content Overlay */}
        <div className="relative z-10 px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Developer Tools, <span className="text-indigo-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            TechStroke is your all-in-one platform for managing code snippets, testing APIs, handling environment
            variables, and more.
          </p>
          <div className="buttons-container flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/snippets"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors hover:shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1 duration-200"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors hover:shadow-md transform hover:-translate-y-1 duration-200"
            >
              <Github className="mr-2 h-5 w-5" /> View on GitHub
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="space-y-12 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Everything You Need
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            to="/snippets"
            icon={<Code2 className="h-8 w-8" />}
            title="Code Snippets"
            description="Save, organize, and search through your code snippets with powerful syntax highlighting and tagging system."
            delay={0}
          />
          <FeatureCard
            to="/api-tester"
            icon={<Zap className="h-8 w-8" />}
            title="API Tester"
            description="Test your APIs with an intuitive interface. Save requests, view response times, and manage collections."
            delay={0.1}
          />
          <FeatureCard
            to="/env-manager"
            icon={<Database className="h-8 w-8" />}
            title="Environment Manager"
            description="Securely manage your environment variables across different projects with encryption support."
            delay={0.2}
          />
          <FeatureCard
            to="/documentation"
            icon={<FileText className="h-8 w-8" />}
            title="Documentation Generator"
            description="Auto-generate comprehensive documentation from your codebase using AI-powered analysis."
            delay={0.3}
          />
          <FeatureCard
            to="/generator"
            icon={<Box className="h-8 w-8" />}
            title="Code Collab"
            description="Generate production-ready boilerplate code for your projects with customizable templates."
            delay={0.4}
          />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section relative py-24 overflow-hidden">
        {/* Parallax background elements */}
        <div
          className="parallax-bg absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50 to-white opacity-80"
          data-speed="0.1"
        ></div>
        <div
          className="parallax-bg absolute -top-20 -left-20 w-64 h-64 rounded-full bg-indigo-100 opacity-60"
          data-speed="0.2"
        ></div>
        <div
          className="parallax-bg absolute top-40 right-10 w-40 h-40 rounded-full bg-purple-100 opacity-60"
          data-speed="0.15"
        ></div>
        <div
          className="parallax-bg absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-pink-100 opacity-40"
          data-speed="0.25"
        ></div>

        <AnimatedSection className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Why Choose TechStroke?
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">All-in-One Solution</h3>
              <p className="text-gray-600 flex-grow">
                Everything you need in one place. No more switching between different tools.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Time-Saving</h3>
              <p className="text-gray-600 flex-grow">Automate repetitive tasks and focus on what matters - writing great code.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Developer-First</h3>
              <p className="text-gray-600 flex-grow">Built by developers for developers, with features you'll actually use.</p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Showcase Section with Parallax */}
      <section ref={showcaseRef} className="relative py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection className="space-y-6 showcase-element" data-speed="0.1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Powerful Developer Experience
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Our platform is designed to make your development workflow smoother and more efficient with powerful
                tools and intuitive interfaces.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Intuitive code organization with smart search</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Real-time collaboration with team members</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700">AI-powered code suggestions and improvements</p>
                </li>
              </ul>
            </AnimatedSection>

            <div className="relative h-[400px] showcase-element" data-speed="0.2">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-indigo-600 rounded-full mx-auto mb-6 animate-ping"></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Demo</h3>
                  <p className="text-gray-600">Experience the power of TechStroke firsthand</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="text-center space-y-8 py-20 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Ready to Get Started?
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join thousands of developers who are already using TechStroke to streamline their workflow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/snippets"
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors hover:shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1 duration-200"
          >
            Try It Free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            to="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors hover:shadow-md transform hover:-translate-y-1 duration-200"
          >
            <Twitter className="mr-2 h-5 w-5" /> Follow Updates
          </Link>
        </div>
      </section>
    </div>
  )
}

