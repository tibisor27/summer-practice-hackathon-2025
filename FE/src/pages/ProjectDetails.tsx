import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useAuth } from '../hooks/useAuth';
import { CommentItem } from '../components/CommentItem';
import { AddComment } from '../components/AddComment';
import { EditProjectModal } from '../components/EditProjectModal';

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

interface Comment {
    _id: string;
    comment: string;
    type: 'suggestion' | 'bug' | 'improvement' | 'approval' | 'general';
    reviewerId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    contentId: string;
}

export const ProjectDetails = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
    
    const [project, setProject] = useState<Project | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [error, setError] = useState<string>('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!authLoading && isAuthenticated && projectId) {
            fetchProject();
            fetchComments();
        }
    }, [authLoading, isAuthenticated, projectId]);

    const fetchProject = async () => {
        setIsLoadingProject(true);
        setError('');

        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/content/${projectId}`);
            setProject(response.data.content);
        } catch (error: any) {
            console.error("Fetch project error:", error);
            if (error.response?.status === 404) {
                setError('Proiectul nu a fost găsit');
            } else if (error.response?.status === 401) {
                logout();
            } else {
                setError('Eroare la încărcarea proiectului');
            }
        } finally {
            setIsLoadingProject(false);
        }
    };

    const fetchComments = async () => {
        setIsLoadingComments(true);

        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/comment/${projectId}`);
            setComments(response.data.comments || []);
        } catch (error: any) {
            console.error("Fetch comments error:", error);
            // Don't show error for comments loading failure
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleAddComment = async (comment: string, type: string) => {
        setIsAddingComment(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/comment/${projectId}`,
                { comment, type },
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201) {
                await fetchComments(); // Refresh comments
            }
        } catch (error: any) {
            console.error("Add comment error:", error);
            if (error.response?.status === 401) {
                logout();
            }
            throw error; // Re-throw to be handled by AddComment component
        } finally {
            setIsAddingComment(false);
        }
    };

    const handleEditComment = async (commentId: string, newComment: string, newType: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${BACKEND_URL}/api/v1/comment/${commentId}`,
                { comment: newComment, type: newType },
                {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                }
            );

            await fetchComments(); // Refresh comments
        } catch (error: any) {
            console.error("Edit comment error:", error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BACKEND_URL}/api/v1/comment/${commentId}`, {
                headers: {
                    'Authorization': token
                }
            });

            await fetchComments(); // Refresh comments
        } catch (error: any) {
            console.error("Delete comment error:", error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    const handleEditProject = () => {
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (projectId: string, updateData: any) => {
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${BACKEND_URL}/api/v1/content/${projectId}`, updateData, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            
            // Refresh project after successful update
            await fetchProject();
            return { success: true };
        } catch (error: any) {
            console.error("Update project error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Eroare la actualizarea proiectului" 
            };
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm('Ești sigur că vrei să ștergi acest proiect? Această acțiune nu poate fi anulată.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BACKEND_URL}/api/v1/content/${projectId}`, {
                headers: {
                    'Authorization': token
                }
            });
            
            // Redirect to dashboard after successful deletion
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Delete project error:", error);
            if (error.response?.status === 401) {
                logout();
            } else {
                setError("Eroare la ștergerea proiectului. Te rugăm să încerci din nou.");
            }
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (authLoading || isLoadingProject) {
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">{error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                        Înapoi la Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const isOwner = user?.id === project.userId._id;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                                <p className="text-gray-600">Proiect de {project.userId.firstName} {project.userId.lastName}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isOwner && (
                                <>
                                    <button
                                        onClick={handleEditProject}
                                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>Editează</span>
                                    </button>
                                    <button
                                        onClick={handleDeleteProject}
                                        className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Șterge</span>
                                    </button>
                                </>
                            )}
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>GitHub</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Project Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Info */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Descriere</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {project.description}
                                </p>
                            </div>

                            {project.codeContent && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Cod</h2>
                                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-gray-100 text-sm font-mono whitespace-pre-wrap">
                                            {project.codeContent}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-6">
                            <AddComment 
                                onAddComment={handleAddComment}
                                isLoading={isAddingComment}
                            />

                            {/* Comments List */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Comentarii ({comments.length})
                                </h3>

                                {isLoadingComments ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Se încarcă comentariile...</p>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <p className="text-gray-600">Nu există comentarii încă.</p>
                                        <p className="text-gray-500 text-sm">Fii primul care adaugă un comentariu!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <CommentItem
                                                key={comment._id}
                                                comment={comment}
                                                currentUserId={user?.id}
                                                onEdit={handleEditComment}
                                                onDelete={handleDeleteComment}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Informații proiect</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Autor</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {project.userId.firstName} {project.userId.lastName}
                                    </dd>
                                    <dd className="text-xs text-gray-500">{project.userId.email}</dd>
                                </div>
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Creat la</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDate(project.createdAt)}
                                    </dd>
                                </div>
                                
                                {project.updatedAt !== project.createdAt && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Actualizat la</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {formatDate(project.updatedAt)}
                                        </dd>
                                    </div>
                                )}
                                
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Comentarii</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {comments.length} comentarii
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 