import { type RefObject } from "react";

interface TextAreaProps {
    reference?: RefObject<HTMLTextAreaElement>;
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    maxLength?: number;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function TextArea({
    reference,
    placeholder,
    value,
    onChange,
    onKeyPress,
    rows = 4,
    maxLength,
    disabled = false,
    required = false,
    className = ""
}: TextAreaProps) {
    return (
        <textarea
            ref={reference}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-vertical ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            } ${className}`}
        />
    );
} 