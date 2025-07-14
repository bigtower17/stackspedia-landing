"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectWithStack } from '@/lib/types';
import Link from 'next/link';
import { Star, GitFork, ArrowLeft } from 'lucide-react';

export default function FeaturedProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithStack[]>([]);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/projects?featured=true&per_page=100');
        const data = await response.json();
        
        if (response.ok) {
          setProjects(data.projects);
          setFilteredProjects(data.projects);
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const getStackTypeColor = (type: string) => {
    switch (type) {
      case 'frontend': return 'bg-blue-100 text-blue-700';
      case 'backend': return 'bg-green-100 text-green-700';
      case 'database': return 'bg-purple-100 text-purple-700';
      case 'ci_cd': return 'bg-orange-100 text-orange-700';
      case 'devops': return 'bg-red-100 text-red-700';
      case 'tooling': return 'bg-gray-100 text-gray-700';
      case 'runtime': return 'bg-yellow-100 text-yellow-700';
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
    <Card className="p-6 hover:shadow-md transition-shadow">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="flex items-start gap-4">
          {project.logo_url && (
            <img 
              src={project.logo_url} 
              alt={project.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
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
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Featured Projects</h1>
          </div>
          <p className="text-lg text-gray-600">
            Discover our carefully curated selection of outstanding open source projects
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mb-8">
          <Input
            type="text"
            placeholder="Search featured projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-4 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredProjects.length} featured project{filteredProjects.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No featured projects found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'No projects have been featured yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 