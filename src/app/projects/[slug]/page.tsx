"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectWithStack, ContributorsByRole, SponsorsByTier } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Palette, 
  Database, 
  Server, 
  Settings, 
  Rocket, 
  Zap, 
  Globe, 
  Star, 
  GitFork, 
  ExternalLink,
  Calendar,
  Package,
  Scale,
  Code,
  Activity,
  Target,
  Users,
  Heart,
  MessageSquare,
  BookOpen,
  Clock,
  Award,
  Shield,
  ZapIcon,
  CheckCircle,
  AlertCircle,
  Info,
  Github,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Play
} from 'lucide-react';

// Simple Badge component inline
const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline'; className?: string }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
  const variantClasses = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700 bg-white'
  };
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [project, setProject] = useState<ProjectWithStack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${slug}`);
        const data = await response.json();
        
        if (response.ok) {
          setProject(data);
        } else {
          setError(data.error || 'Project not found');
        }
      } catch (err) {
        setError('Error loading project');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const getStackTypeIcon = (type: string) => {
    switch(type) {
      case 'frontend': return <Palette className="w-4 h-4" />;
      case 'backend': return <Server className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'ci_cd': return <Settings className="w-4 h-4" />;
      case 'devops': return <Rocket className="w-4 h-4" />;
      case 'tooling': return <Settings className="w-4 h-4" />;
      case 'runtime': return <Zap className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getStackTypeColor = (type: string) => {
    switch (type) {
      case 'frontend': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'backend': return 'bg-green-50 border-green-200 text-green-700';
      case 'database': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'ci_cd': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'devops': return 'bg-red-50 border-red-200 text-red-700';
      case 'tooling': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'runtime': return 'bg-pink-50 border-pink-200 text-pink-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-50 border-green-200 text-green-700';
      case 'intermediate': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'advanced': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'discord': return <MessageCircle className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'reddit': return <MessageSquare className="w-4 h-4" />;
      case 'mailing_list': return <Mail className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const groupContributorsByRole = (contributors: any[]): ContributorsByRole => {
    return {
      maintainers: contributors.filter(c => c.role === 'maintainer'),
      core_contributors: contributors.filter(c => c.role === 'core_contributor'),
      contributors: contributors.filter(c => c.role === 'contributor'),
      founders: contributors.filter(c => c.role === 'founder'),
    };
  };

  const groupSponsorsByTier = (sponsors: any[]): SponsorsByTier => {
    return {
      diamond: sponsors.filter(s => s.tier === 'diamond'),
      platinum: sponsors.filter(s => s.tier === 'platinum'),
      gold: sponsors.filter(s => s.tier === 'gold'),
      silver: sponsors.filter(s => s.tier === 'silver'),
      bronze: sponsors.filter(s => s.tier === 'bronze'),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">
            <Package className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {project.logo_url && (
                  <img 
                    src={project.logo_url} 
                    alt={project.name}
                    className="w-16 h-16 rounded-xl border border-gray-200"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="capitalize">
                      {project.status}
                    </Badge>
                    {project.license && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        {project.license}
                      </Badge>
                    )}
                    {project.contributing_info && (
                      <Badge variant="outline" className={`flex items-center gap-1 ${getDifficultyColor(project.contributing_info.difficulty_level)}`}>
                        <Target className="w-3 h-3" />
                        {project.contributing_info.difficulty_level}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-gray-600 max-w-3xl">{project.description}</p>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 mt-6">
                {project.metrics?.stars && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">{project.metrics.stars.toLocaleString()}</span>
                  </div>
                )}
                {project.metrics?.forks && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <GitFork className="w-4 h-4" />
                    <span className="font-medium">{project.metrics.forks.toLocaleString()}</span>
                  </div>
                )}
                {project.metrics?.contributors_count && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{project.metrics.contributors_count.toLocaleString()}</span>
                  </div>
                )}
                {project.metrics?.last_commit_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Activity className="w-4 h-4" />
                    <span className="font-medium">
                      {new Date(project.metrics.last_commit_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 ml-6">
              {project.homepage_url && (
                <Button asChild>
                  <Link href={project.homepage_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Link>
                </Button>
              )}
              {project.repo_url && (
                <Button asChild variant="outline">
                  <Link href={project.repo_url} target="_blank" rel="noopener noreferrer">
                    <Code className="w-4 h-4 mr-2" />
                    Repository
                  </Link>
                </Button>
              )}
              {project.contributing_info?.contributing_guide_url && (
                <Button asChild variant="outline">
                  <Link href={project.contributing_info.contributing_guide_url} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Contributing Guide
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Meet the Contributors */}
            {project.contributors && project.contributors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Meet the Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const groupedContributors = groupContributorsByRole(project.contributors);
                    return (
                      <div className="space-y-6">
                        {['founders', 'maintainers', 'core_contributors', 'contributors'].map((roleKey) => {
                          const role = roleKey as keyof ContributorsByRole;
                          const contributors = groupedContributors[role];
                          if (contributors.length === 0) return null;
                          
                          return (
                            <div key={role} className="space-y-3">
                              <h3 className="font-medium text-gray-900 capitalize">
                                {role.replace('_', ' ')}
                              </h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {contributors.map((contributor) => (
                                  <div key={contributor.id} className="text-center">
                                    <div className="relative mb-3">
                                      <img 
                                        src={contributor.avatar_url || '/api/placeholder/60/60'} 
                                        alt={contributor.name}
                                        className="w-15 h-15 rounded-full mx-auto border-2 border-gray-100"
                                      />
                                      {contributor.github_username && (
                                        <Link 
                                          href={`https://github.com/${contributor.github_username}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center"
                                        >
                                          <Github className="w-3 h-3 text-white" />
                                        </Link>
                                      )}
                                    </div>
                                    <p className="font-medium text-gray-900 text-sm">{contributor.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{contributor.role.replace('_', ' ')}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Meet the Sponsors */}
            {project.sponsors && project.sponsors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Meet the Sponsors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const groupedSponsors = groupSponsorsByTier(project.sponsors);
                    return (
                      <div className="space-y-6">
                        {['diamond', 'platinum', 'gold', 'silver', 'bronze'].map((tierKey) => {
                          const tier = tierKey as keyof SponsorsByTier;
                          const sponsors = groupedSponsors[tier];
                          if (sponsors.length === 0) return null;
                          
                          return (
                            <div key={tier} className="space-y-3">
                              <h3 className="font-medium text-gray-900 capitalize flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                {tier} Sponsors
                              </h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {sponsors.map((sponsor) => (
                                  <div key={sponsor.id} className="text-center">
                                    <div className="mb-3">
                                      {sponsor.logo_url ? (
                                        <img 
                                          src={sponsor.logo_url} 
                                          alt={sponsor.name}
                                          className="w-16 h-16 rounded-lg mx-auto border border-gray-200 object-contain p-2"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 rounded-lg mx-auto border border-gray-200 flex items-center justify-center bg-gray-50">
                                          <span className="text-lg font-bold text-gray-400">
                                            {sponsor.name.charAt(0)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="font-medium text-gray-900 text-sm">{sponsor.name}</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {sponsor.type}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Getting Started */}
            {project.getting_started_guides && project.getting_started_guides.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.getting_started_guides
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((guide, index) => (
                        <div key={guide.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{guide.title}</h4>
                              {guide.estimated_time_minutes && (
                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                  <Clock className="w-3 h-3" />
                                  {guide.estimated_time_minutes} minutes
                                </div>
                              )}
                              <p className="text-sm text-gray-600">{guide.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technology Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.stack_components.length > 0 ? (
                  <div className="space-y-6">
                    {['frontend', 'backend', 'database', 'ci_cd', 'devops', 'tooling', 'runtime'].map(type => {
                      const components = project.stack_components.filter(c => c.type === type);
                      if (components.length === 0) return null;
                      
                      return (
                        <div key={type} className="space-y-3">
                          <div className="flex items-center gap-2">
                            {getStackTypeIcon(type)}
                            <h3 className="font-semibold text-gray-900 capitalize">
                              {type.replace('_', ' ')}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {components.map(component => (
                              <Badge 
                                key={component.id} 
                                variant="outline" 
                                className={`${getStackTypeColor(component.type)} border hover:bg-opacity-80 transition-colors`}
                              >
                                {component.official_url ? (
                                  <Link 
                                    href={component.official_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:underline"
                                  >
                                    {component.name}
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                ) : (
                                  component.name
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No technology stack information available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Roadmap */}
            {project.roadmap_items && project.roadmap_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.roadmap_items.map((item, index) => (
                      <div key={item.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-3 h-3 rounded-full ${
                            item.status === 'done' ? 'bg-green-500' :
                            item.status === 'in_progress' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <Badge 
                              variant={item.status === 'done' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {item.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          {item.link && (
                            <Link 
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                              View details 
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}




          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Project Logo */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  {project.logo_url ? (
                    <img 
                      src={project.logo_url} 
                      alt={project.name}
                      className="w-24 h-24 rounded-xl mx-auto mb-4 border border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl mx-auto mb-4 border border-gray-200 bg-gray-50 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h2>
                  <Badge variant="secondary" className="capitalize">
                    {project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contributing Info */}
            {project.contributing_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Contributing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Difficulty</span>
                    <Badge variant="outline" className={getDifficultyColor(project.contributing_info.difficulty_level)}>
                      {project.contributing_info.difficulty_level}
                    </Badge>
                  </div>
                  
                  {project.contributing_info.setup_time_minutes && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Setup Time</span>
                      <span className="text-sm font-medium">{project.contributing_info.setup_time_minutes} min</span>
                    </div>
                  )}
                  
                  {project.contributing_info.good_first_issues_count > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Good First Issues</span>
                      <span className="text-sm font-medium">{project.contributing_info.good_first_issues_count}</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {project.contributing_info.has_mentorship && (
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                          <Users className="w-3 h-3 mr-1" />
                          Mentorship
                        </Badge>
                      )}
                      {project.contributing_info.hacktoberfest_friendly && (
                        <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                          <Award className="w-3 h-3 mr-1" />
                          Hacktoberfest
                        </Badge>
                      )}
                      {project.contributing_info.requires_cla && (
                        <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                          <Shield className="w-3 h-3 mr-1" />
                          CLA Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community */}
            {project.community_links && project.community_links.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.community_links.map((link) => (
                      <Link
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        {getPlatformIcon(link.platform)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 capitalize">
                            {link.name || link.platform}
                          </p>
                          {link.member_count && (
                            <p className="text-sm text-gray-500">
                              {link.member_count.toLocaleString()} members
                            </p>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {project.metrics?.stars && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Stars</span>
                    </div>
                    <span className="text-sm font-medium">{project.metrics.stars.toLocaleString()}</span>
                  </div>
                )}
                
                {project.metrics?.forks && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <GitFork className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Forks</span>
                    </div>
                    <span className="text-sm font-medium">{project.metrics.forks.toLocaleString()}</span>
                  </div>
                )}
                
                {project.metrics?.open_issues && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Issues</span>
                    </div>
                    <span className="text-sm font-medium">{project.metrics.open_issues.toLocaleString()}</span>
                  </div>
                )}
                
                {project.project_health && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Health Score</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          project.project_health.health_score && project.project_health.health_score > 80 ? 'bg-green-500' :
                          project.project_health.health_score && project.project_health.health_score > 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium">
                          {project.project_health.health_score || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 