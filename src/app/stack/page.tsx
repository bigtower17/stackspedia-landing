"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StackComponent } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Settings, Palette, Database, Rocket, Zap, Server, Layers } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'frontend', label: 'Frontend', icon: Palette },
  { id: 'backend', label: 'Backend', icon: Server },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'ci_cd', label: 'CI/CD', icon: Settings },
  { id: 'devops', label: 'DevOps', icon: Rocket },
  { id: 'tooling', label: 'Tooling', icon: Settings },
  { id: 'runtime', label: 'Runtime', icon: Zap },
];

export default function StackPage() {
  const [components, setComponents] = useState<StackComponent[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<StackComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stack-components');
        const data = await response.json();
        
        if (response.ok) {
          setComponents(data);
          setFilteredComponents(data);
        }
      } catch (error) {
        console.error('Error fetching components:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  useEffect(() => {
    let filtered = components;

    // Filter by type
    if (activeCategory !== 'all') {
      filtered = filtered.filter(comp => comp.type === activeCategory);
    }

    // Filter by search query
    if (searchTerm) {
      filtered = filtered.filter(comp => 
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComponents(filtered);
  }, [components, activeCategory, searchTerm]);

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

  const getTypeStats = () => {
    const stats = categories.map(type => ({
      ...type,
      count: type.id === 'all' ? components.length : components.filter(c => c.type === type.id).length
    }));
    return stats;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stack Components
          </h1>
          <p className="text-gray-600">
            Explore the technologies powering the best open source projects
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Components Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 border border-gray-200 rounded-lg animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <Card key={component.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  {component.icon_url ? (
                    <img 
                      src={component.icon_url} 
                      alt={component.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{component.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStackTypeColor(component.type)}`}>
                      {component.type}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {component.description || 'No description available'}
                </p>
                
                {component.official_url && (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={component.official_url} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredComponents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No components found</h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 