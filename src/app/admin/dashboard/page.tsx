"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Star, 
  Eye, 
  Clock, 
  AlertCircle,
  Trash2,
  Filter,
  Users,
  Heart,
  Edit3
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'stale' | 'deprecated';
  is_confirmed: boolean;
  featured: boolean;
  created_at: string;
  logo_url?: string;
  contributors: any[];
  sponsors: any[];
  metrics?: {
    stars?: number;
    forks?: number;
  };
}



export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const { user, token, logout } = useAuth();

  useEffect(() => {
    // Verifica autenticazione
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }

    fetchProjects();
  }, [filter, page, token, user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/projects?status=${filter}&page=${page}&per_page=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setTotal(data.total);
      } else if (response.status === 401) {
        // Token scaduto
        logout();
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Errore nel caricamento progetti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAction = async (projectId: string, action: string, value?: boolean) => {
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, action, value })
      });

      if (response.ok) {
        fetchProjects(); // Ricarica i progetti
      }
    } catch (error) {
      console.error('Errore nell\'azione:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/projects', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId })
      });

      if (response.ok) {
        fetchProjects(); // Ricarica i progetti
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleEditProject = (projectId: string) => {
    // Apre un modal o una pagina di modifica
    router.push(`/admin/projects/${projectId}/edit`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'stale': return 'bg-yellow-100 text-yellow-700';
      case 'deprecated': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusCounts = () => {
    const pending = projects.filter(p => !p.is_confirmed).length;
    const confirmed = projects.filter(p => p.is_confirmed).length;
    const featured = projects.filter(p => p.featured).length;
    return { pending, confirmed, featured };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  const { pending, confirmed, featured } = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-300">Benvenuto, {user?.username}</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-white border-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{pending}</p>
                <p className="text-slate-300">In Attesa</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{confirmed}</p>
                <p className="text-slate-300">Confermati</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{featured}</p>
                <p className="text-slate-300">In Evidenza</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{projects.length}</p>
                <p className="text-slate-300">Totali</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Featured Projects Section */}
        {projects.filter(p => p.featured).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              Progetti in Evidenza
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.filter(p => p.featured).map((project) => (
                <Card key={project.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    {project.logo_url && (
                      <img 
                        src={project.logo_url} 
                        alt={project.name}
                        className="w-12 h-12 rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{project.name}</h3>
                      <p className="text-slate-400 text-sm mb-2 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-slate-300 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{project.contributors?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{project.sponsors?.length || 0}</span>
                        </div>
                        <span>⭐ {project.metrics?.stars || 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/projects/${project.slug}`)}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleProjectAction(project.id, 'feature', false)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-slate-400" />
          <div className="flex gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              Tutti
            </Button>
            <Button
              onClick={() => setFilter('pending')}
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
            >
              In Attesa ({pending})
            </Button>
            <Button
              onClick={() => setFilter('confirmed')}
              variant={filter === 'confirmed' ? 'default' : 'outline'}
              size="sm"
            >
              Confermati ({confirmed})
            </Button>
          </div>
        </div>

        {/* Projects Table */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-white font-medium">Progetto</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Stato</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Team</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Metriche</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-white/5">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {project.logo_url && (
                          <img 
                            src={project.logo_url} 
                            alt={project.name}
                            className="w-8 h-8 rounded"
                          />
                        )}
                        <div>
                          <p className="text-white font-medium">{project.name}</p>
                          <p className="text-slate-400 text-sm">{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {project.is_confirmed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="text-white text-sm">
                          {project.is_confirmed ? 'Confermato' : 'In attesa'}
                        </span>
                        {project.featured && (
                          <Star className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4 text-slate-300 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.contributors?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{project.sponsors?.length || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4 text-slate-300 text-sm">
                        <span>⭐ {project.metrics?.stars || 0}</span>
                        <span>🍴 {project.metrics?.forks || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/projects/${project.slug}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditProject(project.id)}
                          className="text-blue-400 border-blue-400/20 hover:bg-blue-400/10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        
                        {!project.is_confirmed && (
                          <Button 
                            size="sm" 
                            onClick={() => handleProjectAction(project.id, 'confirm', true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          onClick={() => handleProjectAction(project.id, 'feature', !project.featured)}
                          variant={project.featured ? 'default' : 'outline'}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          onClick={() => handleDeleteProject(project.id)}
                          variant="outline"
                          className="text-red-400 border-red-400 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outline"
              >
                Precedente
              </Button>
              <span className="text-white px-4 py-2">
                Pagina {page} di {Math.ceil(total / 10)}
              </span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 10)}
                variant="outline"
              >
                Successiva
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 