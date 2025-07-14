"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StackComponent, ProjectFormData } from '@/lib/types';
import { Palette, Database, Server, Settings, Rocket, Zap, Plus, Trash2, Users, Heart, BookOpen, MessageSquare, Code, BarChart3 } from 'lucide-react';

// Enhanced form data interface
interface EnhancedProjectFormData extends ProjectFormData {
  contributors: {
    name: string;
    role: string;
    avatar_url?: string;
    github_url?: string;
    bio?: string;
  }[];
  sponsors: {
    name: string;
    tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
    logo_url?: string;
    website_url?: string;
    description?: string;
  }[];
  getting_started_guides: {
    title: string;
    description: string;
    prerequisites?: string;
    estimated_time?: string;
  }[];
  community_links: {
    type: 'discord' | 'twitter' | 'reddit' | 'mailing_list' | 'forum' | 'other';
    name: string;
    url: string;
    member_count?: number;
  }[];
  contributing_info: {
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    setup_time?: string;
    good_first_issues?: number;
    mentorship_available: boolean;
  };
  metrics: {
    health_score?: number;
    stars?: number;
    forks?: number;
    contributors_count?: number;
  };
}

export default function AddProjectPage() {
  const router = useRouter();
  const [stackComponents, setStackComponents] = useState<StackComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState<EnhancedProjectFormData>({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    homepage_url: '',
    repo_url: '',
    license: '',
    status: 'active',
    tags: [],
    visibility: true,
    stack_components: [],
    contributors: [],
    sponsors: [],
    getting_started_guides: [],
    community_links: [],
    contributing_info: {
      difficulty_level: 'beginner',
      mentorship_available: false,
    },
    metrics: {},
  });

  const [tagInput, setTagInput] = useState('');

  const categories = [
    { id: 'frontend', label: 'Frontend', icon: Palette },
    { id: 'backend', label: 'Backend', icon: Server },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'ci_cd', label: 'CI/CD', icon: Settings },
    { id: 'devops', label: 'DevOps', icon: Rocket },
    { id: 'tooling', label: 'Tooling', icon: Settings },
    { id: 'runtime', label: 'Runtime', icon: Zap },
  ];

  const sponsorTiers = [
    { id: 'diamond', label: 'Diamond', color: 'bg-purple-100 text-purple-700' },
    { id: 'platinum', label: 'Platinum', color: 'bg-gray-100 text-gray-700' },
    { id: 'gold', label: 'Gold', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'silver', label: 'Silver', color: 'bg-gray-100 text-gray-500' },
    { id: 'bronze', label: 'Bronze', color: 'bg-orange-100 text-orange-700' },
  ];

  const communityLinkTypes = [
    { id: 'discord', label: 'Discord' },
    { id: 'twitter', label: 'Twitter' },
    { id: 'reddit', label: 'Reddit' },
    { id: 'mailing_list', label: 'Mailing List' },
    { id: 'forum', label: 'Forum' },
    { id: 'other', label: 'Other' },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Rocket },
    { id: 'contributors', label: 'Contributors', icon: Users },
    { id: 'sponsors', label: 'Sponsors', icon: Heart },
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'contributing', label: 'Contributing', icon: Code },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  ];

  // Fetch stack components
  useEffect(() => {
    const fetchStackComponents = async () => {
      try {
        const response = await fetch('/api/stack-components');
        const data = await response.json();
        if (response.ok) {
          setStackComponents(data);
        }
      } catch (err) {
        console.error('Error loading components:', err);
      }
    };

    fetchStackComponents();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const handleInputChange = (field: keyof EnhancedProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleStackComponentToggle = (componentId: string) => {
    setFormData(prev => ({
      ...prev,
      stack_components: prev.stack_components.includes(componentId)
        ? prev.stack_components.filter(id => id !== componentId)
        : [...prev.stack_components, componentId]
    }));
  };

  // Contributors handlers
  const addContributor = () => {
    setFormData(prev => ({
      ...prev,
      contributors: [...prev.contributors, { name: '', role: '' }]
    }));
  };

  const updateContributor = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contributors: prev.contributors.map((contributor, i) =>
        i === index ? { ...contributor, [field]: value } : contributor
      )
    }));
  };

  const removeContributor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contributors: prev.contributors.filter((_, i) => i !== index)
    }));
  };

  // Sponsors handlers
  const addSponsor = () => {
    setFormData(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, { name: '', tier: 'bronze' as const }]
    }));
  };

  const updateSponsor = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.map((sponsor, i) =>
        i === index ? { ...sponsor, [field]: value } : sponsor
      )
    }));
  };

  const removeSponsor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, i) => i !== index)
    }));
  };

  // Getting Started handlers
  const addGettingStartedGuide = () => {
    setFormData(prev => ({
      ...prev,
      getting_started_guides: [...prev.getting_started_guides, { title: '', description: '' }]
    }));
  };

  const updateGettingStartedGuide = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      getting_started_guides: prev.getting_started_guides.map((guide, i) =>
        i === index ? { ...guide, [field]: value } : guide
      )
    }));
  };

  const removeGettingStartedGuide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      getting_started_guides: prev.getting_started_guides.filter((_, i) => i !== index)
    }));
  };

  // Community Links handlers
  const addCommunityLink = () => {
    setFormData(prev => ({
      ...prev,
      community_links: [...prev.community_links, { type: 'other' as const, name: '', url: '' }]
    }));
  };

  const updateCommunityLink = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      community_links: prev.community_links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeCommunityLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      community_links: prev.community_links.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error || 'Error creating project');
      }
    } catch (err) {
      setError('Error creating project');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project added successfully!</h1>
          <p className="text-gray-600 mb-6">Redirecting you to the homepage...</p>
          <Button onClick={() => router.push('/')}>
            Go to homepage
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add a new project
          </h1>
          <p className="text-gray-600">
            Create a comprehensive profile for your open source project
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g. My Awesome Project"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                      <Input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="my-awesome-project"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your project..."
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* URLs */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Links</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Repository URL</label>
                      <Input
                        type="url"
                        value={formData.repo_url}
                        onChange={(e) => handleInputChange('repo_url', e.target.value)}
                        placeholder="https://github.com/user/repo"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Homepage URL</label>
                      <Input
                        type="url"
                        value={formData.homepage_url}
                        onChange={(e) => handleInputChange('homepage_url', e.target.value)}
                        placeholder="https://myproject.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                      <Input
                        type="url"
                        value={formData.logo_url}
                        onChange={(e) => handleInputChange('logo_url', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License</label>
                      <Input
                        type="text"
                        value={formData.license}
                        onChange={(e) => handleInputChange('license', e.target.value)}
                        placeholder="MIT, Apache 2.0, GPL, etc."
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Status</h2>
                  <div className="flex gap-6">
                    {['active', 'stale', 'deprecated'].map(status => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={formData.status === status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags</h2>
                  <div className="flex gap-2 mb-4">
                    <Input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add a tag..."
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map(tag => (
                      <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stack Components */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Technology Stack</h2>
                  <div className="space-y-6">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div key={category.id} className="border border-gray-200 rounded-lg p-6">
                          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Icon className="w-4 h-4" /> {category.label}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {stackComponents.filter(c => c.type === category.id).map(component => (
                              <label key={component.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.stack_components.includes(component.id)}
                                  onChange={() => handleStackComponentToggle(component.id)}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 text-sm">{component.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Contributors Tab */}
            {activeTab === 'contributors' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Contributors</h2>
                  <Button type="button" onClick={addContributor} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contributor
                  </Button>
                </div>
                
                {formData.contributors.map((contributor, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Contributor {index + 1}</h3>
                      <Button 
                        type="button" 
                        onClick={() => removeContributor(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <Input
                          type="text"
                          value={contributor.name}
                          onChange={(e) => updateContributor(index, 'name', e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                        <Input
                          type="text"
                          value={contributor.role}
                          onChange={(e) => updateContributor(index, 'role', e.target.value)}
                          placeholder="Lead Developer"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                        <Input
                          type="url"
                          value={contributor.avatar_url || ''}
                          onChange={(e) => updateContributor(index, 'avatar_url', e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                        <Input
                          type="url"
                          value={contributor.github_url || ''}
                          onChange={(e) => updateContributor(index, 'github_url', e.target.value)}
                          placeholder="https://github.com/johndoe"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={contributor.bio || ''}
                        onChange={(e) => updateContributor(index, 'bio', e.target.value)}
                        placeholder="Brief bio about the contributor..."
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
                
                {formData.contributors.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No contributors added yet. Click "Add Contributor" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* Sponsors Tab */}
            {activeTab === 'sponsors' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Sponsors</h2>
                  <Button type="button" onClick={addSponsor} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sponsor
                  </Button>
                </div>
                
                {formData.sponsors.map((sponsor, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Sponsor {index + 1}</h3>
                      <Button 
                        type="button" 
                        onClick={() => removeSponsor(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <Input
                          type="text"
                          value={sponsor.name}
                          onChange={(e) => updateSponsor(index, 'name', e.target.value)}
                          placeholder="Company Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tier *</label>
                        <select
                          value={sponsor.tier}
                          onChange={(e) => updateSponsor(index, 'tier', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          {sponsorTiers.map(tier => (
                            <option key={tier.id} value={tier.id}>
                              {tier.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                        <Input
                          type="url"
                          value={sponsor.logo_url || ''}
                          onChange={(e) => updateSponsor(index, 'logo_url', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                        <Input
                          type="url"
                          value={sponsor.website_url || ''}
                          onChange={(e) => updateSponsor(index, 'website_url', e.target.value)}
                          placeholder="https://company.com"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={sponsor.description || ''}
                        onChange={(e) => updateSponsor(index, 'description', e.target.value)}
                        placeholder="Brief description of the sponsor..."
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
                
                {formData.sponsors.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No sponsors added yet. Click "Add Sponsor" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* Getting Started Tab */}
            {activeTab === 'getting-started' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Getting Started Guides</h2>
                  <Button type="button" onClick={addGettingStartedGuide} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Guide Step
                  </Button>
                </div>
                
                {formData.getting_started_guides.map((guide, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Step {index + 1}</h3>
                      <Button 
                        type="button" 
                        onClick={() => removeGettingStartedGuide(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <Input
                          type="text"
                          value={guide.title}
                          onChange={(e) => updateGettingStartedGuide(index, 'title', e.target.value)}
                          placeholder="Installation"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                        <Input
                          type="text"
                          value={guide.estimated_time || ''}
                          onChange={(e) => updateGettingStartedGuide(index, 'estimated_time', e.target.value)}
                          placeholder="5 minutes"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        value={guide.description}
                        onChange={(e) => updateGettingStartedGuide(index, 'description', e.target.value)}
                        placeholder="Detailed instructions for this step..."
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        required
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                      <textarea
                        value={guide.prerequisites || ''}
                        onChange={(e) => updateGettingStartedGuide(index, 'prerequisites', e.target.value)}
                        placeholder="List any prerequisites for this step..."
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
                
                {formData.getting_started_guides.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No getting started guides added yet. Click "Add Guide Step" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* Community Tab */}
            {activeTab === 'community' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Community Links</h2>
                  <Button type="button" onClick={addCommunityLink} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Community Link
                  </Button>
                </div>
                
                {formData.community_links.map((link, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Community Link {index + 1}</h3>
                      <Button 
                        type="button" 
                        onClick={() => removeCommunityLink(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                        <select
                          value={link.type}
                          onChange={(e) => updateCommunityLink(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          {communityLinkTypes.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <Input
                          type="text"
                          value={link.name}
                          onChange={(e) => updateCommunityLink(index, 'name', e.target.value)}
                          placeholder="Community Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                        <Input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateCommunityLink(index, 'url', e.target.value)}
                          placeholder="https://discord.gg/xyz"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Count</label>
                        <Input
                          type="number"
                          value={link.member_count || ''}
                          onChange={(e) => updateCommunityLink(index, 'member_count', parseInt(e.target.value) || 0)}
                          placeholder="1000"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {formData.community_links.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No community links added yet. Click "Add Community Link" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contributing Tab */}
            {activeTab === 'contributing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Contributing Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level *</label>
                    <select
                      value={formData.contributing_info.difficulty_level}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contributing_info: {
                          ...prev.contributing_info,
                          difficulty_level: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Setup Time</label>
                    <Input
                      type="text"
                      value={formData.contributing_info.setup_time || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contributing_info: {
                          ...prev.contributing_info,
                          setup_time: e.target.value
                        }
                      }))}
                      placeholder="30 minutes"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Good First Issues</label>
                    <Input
                      type="number"
                      value={formData.contributing_info.good_first_issues || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contributing_info: {
                          ...prev.contributing_info,
                          good_first_issues: parseInt(e.target.value) || 0
                        }
                      }))}
                      placeholder="10"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentorship Available</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.contributing_info.mentorship_available}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contributing_info: {
                            ...prev.contributing_info,
                            mentorship_available: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Yes, mentorship is available</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Project Metrics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Health Score (0-100)</label>
                    <Input
                      type="number"
                      value={formData.metrics.health_score || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metrics: {
                          ...prev.metrics,
                          health_score: parseInt(e.target.value) || 0
                        }
                      }))}
                      placeholder="85"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stars</label>
                    <Input
                      type="number"
                      value={formData.metrics.stars || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metrics: {
                          ...prev.metrics,
                          stars: parseInt(e.target.value) || 0
                        }
                      }))}
                      placeholder="1250"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Forks</label>
                    <Input
                      type="number"
                      value={formData.metrics.forks || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metrics: {
                          ...prev.metrics,
                          forks: parseInt(e.target.value) || 0
                        }
                      }))}
                      placeholder="89"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contributors Count</label>
                    <Input
                      type="number"
                      value={formData.metrics.contributors_count || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metrics: {
                          ...prev.metrics,
                          contributors_count: parseInt(e.target.value) || 0
                        }
                      }))}
                      placeholder="12"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 