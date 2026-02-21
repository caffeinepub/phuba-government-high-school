import { Link } from '@tanstack/react-router';
import { BookOpen, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="relative w-full bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border/40"
        style={{
          backgroundImage: 'url(/assets/generated/hero-background.dim_1920x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <img
                src="/assets/generated/school-logo.dim_200x200.png"
                alt="Phuba Government High School Logo"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-lg border-4 border-background"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Phuba Government High School
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Celebrating and preserving the rich cultural heritage of the Poumai people through poetry and literature.
              Explore our collection of traditional and modern Poumai poems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link to="/poumai-poems">
                  Explore Poems
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Poumai Cultural Heritage</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover the beauty and depth of Poumai poetry, preserving our traditions for future generations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Traditional Poems</CardTitle>
              <CardDescription className="text-base">
                Explore ancient Poumai poetry passed down through generations, preserving our oral traditions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Modern Expressions</CardTitle>
              <CardDescription className="text-base">
                Contemporary Poumai poetry that bridges tradition with modern themes and experiences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Cultural Context</CardTitle>
              <CardDescription className="text-base">
                Learn about the historical and cultural significance behind each poem and its meaning
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link to="/poumai-poems">
              View Full Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted/30 border-y border-border/40 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">About Our Collection</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              This digital archive serves as a living repository of Poumai poetry, featuring works that span
              traditional oral literature to contemporary written expressions. Each poem is presented with its
              original text, English translations where available, and cultural context to help preserve and share
              our rich literary heritage with the world.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
