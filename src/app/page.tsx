"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectWithStack } from '@/lib/types';
import Link from 'next/link';
import { Star, Rocket, GitFork } from 'lucide-react';

export default function HomePage() {
  const [popularProjects, setPopularProjects] = useState<ProjectWithStack[]>([]);
  const [newestProjects, setNewestProjects] = useState<ProjectWithStack[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<ProjectWithStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Fetch featured projects
        const featuredResponse = await fetch('/api/projects?featured=true&per_page=6');
        const featuredData = await featuredResponse.json();
        
        // Fetch popular projects (you could order by stars or other metrics)
        const popularResponse = await fetch('/api/projects?per_page=6');
        const popularData = await popularResponse.json();
        
        // Fetch newest projects
        const newestResponse = await fetch('/api/projects?per_page=6');
        const newestData = await newestResponse.json();
        
        if (featuredResponse.ok) {
          setFeaturedProjects(featuredData.projects);
        }
        if (popularResponse.ok) {
          setPopularProjects(popularData.projects);
        }
        if (newestResponse.ok) {
          setNewestProjects(newestData.projects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getStackTypeColor = (type: string) => {
    switch (type) {
      case 'frontend': return 'bg-blue-100 text-blue-700';
      case 'backend': return 'bg-green-100 text-green-700';
      case 'database': return 'bg-purple-100 text-purple-700';
      case 'ci_cd': return 'bg-orange-100 text-orange-700';
      case 'devops': return 'bg-red-100 text-red-700';
      case 'tooling': return 'bg-yellow-100 text-yellow-700';
      case 'runtime': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'stale': return 'bg-yellow-100 text-yellow-700';
      case 'deprecated': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ProjectCard = ({ project }: { project: ProjectWithStack }) => (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200 border border-gray-200">
      <div className="flex items-start gap-4">
        {project.logo_url && (
          <img 
            src={project.logo_url} 
            alt={project.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/projects/${project.slug}`}>
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
            </Link>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {project.description || 'No description available'}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {project.stack_components.slice(0, 3).map((component) => (
              <span 
                key={component.id}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStackTypeColor(component.type)}`}
              >
                {component.name}
              </span>
            ))}
            {project.stack_components.length > 3 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                +{project.stack_components.length - 3}
              </span>
            )}
          </div>
          
          {project.metrics && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {project.metrics.stars && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" /> {project.metrics.stars}
                </span>
              )}
              {project.metrics.forks && (
                <span className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" /> {project.metrics.forks}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover the best open source projects
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            A growing, open-source database of the best OSS projects <Rocket className="inline w-5 h-5 ml-1" />
          </p>
          <p className="text-lg text-gray-500">
            Designed to make the ecosystem more transparent and accessible
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-4 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Button 
              type="submit" 
              className="absolute right-2 top-2 h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Featured projects
              </h2>
              <Link href="/featured" className="text-blue-600 hover:text-blue-700 font-medium">
                See all →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Popular Projects */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Popular projects</h2>
            <Link href="/popular" className="text-blue-600 hover:text-blue-700 font-medium">
              See all →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 border border-gray-200 rounded-lg animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Newest Projects */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Newest projects</h2>
            <Link href="/newest" className="text-blue-600 hover:text-blue-700 font-medium">
              See all →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 border border-gray-200 rounded-lg animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newestProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Know a great project?
          </h3>
          <p className="text-gray-600 mb-6">
            Help us grow the database by submitting your favorite open source projects.
          </p>
          <Link href="/add-project">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Add a project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}