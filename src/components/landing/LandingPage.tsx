import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  BarChart2,
  Mail,
  FileText,
} from "lucide-react";
import AnimatedBackground from "../layout/AnimatedBackground";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />

      {/* Navigation */}
      <header className="relative z-10 container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="SurveyFlow AI Logo"
            className="w-10 h-10 rounded-lg"
          />
          <span className="font-bold text-xl">SurveyFlow AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/auth?mode=signin">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/auth?mode=signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 pb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          AI-Powered Survey Response Management
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Transform your survey data into personalized responses with our
          advanced AI technology. Save time and increase engagement with
          automated, human-like responses.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/auth?mode=signup">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6"
            asChild
          >
            <Link to="/demo">Watch Demo</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl font-bold mb-2">98%</div>
            <div className="text-muted-foreground">Response Accuracy</div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl font-bold mb-2">75%</div>
            <div className="text-muted-foreground">Time Saved</div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl font-bold mb-2">3x</div>
            <div className="text-muted-foreground">Engagement Increase</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-muted/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-lg">
              <Mail className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Campaign Manager</h3>
              <p className="text-muted-foreground">
                Create and manage email campaigns with customizable templates
                and scheduling options.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg">
              <FileText className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">CSV Upload</h3>
              <p className="text-muted-foreground">
                Easily import your survey data with our drag-and-drop CSV
                uploader.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg">
              <CheckCircle className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Responses</h3>
              <p className="text-muted-foreground">
                Generate personalized, human-like responses to survey feedback
                automatically.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg">
              <BarChart2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-muted-foreground">
                Track response rates, engagement metrics, and email delivery
                status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
            <p className="italic mb-4">
              "SurveyFlow AI has revolutionized how we handle customer feedback.
              We've seen a 40% increase in customer satisfaction since
              implementing it."
            </p>
            <div className="font-semibold">Sarah Johnson</div>
            <div className="text-sm text-muted-foreground">
              Customer Success Manager, TechCorp
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
            <p className="italic mb-4">
              "The time savings alone are worth it. What used to take our team
              days now happens automatically with better results."
            </p>
            <div className="font-semibold">Michael Chen</div>
            <div className="text-sm text-muted-foreground">
              Marketing Director, GrowthLabs
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
            <p className="italic mb-4">
              "The AI responses are so natural that our customers can't tell
              they're automated. It's truly impressive technology."
            </p>
            <div className="font-semibold">Emily Rodriguez</div>
            <div className="text-sm text-muted-foreground">CTO, InnovateX</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 bg-muted/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            Choose the plan that works best for your needs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Subscription */}
            <div className="bg-card rounded-lg overflow-hidden shadow-lg">
              <div className="bg-primary p-6 text-primary-foreground text-center">
                <h3 className="text-2xl font-bold mb-2">
                  Monthly Subscription
                </h3>
                <div className="text-4xl font-bold mb-2">$20</div>
                <p>per month</p>
              </div>

              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Full access to all features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>37,000 credits monthly</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Regular feature updates</span>
                  </li>
                </ul>

                <Button className="w-full mt-6" size="lg" asChild>
                  <Link to="/auth?mode=signup">Subscribe Now</Link>
                </Button>
              </div>
            </div>

            {/* Pay As You Go */}
            <div className="bg-card rounded-lg overflow-hidden shadow-lg">
              <div className="bg-primary p-6 text-primary-foreground text-center">
                <h3 className="text-2xl font-bold mb-2">Pay As You Go</h3>
                <div className="text-4xl font-bold mb-2">$30</div>
                <p>37,000 credits</p>
              </div>

              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Full access to all features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>AI-powered response generation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>CSV data import</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>No recurring payments</span>
                  </li>
                </ul>

                <Button className="w-full mt-6" size="lg" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Survey Responses?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Join thousands of businesses saving time and improving customer
          engagement with SurveyFlow AI.
        </p>

        <Button size="lg" className="text-lg px-8 py-6" asChild>
          <Link to="/auth?mode=signup">
            Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-card/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img
                src="/logo.png"
                alt="SurveyFlow AI Logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="font-bold">SurveyFlow AI</span>
            </div>

            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SurveyFlow AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
