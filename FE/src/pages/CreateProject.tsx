import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';

interface FormErrors {
    title?: string;
    description?: string;
    codeContent?: string;
    githubUrl?: string;
    general?: string;
}

export const CreateProject = () => {
    const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    
    const titleRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const codeContentRef = useRef<HTMLTextAreaElement>(null);
    const githubUrlRef = useRef<HTMLInputElement>(null);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        const title = titleRef.current?.value || '';
        const description = descriptionRef.current?.value || '';
        const codeContent = codeContentRef.current?.value || '';
        const githubUrl = githubUrlRef.current?.value || '';

        // Validate title
        if (!title.trim()) {
            newErrors.title = 'Titlul este obligatoriu';
        } else if (title.length > 100) {
            newErrors.title = 'Titlul nu poate avea mai mult de 100 de caractere';
        }

        if (!description.trim()) {
            newErrors.description = 'Descrierea este obligatorie';
        } else if (description.length > 1000) {
            newErrors.description = 'Descrierea nu poate avea mai mult de 1000 de caractere';
        }

        if (codeContent && codeContent.length > 10000) {
            newErrors.codeContent = 'Codul nu poate avea mai mult de 10000 de caractere';
        }

        // Validate GitHub URL (optional)
        if (githubUrl && githubUrl.trim()) {
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(githubUrl.trim())) {
                newErrors.githubUrl = 'Te rugăm să introduci un URL valid (începe cu http:// sau https://)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const token = localStorage.getItem('token');
            
            const title = titleRef.current?.value?.trim() || '';
            const description = descriptionRef.current?.value?.trim() || '';
            const codeContent = codeContentRef.current?.value?.trim() || '';
            const githubUrl = githubUrlRef.current?.value?.trim() || '';

            const requestData: any = {
                title,
                description,
            };

            // Only include optional fields if they have values
            if (codeContent) {
                requestData.codeContent = codeContent;
            }
            if (githubUrl) {
                requestData.githubUrl = githubUrl;
            }

            const response = await axios.post(`${BACKEND_URL}/api/v1/content/add`, requestData, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                // Success - redirect to dashboard
                navigate('/dashboard');
            }

        } catch (error: any) {
            console.error("Create project error:", error);
            
            if (error.response?.status === 401) {
                setErrors({ general: "Sesiunea a expirat. Te rugăm să te autentifici din nou." });
                logout();
            } else if (error.response?.status === 400) {
                // Handle validation errors from backend
                const backendErrors = error.response.data.errors;
                if (backendErrors && Array.isArray(backendErrors)) {
                    const newErrors: FormErrors = {};
                    backendErrors.forEach((err: any) => {
                        if (err.path && err.path[0]) {
                            const field = err.path[0];
                            newErrors[field as keyof FormErrors] = err.message;
                        }
                    });
                    setErrors(newErrors);
                } else {
                    setErrors({ general: "Date invalide. Te rugăm să verifici câmpurile." });
                }
            } else {
                setErrors({ general: "Eroare la crearea proiectului. Te rugăm să încerci din nou." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Proiect nou</h1>
                            <p className="text-gray-600">Creează un proiect nou pentru a-l împărtăși cu comunitatea</p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            disabled={isLoading}
                        >
                            Anulează
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error */}
                        {errors.general && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.general}
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Titlu <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Introdu titlul proiectului"
                                reference={titleRef}
                                type="text"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descriere <span className="text-red-500">*</span>
                            </label>
                            <TextArea
                                placeholder="Descrie proiectul tău în detaliu"
                                reference={descriptionRef}
                                rows={4}
                                maxLength={1000}
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Code Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cod (opțional)
                            </label>
                            <TextArea
                                placeholder="Adaugă codul proiectului (opțional)"
                                reference={codeContentRef}
                                rows={8}
                                maxLength={10000}
                                disabled={isLoading}
                                className="font-mono text-sm"
                            />
                            {errors.codeContent && (
                                <p className="mt-1 text-sm text-red-600">{errors.codeContent}</p>
                            )}
                        </div>

                        {/* GitHub URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Link GitHub (opțional)
                            </label>
                            <Input
                                placeholder="https://github.com/username/repository"
                                reference={githubUrlRef}
                                type="url"
                            />
                            {errors.githubUrl && (
                                <p className="mt-1 text-sm text-red-600">{errors.githubUrl}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Link-ul către repository-ul GitHub al proiectului
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex space-x-4 pt-6">
                            <Button
                                onClick={() => {}}
                                variant="primary"
                                text={isLoading ? "Se creează..." : "Creează proiectul"}
                                size="lg"
                            />
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                            >
                                Anulează
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}; 