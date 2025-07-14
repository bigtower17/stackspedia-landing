"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Rocket, BarChart3, TrendingUp, Layers, Star, ClipboardList, Shield, LogIn, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Projects', href: '/', icon: Rocket },
  { name: 'Stack', href: '/stack', icon: Layers },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Trending', href: '/trending', icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <img 
            src="/logo.svg" 
            alt="Stackspedia Logo" 
            className="w-8 h-8 mr-3" 
          />
          <h1 className="text-xl font-bold text-gray-900">Stackspedia</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            // Only check for active state on client-side to prevent hydration mismatch
            const isActive = isClient && pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Admin Section */}
        {isAdmin && (
          <div className="px-3 py-4 border-t border-gray-200">
            <div className="space-y-1">
              <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </div>
              <Link
                href="/admin/dashboard"
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isClient && pathname === '/admin/dashboard'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Auth Section */}
        <div className="px-3 py-4 border-t border-gray-200">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                <span className="truncate">Ciao, {user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/admin/login"
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <LogIn className="w-5 h-5 mr-3" />
              Admin Login
            </Link>
          )}
        </div>

        {/* Add Project Button */}
        <div className="px-3 py-4 border-t border-gray-200">
          <Link
            href="/add-project"
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">+</span>
            Add Project
          </Link>
        </div>

        {/* Newsletter Signup */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Star className="w-4 h-4 mr-2" />
              <span>Get Updates</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <ClipboardList className="w-4 h-4 mr-2" />
              <span>Newsletter</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 