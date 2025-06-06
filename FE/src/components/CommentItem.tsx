import { useState } from 'react';

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

interface CommentItemProps {
    comment: Comment;
    currentUserId?: string;
    onEdit: (commentId: string, newComment: string, newType: string) => void;
    onDelete: (commentId: string) => void;
}

const commentTypeColors = {
    suggestion: 'bg-blue-100 text-blue-800',
    bug: 'bg-red-100 text-red-800',
    improvement: 'bg-yellow-100 text-yellow-800',
    approval: 'bg-green-100 text-green-800',
    general: 'bg-gray-100 text-gray-800'
};

const commentTypeLabels = {
    suggestion: 'Sugestie',
    bug: 'Bug',
    improvement: 'Îmbunătățire',
    approval: 'Aprobare',
    general: 'General'
};

export const CommentItem = ({ comment, currentUserId, onEdit, onDelete }: CommentItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.comment);
    const [editType, setEditType] = useState(comment.type);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = currentUserId === comment.reviewerId._id;

    const handleSaveEdit = () => {
        if (editText.trim()) {
            onEdit(comment._id, editText.trim(), editType);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditText(comment.comment);
        setEditType(comment.type);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('Ești sigur că vrei să ștergi acest comentariu?')) {
            setIsDeleting(true);
            onDelete(comment._id);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {/* Comment Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium text-sm">
                            {getInitials(comment.reviewerId.firstName, comment.reviewerId.lastName)}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">
                            {comment.reviewerId.firstName} {comment.reviewerId.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{comment.reviewerId.email}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${commentTypeColors[comment.type]}`}>
                        {commentTypeLabels[comment.type]}
                    </span>
                    
                    {isOwner && !isEditing && (
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="Editează comentariul"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                                title="Șterge comentariul"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Comment Content */}
            {isEditing ? (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tip comentariu
                        </label>
                        <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as typeof editType)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        >
                            <option value="general">General</option>
                            <option value="suggestion">Sugestie</option>
                            <option value="bug">Bug</option>
                            <option value="improvement">Îmbunătățire</option>
                            <option value="approval">Aprobare</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comentariu
                        </label>
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            maxLength={2000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-vertical"
                            placeholder="Scrie comentariul tău..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {editText.length}/2000 caractere
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSaveEdit}
                            disabled={!editText.trim()}
                            className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Salvează
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                        >
                            Anulează
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.comment}
                </div>
            )}
        </div>
    );
}; 