"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, AlertCircle, Users, Heart, BookOpen, MessageSquare, Code, BarChart3, Rocket, Plus, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  title: string;
  description: string;
  website_url: string;
  github_url: string;
  logo_url: string;
  tags: string[];
  category: string;
  is_confirmed: boolean;
  featured: boolean;
  visibility: boolean;
  status: string;
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

export default function EditProject({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const router = useRouter();

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Rocket },
    { id: 'contributors', label: 'Contributors', icon: Users },
    { id: 'sponsors', label: 'Sponsors', icon: Heart },
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'contributing', label: 'Contributing', icon: Code },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
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

  useEffect(() => {
    // Verifica autenticazione
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/projects/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setFormData({
          title: data.project.title,
          description: data.project.description,
          website_url: data.project.website_url,
          github_url: data.project.github_url,
          logo_url: data.project.logo_url,
          tags: data.project.tags,
          category: data.project.category,
          is_confirmed: data.project.is_confirmed,
          featured: data.project.featured,
          visibility: data.project.visibility,
          contributors: data.project.contributors || [],
          sponsors: data.project.sponsors || [],
          getting_started_guides: data.project.getting_started_guides || [],
          community_links: data.project.community_links || [],
          contributing_info: data.project.contributing_info || {
            difficulty_level: 'beginner',
            mentorship_available: false
          },
          metrics: data.project.metrics || {}
        });
      } else if (response.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Progetto non trovato');
      }
    } catch (error) {
      console.error('Errore nel caricamento progetto:', error);
      setError('Errore nel caricamento del progetto');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/projects/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Progetto aggiornato con successo');
        setProject(data.project);
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Errore nell\'aggiornamento del progetto');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      setError('Errore del server');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Contributors handlers
  const addContributor = () => {
    setFormData(prev => ({
      ...prev,
      contributors: [...(prev.contributors || []), { name: '', role: '' }]
    }));
  };

  const updateContributor = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contributors: (prev.contributors || []).map((contributor, i) =>
        i === index ? { ...contributor, [field]: value } : contributor
      )
    }));
  };

  const removeContributor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contributors: (prev.contributors || []).filter((_, i) => i !== index)
    }));
  };

  // Sponsors handlers
  const addSponsor = () => {
    setFormData(prev => ({
      ...prev,
      sponsors: [...(prev.sponsors || []), { name: '', tier: 'bronze' as const }]
    }));
  };

  const updateSponsor = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sponsors: (prev.sponsors || []).map((sponsor, i) =>
        i === index ? { ...sponsor, [field]: value } : sponsor
      )
    }));
  };

  const removeSponsor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sponsors: (prev.sponsors || []).filter((_, i) => i !== index)
    }));
  };

  // Getting Started handlers
  const addGettingStartedGuide = () => {
    setFormData(prev => ({
      ...prev,
      getting_started_guides: [...(prev.getting_started_guides || []), { title: '', description: '' }]
    }));
  };

  const updateGettingStartedGuide = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      getting_started_guides: (prev.getting_started_guides || []).map((guide, i) =>
        i === index ? { ...guide, [field]: value } : guide
      )
    }));
  };

  const removeGettingStartedGuide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      getting_started_guides: (prev.getting_started_guides || []).filter((_, i) => i !== index)
    }));
  };

  // Community Links handlers
  const addCommunityLink = () => {
    setFormData(prev => ({
      ...prev,
      community_links: [...(prev.community_links || []), { type: 'discord' as const, name: '', url: '' }]
    }));
  };

  const updateCommunityLink = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      community_links: (prev.community_links || []).map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeCommunityLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      community_links: (prev.community_links || []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Progetto non trovato</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/dashboard')}
            className="text-white border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Modifica Progetto</h1>
            <p className="text-slate-300">{project.name}</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">{success}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Titolo</label>
                    <Input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Titolo del progetto"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Categoria</label>
                    <Input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Categoria del progetto"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Descrizione</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-md"
                    rows={4}
                    placeholder="Descrizione del progetto"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">URL Website</label>
                    <Input
                      type="url"
                      value={formData.website_url || ''}
                      onChange={(e) => handleInputChange('website_url', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">URL GitHub</label>
                    <Input
                      type="url"
                      value={formData.github_url || ''}
                      onChange={(e) => handleInputChange('github_url', e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="https://github.com/user/repo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">URL Logo</label>
                  <Input
                    type="url"
                    value={formData.logo_url || ''}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Tags (separati da virgola)</label>
                  <Input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="react, typescript, api"
                  />
                </div>

                {/* Status toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_confirmed"
                      checked={formData.is_confirmed || false}
                      onChange={(e) => handleInputChange('is_confirmed', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="is_confirmed" className="text-white">Confermato</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured || false}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="featured" className="text-white">In evidenza</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="visibility"
                      checked={formData.visibility || false}
                      onChange={(e) => handleInputChange('visibility', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="visibility" className="text-white">Visibile</label>
                  </div>
                </div>
              </div>
            )}

            {/* Contributors Tab */}
            {activeTab === 'contributors' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Contributors</h3>
                  <Button
                    type="button"
                    onClick={addContributor}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Contributor
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.contributors?.map((contributor, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Contributor {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeContributor(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">Nome</label>
                          <Input
                            type="text"
                            value={contributor.name || ''}
                            onChange={(e) => updateContributor(index, 'name', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Nome del contributor"
                          />
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">Ruolo</label>
                          <Input
                            type="text"
                            value={contributor.role || ''}
                            onChange={(e) => updateContributor(index, 'role', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Ruolo (es. Frontend Developer)"
                          />
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">Avatar URL</label>
                          <Input
                            type="url"
                            value={contributor.avatar_url || ''}
                            onChange={(e) => updateContributor(index, 'avatar_url', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">GitHub URL</label>
                          <Input
                            type="url"
                            value={contributor.github_url || ''}
                            onChange={(e) => updateContributor(index, 'github_url', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-white font-medium mb-2">Bio</label>
                        <textarea
                          value={contributor.bio || ''}
                          onChange={(e) => updateContributor(index, 'bio', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-md"
                          rows={3}
                          placeholder="Breve biografia del contributor"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sponsors Tab */}
            {activeTab === 'sponsors' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Sponsors</h3>
                  <Button
                    type="button"
                    onClick={addSponsor}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Sponsor
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.sponsors?.map((sponsor, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Sponsor {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeSponsor(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">Nome</label>
                          <Input
                            type="text"
                            value={sponsor.name || ''}
                            onChange={(e) => updateSponsor(index, 'name', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Nome dello sponsor"
                          />
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">Tier</label>
                          <select
                            value={sponsor.tier || 'bronze'}
                            onChange={(e) => updateSponsor(index, 'tier', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-md"
                          >
                            {sponsorTiers.map(tier => (
                              <option key={tier.id} value={tier.id}>{tier.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">Logo URL</label>
                          <Input
                            type="url"
                            value={sponsor.logo_url || ''}
                            onChange={(e) => updateSponsor(index, 'logo_url', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">Website URL</label>
                          <Input
                            type="url"
                            value={sponsor.website_url || ''}
                            onChange={(e) => updateSponsor(index, 'website_url', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://sponsor.com"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-white font-medium mb-2">Descrizione</label>
                        <textarea
                          value={sponsor.description || ''}
                          onChange={(e) => updateSponsor(index, 'description', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-md"
                          rows={3}
                          placeholder="Descrizione dello sponsor"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Getting Started Tab */}
            {activeTab === 'getting-started' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Getting Started Guides</h3>
                  <Button
                    type="button"
                    onClick={addGettingStartedGuide}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Guida
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.getting_started_guides?.map((guide, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Guida {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeGettingStartedGuide(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">Titolo</label>
                          <Input
                            type="text"
                            value={guide.title || ''}
                            onChange={(e) => updateGettingStartedGuide(index, 'title', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Titolo della guida"
                          />
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">Tempo Stimato</label>
                          <Input
                            type="text"
                            value={guide.estimated_time || ''}
                            onChange={(e) => updateGettingStartedGuide(index, 'estimated_time', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="es. 30 minuti"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-white font-medium mb-2">Descrizione</label>
                        <textarea
                          value={guide.description || ''}
                          onChange={(e) => updateGettingStartedGuide(index, 'description', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-md"
                          rows={3}
                          placeholder="Descrizione della guida"
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block text-white font-medium mb-2">Prerequisiti</label>
                        <textarea
                          value={guide.prerequisites || ''}
                          onChange={(e) => updateGettingStartedGuide(index, 'prerequisites', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-md"
                          rows={3}
                          placeholder="Prerequisiti necessari"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Tab */}
            {activeTab === 'community' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Community Links</h3>
                  <Button
                    type="button"
                    onClick={addCommunityLink}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Link
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.community_links?.map((link, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Link {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeCommunityLink(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">Tipo</label>
                          <select
                            value={link.type || 'discord'}
                            onChange={(e) => updateCommunityLink(index, 'type', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-md"
                          >
                            {communityLinkTypes.map(type => (
                              <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">Nome</label>
                          <Input
                            type="text"
                            value={link.name || ''}
                            onChange={(e) => updateCommunityLink(index, 'name', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Nome del link"
                          />
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">URL</label>
                          <Input
                            type="url"
                            value={link.url || ''}
                            onChange={(e) => updateCommunityLink(index, 'url', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-white font-medium mb-2">Numero Membri (opzionale)</label>
                        <Input
                          type="number"
                          value={link.member_count || ''}
                          onChange={(e) => updateCommunityLink(index, 'member_count', parseInt(e.target.value) || 0)}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contributing Tab */}
            {activeTab === 'contributing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Contributing Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Difficulty Level</label>
                    <select
                      value={formData.contributing_info?.difficulty_level || 'beginner'}
                      onChange={(e) => handleInputChange('contributing_info', {
                        ...(formData.contributing_info || {}),
                        difficulty_level: e.target.value
                      })}
                      className="w-full bg-white/5 border border-white/10 text-white p-2 rounded-md"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Setup Time</label>
                    <Input
                      type="text"
                      value={formData.contributing_info?.setup_time || ''}
                      onChange={(e) => handleInputChange('contributing_info', {
                        ...(formData.contributing_info || {}),
                        setup_time: e.target.value
                      })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="es. 15 minuti"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Good First Issues</label>
                    <Input
                      type="number"
                      value={formData.contributing_info?.good_first_issues || ''}
                      onChange={(e) => handleInputChange('contributing_info', {
                        ...(formData.contributing_info || {}),
                        good_first_issues: parseInt(e.target.value) || 0
                      })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="5"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mentorship_available"
                      checked={formData.contributing_info?.mentorship_available || false}
                      onChange={(e) => handleInputChange('contributing_info', {
                        ...(formData.contributing_info || {}),
                        mentorship_available: e.target.checked
                      })}
                      className="rounded"
                    />
                    <label htmlFor="mentorship_available" className="text-white">Mentorship Available</label>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Project Metrics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Health Score</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.metrics?.health_score || ''}
                      onChange={(e) => handleInputChange('metrics', {
                        ...(formData.metrics || {}),
                        health_score: parseInt(e.target.value) || 0
                      })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="85"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Stars</label>
                    <Input
                      type="number"
                      value={formData.metrics?.stars || ''}
                      onChange={(e) => handleInputChange('metrics', {
                        ...(formData.metrics || {}),
                        stars: parseInt(e.target.value) || 0
                      })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="1500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Forks</label>
                    <Input
                      type="number"
                      value={formData.metrics?.forks || ''}
                      onChange={(e) => handleInputChange('metrics', {
                        ...(formData.metrics || {}),
                        forks: parseInt(e.target.value) || 0
                      })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Contributors Count</label>
                    <Input
                      type="number"
                      value={formData.metrics?.contributors_count || ''}
                      onChange={(e) => handleInputChange('metrics', {
                        ...(formData.metrics || {}),
                        contributors_count: parseInt(e.target.value) || 0
                      })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salva Modifiche
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 