"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Database, Server, Settings, Rocket, Zap } from 'lucide-react';
import { ProjectWithStack, StackComponent } from '@/lib/types';

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<ProjectWithStack[]>([]);
  const [components, setComponents] = useState<StackComponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsResponse, componentsResponse] = await Promise.all([
          fetch('/api/projects?per_page=100'),
          fetch('/api/stack-components')
        ]);

        const projectsData = await projectsResponse.json();
        const componentsData = await componentsResponse.json();

        if (projectsResponse.ok) {
          setProjects(projectsData.projects);
        }
        if (componentsResponse.ok) {
          setComponents(componentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const stale = projects.filter(p => p.status === 'stale').length;
    const deprecated = projects.filter(p => p.status === 'deprecated').length;

    return { total, active, stale, deprecated };
  };

  const getStackStats = () => {
    const stackTypes = ['frontend', 'backend', 'database', 'ci_cd', 'devops', 'tooling', 'runtime'];
    return stackTypes.map(type => ({
      type,
      count: components.filter(c => c.type === type).length
    }));
  };

  const getTopTechnologies = () => {
    const techCount = new Map<string, number>();
    
    projects.forEach(project => {
      project.stack_components?.forEach(component => {
        techCount.set(component.name, (techCount.get(component.name) || 0) + 1);
      });
    });

    return Array.from(techCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  };

  const getProjectsByCategory = () => {
    const categories = new Map<string, number>();
    
    projects.forEach(project => {
      project.stack_components?.forEach(component => {
        categories.set(component.type, (categories.get(component.type) || 0) + 1);
      });
    });

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));
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

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'frontend': return <Palette className="w-4 h-4" />;
      case 'backend': return <Server className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'ci_cd': return <Settings className="w-4 h-4" />;
      case 'devops': return <Rocket className="w-4 h-4" />;
      case 'tooling': return <Settings className="w-4 h-4" />;
      case 'runtime': return <Zap className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const projectStats = getProjectStats();
  const stackStats = getStackStats();
  const topTechnologies = getTopTechnologies();
  const projectsByCategory = getProjectsByCategory();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">
            Insights and statistics about the open source ecosystem
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {projectStats.total}
            </div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {projectStats.active}
            </div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {components.length}
            </div>
            <div className="text-sm text-gray-600">Stack Components</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stackStats.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Status Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Projects by Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-medium">{projectStats.active}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(projectStats.active / projectStats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Stale</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-medium">{projectStats.stale}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(projectStats.stale / projectStats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Deprecated</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-medium">{projectStats.deprecated}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(projectStats.deprecated / projectStats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stack Categories */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Stack Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              {stackStats.map(({ type, count }) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Technologies */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Most Popular Technologies</h2>
            <div className="space-y-3">
              {topTechnologies.map(({ name, count }, index) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{name}</span>
                      <span className="text-sm text-gray-500">{count} projects</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Projects by Category */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Projects by Category</h2>
            <div className="space-y-3">
              {projectsByCategory.map(({ type, count }) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xl">{getTypeIcon(type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">{count} uses</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...projectsByCategory.map(p => p.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 