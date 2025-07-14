"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectWithStack, ProjectFilters } from '@/lib/types';
import Link from 'next/link';

export default function PlatformPage() {
  const [projects, setProjects] = useState<ProjectWithStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: undefined,
    tags: [],
    stack_types: [],
  });

  const stackTypes = [
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'database', label: 'Database' },
    { id: 'ci_cd', label: 'CI/CD' },
    { id: 'devops', label: 'DevOps' },
    { id: 'tooling', label: 'Tooling' },
    { id: 'runtime', label: 'Runtime' },
  ] as const;

  const statusOptions = [
    { id: 'active', label: 'Attivo' },
    { id: 'stale', label: 'Stagnante' },
    { id: 'deprecated', label: 'Deprecato' },
  ] as const;

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      
      if (filters.search) searchParams.append('search', filters.search);
      if (filters.status) searchParams.append('status', filters.status);
      filters.tags?.forEach(tag => searchParams.append('tags', tag));
      filters.stack_types?.forEach(type => searchParams.append('stack_types', type));

      const response = await fetch(`/api/projects?${searchParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setProjects(data.projects);
      } else {
        console.error('Errore nel caricamento progetti:', data.error);
      }
    } catch (error) {
      console.error('Errore nel caricamento progetti:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const toggleStackType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      stack_types: prev.stack_types?.includes(type as any)
        ? prev.stack_types.filter(t => t !== type)
        : [...(prev.stack_types || []), type as any]
    }));
  };

  const setStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status as any
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'stale': return 'bg-yellow-100 text-yellow-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStackTypeColor = (type: string) => {
    switch (type) {
      case 'frontend': return 'bg-blue-100 text-blue-800';
      case 'backend': return 'bg-green-100 text-green-800';
      case 'database': return 'bg-purple-100 text-purple-800';
      case 'ci_cd': return 'bg-orange-100 text-orange-800';
      case 'devops': return 'bg-red-100 text-red-800';
      case 'tooling': return 'bg-yellow-100 text-yellow-800';
      case 'runtime': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Stackspedia Platform
          </h1>
          <p className="text-xl text-slate-300">
            Esplora i migliori progetti Open Source e scopri i loro stack tecnologici
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
            {/* Search Bar */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Cerca progetti..."
                value={filters.search}
                onChange={handleSearchChange}
                className="bg-white/10 border border-white/20 text-white placeholder:text-slate-400 h-12 text-lg rounded-xl"
              />
            </div>

            {/* Status Filter */}
            <div className="mb-6">
              <label className="text-white font-semibold mb-3 block">Stato</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(option => (
                  <Button
                    key={option.id}
                    variant={filters.status === option.id ? "default" : "outline"}
                    onClick={() => setStatus(option.id)}
                    className="rounded-full"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stack Type Filter */}
            <div className="mb-4">
              <label className="text-white font-semibold mb-3 block">Tecnologie</label>
              <div className="flex flex-wrap gap-2">
                {stackTypes.map(type => (
                  <Button
                    key={type.id}
                    variant={filters.stack_types?.includes(type.id) ? "default" : "outline"}
                    onClick={() => toggleStackType(type.id)}
                    className="rounded-full"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add Project Button */}
            <div className="flex justify-end">
              <Link href="/add-project">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  + Aggiungi Progetto
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Caricamento progetti...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {project.logo_url && (
                        <img 
                          src={project.logo_url} 
                          alt={project.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-white">{project.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 mb-4 line-clamp-2">
                    {project.description || 'Nessuna descrizione disponibile'}
                  </p>

                  {/* Stack Components */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.stack_components.slice(0, 4).map((component) => (
                        <span 
                          key={component.id}
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStackTypeColor(component.type)}`}
                        >
                          {component.name}
                        </span>
                      ))}
                      {project.stack_components.length > 4 && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{project.stack_components.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics */}
                  {project.metrics && (
                    <div className="mb-4 flex gap-4 text-sm text-slate-400">
                      {project.metrics.stars && (
                        <span>⭐ {project.metrics.stars}</span>
                      )}
                      {project.metrics.forks && (
                        <span>🍴 {project.metrics.forks}</span>
                      )}
                      {project.metrics.open_issues && (
                        <span>🐛 {project.metrics.open_issues}</span>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex gap-2">
                    <Link href={`/platform/projects/${project.slug}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        Dettagli
                      </Button>
                    </Link>
                    {project.repo_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                          GitHub
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              Nessun progetto trovato con i filtri selezionati
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 