import { useState, useRef } from 'react';
import { Button } from './Button';
import { TextArea } from './TextArea';

interface AddCommentProps {
    onAddComment: (comment: string, type: string) => Promise<void>;
    isLoading?: boolean;
}

export const AddComment = ({ onAddComment, isLoading = false }: AddCommentProps) => {
    const [commentType, setCommentType] = useState<string>('general');
    const [error, setError] = useState<string>('');
    const commentRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const commentText = commentRef.current?.value?.trim() || '';

        if (!commentText) {
            setError('Te rugăm să introduci un comentariu');
            return;
        }

        if (commentText.length > 2000) {
            setError('Comentariul nu poate avea mai mult de 2000 de caractere');
            return;
        }

        try {
            await onAddComment(commentText, commentType);
            
            // Clear form on success
            if (commentRef.current) {
                commentRef.current.value = '';
            }
            setCommentType('general');
        } catch (error) {
            setError('Eroare la adăugarea comentariului. Te rugăm să încerci din nou.');
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                Adaugă un comentariu
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Comment Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tip comentariu
                    </label>
                    <select
                        value={commentType}
                        onChange={(e) => setCommentType(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="general">General</option>
                        <option value="suggestion">Sugestie</option>
                        <option value="bug">Bug</option>
                        <option value="improvement">Îmbunătățire</option>
                        <option value="approval">Aprobare</option>
                    </select>
                </div>

                {/* Comment Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comentariu <span className="text-red-500">*</span>
                    </label>
                    <TextArea
                        reference={commentRef as React.RefObject<HTMLTextAreaElement>}
                        placeholder="Scrie comentariul tău aici..."
                        rows={4}
                        maxLength={2000}
                        disabled={isLoading}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={() => {}}
                        variant="primary"
                        text={isLoading ? "Se adaugă..." : "Adaugă comentariu"}
                        size="md"
                    />
                </div>
            </form>
        </div>
    );
}; 