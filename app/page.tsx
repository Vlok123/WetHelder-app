import Link from 'next/link'
import { Scale, MessageSquare, Shield, ArrowRight, CheckCircle, BookOpen } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-purple-50/20">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">WetHelder</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="nav-link">Features</Link>
              <Link href="#contact" className="nav-link">Contact</Link>
              <Link href="/auth/signin" className="btn btn-secondary">Inloggen</Link>
              <Link href="/auth/signup" className="btn btn-primary">Gratis Starten</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
                <BookOpen className="w-4 h-4 mr-2" />
                Nederlandse Juridische Hulp
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6 animate-slide-up">
              Nederlandse Wet
              <span className="text-gradient block">Simpel Gemaakt</span>
            </h1>
            
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-10 animate-slide-up">
              Krijg direct antwoord op juridische vragen en controleer verkeersboetes. 
              Alles in één gebruiksvriendelijke interface.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link href="/auth/signup" className="btn btn-primary text-lg px-8 py-3 shadow-elegant">
                Start Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-neutral-500 animate-fade-in">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Gratis te gebruiken
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Nederlandse wetgeving
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Gebruiksvriendelijk
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <svg className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" stroke="url(#hero-pattern)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Alles wat je nodig hebt
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Van juridische hulp tot verkeersboetes - Nederlandse juridische informatie binnen handbereik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Chat Assistant */}
            <Link href="/chat" className="feature-card">
              <div className="feature-icon">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Juridische Hulp
              </h3>
              <p className="text-neutral-600 mb-4">
                Stel juridische vragen in gewoon Nederlands en krijg direct uitgebreide antwoorden gebaseerd op Nederlandse wetgeving.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                Start Chat
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Verkeersboetes */}
            <Link href="/boetes" className="feature-card">
              <div className="feature-icon">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Verkeersboetes Checker
              </h3>
              <p className="text-neutral-600 mb-4">
                Controleer snel de hoogte van verkeersboetes en krijg uitleg over verschillende overtredingen.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                Zoek Boetes
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Meld je gratis aan en krijg direct toegang tot alle functies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="bg-white text-blue-600 hover:bg-neutral-50 btn text-lg px-8 py-3 shadow-elegant">
              Gratis Account Maken
            </Link>
            <Link href="/auth/signin" className="text-white border border-white/20 hover:bg-white/10 btn text-lg px-8 py-3">
              Al een account? Inloggen
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">WetHelder</span>
              </div>
              <p className="text-neutral-400 max-w-md">
                Nederlandse juridische informatie toegankelijk gemaakt. 
                Snel, betrouwbaar en gebruiksvriendelijk.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/chat" className="hover:text-white transition-colors">Juridische Hulp</Link></li>
                <li><Link href="/boetes" className="hover:text-white transition-colors">Verkeersboetes</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-12 pt-8 text-center">
            <p>© 2024 WetHelder. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 