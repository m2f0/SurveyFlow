import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AnimatedBackground from "../layout/AnimatedBackground";

const DemoPage = () => {
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
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild>
            <Link to="/auth?mode=signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      {/* Demo Videos Section */}
      <section className="relative z-10 container mx-auto px-4 pt-16 pb-32">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Watch SurveyFlow AI in Action
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Video 1 */}
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Product Overview</h2>
            <div className="aspect-video rounded-md overflow-hidden mb-4">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/0H7vrhWSKX4"
                title="SurveyFlow AI Product Overview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-muted-foreground">
              Get a comprehensive overview of SurveyFlow AI's features and
              capabilities in this short demonstration.
            </p>
          </div>

          {/* Video 2 */}
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Advanced Features Tutorial
            </h2>
            <div className="aspect-video rounded-md overflow-hidden mb-4">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/VdOR9qMOcIE"
                title="SurveyFlow AI Advanced Features"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-muted-foreground">
              Learn how to use the advanced features of SurveyFlow AI to
              maximize your productivity and response quality.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of businesses already using SurveyFlow AI to
            transform their survey responses.
          </p>
          <Button size="lg" className="px-8" asChild>
            <Link to="/auth?mode=signup">Sign Up Now</Link>
          </Button>
        </div>
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

export default DemoPage;
