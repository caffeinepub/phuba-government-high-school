import { Link } from '@tanstack/react-router';
import { Users, Megaphone, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: 'Student Directory',
      description: 'Browse and search through our comprehensive student database with class information.',
      link: '/students',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      icon: Megaphone,
      title: 'Announcements',
      description: 'Stay updated with the latest school news, notices, and important announcements.',
      link: '/announcements',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-950',
    },
    {
      icon: Clock,
      title: 'Class Schedules',
      description: 'View detailed class schedules organized by grade and section for easy planning.',
      link: '/schedules',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      icon: Calendar,
      title: 'Events Calendar',
      description: 'Keep track of upcoming school events, activities, and important dates.',
      link: '/events',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
  ];

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
              Your comprehensive portal for student information, announcements, schedules, and school events.
              Stay connected with our vibrant academic community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link to="/students">
                  Explore Students
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/announcements">View Announcements</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Interactive Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Access all the tools and information you need in one convenient location
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="group-hover:translate-x-1 transition-transform">
                    <Link to={feature.link}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 border-y border-border/40 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Students', value: '1000+' },
              { label: 'Teachers', value: '50+' },
              { label: 'Classes', value: '30+' },
              { label: 'Events/Year', value: '100+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
