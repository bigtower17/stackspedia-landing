"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectWithStack } from '@/lib/types';
import Link from 'next/link';
import { Star, TrendingUp, Palette, Database, Rocket, Settings, Zap, GitFork } from 'lucide-react';

export default function TrendingPage() {
  const [projects, setProjects] = useState<ProjectWithStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/projects?per_page=20');
        const data = await response.json();
        
        if (response.ok) {
          // Sort by metrics (stars, recent activity, etc.)
          const sortedProjects = data.projects.sort((a: ProjectWithStack, b: ProjectWithStack) => {
            const aScore = (a.metrics?.stars || 0) + (a.metrics?.forks || 0);
            const bScore = (b.metrics?.stars || 0) + (b.metrics?.forks || 0);
            return bScore - aScore;
          });
          setProjects(sortedProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedPeriod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'stale': return 'bg-yellow-100 text-yellow-700';
      case 'deprecated': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  const getTrendingScore = (project: ProjectWithStack) => {
    const stars = project.metrics?.stars || 0;
    const forks = project.metrics?.forks || 0;
    const issues = project.metrics?.open_issues || 0;
    
    // Simple trending score calculation
    return stars + (forks * 2) + Math.max(0, 100 - issues);
  };

  const getTrendingIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '📈';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'frontend': return <Palette className="w-4 h-4" />;
      case 'backend': return <Database className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'ci_cd': return <Settings className="w-4 h-4" />;
      case 'devops': return <Rocket className="w-4 h-4" />;
      case 'tooling': return <Settings className="w-4 h-4" />;
      case 'runtime': return <Zap className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trending</h1>
          <p className="text-gray-600">
            Discover the fastest growing and most popular open source projects
          </p>
        </div>

        {/* Period Filter */}
        <div className="mb-8">
          <div className="flex gap-2">
            {periods.map(period => (
              <Button
                key={period.id}
                variant={selectedPeriod === period.id ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period.id)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Trending Projects */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 border border-gray-200 rounded-lg animate-pulse">
                <div className="flex items-start gap-6">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project, index) => (
              <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-6">
                  {/* Ranking */}
                  <div className="flex flex-col items-center">
                    <div className="text-2xl mb-1">{getTrendingIcon(index)}</div>
                    <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                  </div>

                  {/* Project Logo */}
                  <div className="flex-shrink-0">
                    {project.logo_url ? (
                      <img 
                        src={project.logo_url} 
                        alt={project.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link href={`/projects/${project.slug}`}>
                        <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description || 'No description available'}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.stack_components.slice(0, 5).map((component) => (
                        <span 
                          key={component.id}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStackTypeColor(component.type)}`}
                        >
                          {component.name}
                        </span>
                      ))}
                      {project.stack_components.length > 5 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          +{project.stack_components.length - 5}
                        </span>
                      )}
                    </div>

                    {/* Metrics and Links */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        {project.metrics?.stars && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" /> {project.metrics.stars.toLocaleString()}
                          </span>
                        )}
                        {project.metrics?.forks && (
                          <span className="flex items-center gap-1">
                            <GitFork className="w-4 h-4" /> {project.metrics.forks.toLocaleString()}
                          </span>
                        )}
                        {project.metrics?.open_issues && (
                          <span className="flex items-center gap-1">
                            🐛 {project.metrics.open_issues.toLocaleString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> {getTrendingScore(project)} trending score
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/projects/${project.slug}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        {project.repo_url && (
                          <Button asChild variant="outline" size="sm">
                            <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                              GitHub
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No trending projects yet</h2>
            <p className="text-gray-600 mb-6">
              Be the first to add projects and help build the trending list!
            </p>
            <Link
              href="/add-project"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Your Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 