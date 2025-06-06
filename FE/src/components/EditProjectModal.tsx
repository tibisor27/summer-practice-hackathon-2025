import { useState, useEffect } from 'react';
import { Button } from './Button';

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

interface EditProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectId: string, updateData: any) => Promise<{ success: boolean; error?: string }>;
    isLoading?: boolean;
}

interface LabeledInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    type?: string;
}

const LabeledInput = ({ label, placeholder, value, onChange, error, required, disabled, type = "text" }: LabeledInputProps) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                } ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

interface LabeledTextAreaProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
}

const LabeledTextArea = ({ label, placeholder, value, onChange, error, required, disabled, rows = 4 }: LabeledTextAreaProps) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                rows={rows}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-vertical ${
                    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                } ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export const EditProjectModal = ({ project, isOpen, onClose, onSave, isLoading = false }: EditProjectModalProps) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        codeContent: '',
        githubUrl: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (project && isOpen) {
            setFormData({
                title: project.title,
                description: project.description,
                codeContent: project.codeContent || '',
                githubUrl: project.githubUrl || ''
            });
            setErrors({});
        }
    }, [project, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Titlul este obligatoriu';
        } else if (formData.title.length > 100) {
            newErrors.title = 'Titlul nu poate avea mai mult de 100 de caractere';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Descrierea este obligatorie';
        } else if (formData.description.length > 1000) {
            newErrors.description = 'Descrierea nu poate avea mai mult de 1000 de caractere';
        }

        if (formData.codeContent && formData.codeContent.length > 10000) {
            newErrors.codeContent = 'Conținutul codului nu poate avea mai mult de 10000 de caractere';
        }

        if (formData.githubUrl && formData.githubUrl.trim()) {
            try {
                new URL(formData.githubUrl);
            } catch {
                newErrors.githubUrl = 'URL-ul GitHub nu este valid';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm() || !project) return;

        // Only send fields that have actually changed
        const updateData: any = {};
        if (formData.title !== project.title) updateData.title = formData.title;
        if (formData.description !== project.description) updateData.description = formData.description;
        if (formData.codeContent !== (project.codeContent || '')) updateData.codeContent = formData.codeContent;
        if (formData.githubUrl !== (project.githubUrl || '')) updateData.githubUrl = formData.githubUrl;

        // If nothing changed, just close the modal
        if (Object.keys(updateData).length === 0) {
            onClose();
            return;
        }

        const result = await onSave(project._id, updateData);
        if (result.success) {
            onClose();
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Editează proiectul</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            disabled={isLoading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <LabeledInput
                            label="Titlu proiect"
                            placeholder="Introdu titlul proiectului..."
                            value={formData.title}
                            onChange={(value) => handleChange('title', value)}
                            error={errors.title}
                            required
                            disabled={isLoading}
                        />

                        <LabeledTextArea
                            label="Descriere"
                            placeholder="Descrierea detaliată a proiectului..."
                            value={formData.description}
                            onChange={(value) => handleChange('description', value)}
                            error={errors.description}
                            rows={4}
                            required
                            disabled={isLoading}
                        />

                        <LabeledTextArea
                            label="Cod (opțional)"
                            placeholder="Adaugă cod relevant pentru proiect..."
                            value={formData.codeContent}
                            onChange={(value) => handleChange('codeContent', value)}
                            error={errors.codeContent}
                            rows={8}
                            disabled={isLoading}
                        />

                        <LabeledInput
                            label="URL GitHub (opțional)"
                            placeholder="https://github.com/username/project"
                            value={formData.githubUrl}
                            onChange={(value) => handleChange('githubUrl', value)}
                            error={errors.githubUrl}
                            disabled={isLoading}
                        />

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                variant="secondary"
                                size="md"
                                text="Anulează"
                                onClick={onClose}
                                disabled={isLoading}
                            />
                            <Button
                                variant="primary"
                                size="md"
                                text={isLoading ? "Se salvează..." : "Salvează modificările"}
                                onClick={() => {
                                    const form = document.querySelector('form');
                                    if (form) {
                                        form.requestSubmit();
                                    }
                                }}
                                disabled={isLoading}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}; 