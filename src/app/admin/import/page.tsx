"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Download, Search, Github, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ImportResult {
  url: string;
  project_id?: string;
  message: string;
  status: 'pending' | 'success' | 'error';
}

export default function ImportPage() {
  const [singleUrl, setSingleUrl] = useState('');
  const [multipleUrls, setMultipleUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const handleSingleImport = async () => {
    if (!singleUrl.trim()) return;
    
    setLoading(true);
    setResults([{ url: singleUrl, status: 'pending', message: 'Importazione in corso...' }]);
    
    try {
      const response = await fetch('/api/admin/import/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: singleUrl,
          auto_approve: false,
          visibility: true,
          stack_components: suggestions
        })
      });
      
      const result = await response.json();
      
      setResults([{
        url: singleUrl,
        project_id: result.project_id,
        message: result.success ? result.message : result.error,
        status: result.success ? 'success' : 'error'
      }]);
      
      if (result.success) {
        setSingleUrl('');
        setSuggestions([]);
      }
      
    } catch (error) {
      setResults([{
        url: singleUrl,
        message: 'Errore di connessione',
        status: 'error'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleImport = async () => {
    const urls = multipleUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.includes('github.com'));
    
    if (urls.length === 0) return;
    
    setLoading(true);
    setResults(urls.map(url => ({ url, status: 'pending' as const, message: 'In attesa...' })));
    
    try {
      const response = await fetch('/api/admin/import/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_urls: urls,
          auto_approve: false,
          visibility: true,
          delay_ms: 2000
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const newResults: ImportResult[] = [];
        
        // Aggiungere successi
        result.results.successful.forEach((item: any) => {
          newResults.push({
            url: item.url,
            project_id: item.project_id,
            message: item.message,
            status: 'success'
          });
        });
        
        // Aggiungere fallimenti
        result.results.failed.forEach((item: any) => {
          newResults.push({
            url: item.url,
            message: item.error,
            status: 'error'
          });
        });
        
        setResults(newResults);
        
        if (result.results.successful.length > 0) {
          setMultipleUrls('');
        }
      }
      
    } catch (error) {
      setResults(urls.map(url => ({
        url,
        message: 'Errore di connessione',
        status: 'error' as const
      })));
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    if (!singleUrl.trim()) return;
    
    setSuggestionsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/import/github?repo_url=${encodeURIComponent(singleUrl)}`);
      const result = await response.json();
      
      if (result.success) {
        setSuggestions(result.suggested_components);
      }
      
    } catch (error) {
      console.error('Errore nel recupero suggerimenti:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Github className="w-8 h-8" />
            Importa Progetti GitHub
          </h1>
          <p className="text-gray-600">
            Importa automaticamente progetti GitHub con metriche e metadati
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Importazione Singola */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Importazione Singola
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Repository GitHub
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={getSuggestions}
                    disabled={!singleUrl.trim() || suggestionsLoading}
                    variant="outline"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {suggestions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stack Components Suggeriti ({suggestions.length})
                  </label>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    Componenti rilevati automaticamente dal repository
                  </div>
                </div>
              )}

              <Button
                onClick={handleSingleImport}
                disabled={!singleUrl.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Importazione...
                  </div>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Importa Progetto
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Importazione Multipla */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Importazione Multipla
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Repository (uno per riga)
                </label>
                <textarea
                  value={multipleUrls}
                  onChange={(e) => setMultipleUrls(e.target.value)}
                  placeholder={`https://github.com/owner/repo1
https://github.com/owner/repo2
https://github.com/owner/repo3`}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <Button
                onClick={handleMultipleImport}
                disabled={!multipleUrls.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Importazione...
                  </div>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Importa Progetti
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Risultati */}
        {results.length > 0 && (
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Risultati Importazione
            </h2>
            
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {result.url}
                      </div>
                      <div className={`text-sm mt-1 ${
                        result.status === 'error' ? 'text-red-600' : 
                        result.status === 'success' ? 'text-green-600' : 
                        'text-yellow-600'
                      }`}>
                        {result.message}
                      </div>
                      {result.project_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {result.project_id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Progetti di Esempio */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 Avvio Rapido
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Esempi di progetti popolari da importare:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div 
                className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSingleUrl('https://github.com/LizardByte/Sunshine')}
              >
                🎮 LizardByte/Sunshine
              </div>
              <div 
                className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSingleUrl('https://github.com/microsoft/vscode')}
              >
                💻 Microsoft/VSCode
              </div>
              <div 
                className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSingleUrl('https://github.com/vercel/next.js')}
              >
                ⚡ Vercel/Next.js
              </div>
              <div 
                className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSingleUrl('https://github.com/supabase/supabase')}
              >
                🗄️ Supabase/Supabase
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}