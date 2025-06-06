import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useAuth } from '../hooks/useAuth';
import { ProjectCard } from '../components/ProjectCard';

interface Project {
    _id: string;
    title: string;
    description: string;
    codeContent?: string;
    githubUrl?: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export const Dashboard = () => {
    const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [filter, setFilter] = useState<'all' | 'my'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchProjects();
        }
    }, [authLoading, isAuthenticated, filter]);

    const fetchProjects = async () => {
        setIsLoading(true);
        setError("");

        try {
            const token = localStorage.getItem('token');
            const endpoint = filter === 'all' ? '/api/v1/content/all' : '/api/v1/content/my';
            
            const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
                headers: {
                    'Authorization': token
                }
            });

            setProjects(response.data.contents || []);
        } catch (error: any) {
            console.error("Fetch projects error:", error);
            if (error.response?.status === 401) {
                setError("Sesiunea a expirat. Te rugăm să te autentifici din nou.");
                logout();
            } else {
                setError("Eroare la încărcarea proiectelor. Te rugăm să încerci din nou.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (projectId: string) => {
        navigate(`/project/${projectId}`);
    };

    const handleCreateNew = () => {
        navigate('/create-project');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Se încarcă...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // useAuth hook will handle redirect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600">Bun venit, {user?.email}!</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleCreateNew}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                                + Proiect nou
                            </button>
                            <button
                                onClick={logout}
                                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                                Deconectare
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setFilter('all')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    filter === 'all'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Toate proiectele
                                {!isLoading && filter === 'all' && (
                                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                        {projects.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setFilter('my')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    filter === 'my'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Proiectele mele
                                {!isLoading && filter === 'my' && (
                                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                        {projects.length}
                                    </span>
                                )}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Se încarcă proiectele...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && projects.length === 0 && !error && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filter === 'all' ? 'Nu există proiecte' : 'Nu ai proiecte încă'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' 
                                ? 'Nu există încă proiecte în platformă.' 
                                : 'Începe prin a crea primul tău proiect.'
                            }
                        </p>
                        <button
                            onClick={handleCreateNew}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                        >
                            Creează primul proiect
                        </button>
                    </div>
                )}

                {/* Projects Grid */}
                {!isLoading && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 