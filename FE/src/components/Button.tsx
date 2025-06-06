import type { ReactElement } from "react";

type Variants = "primary" | "secondary"
interface ButtonProps {
    variant: Variants;
    size: "sm" | "md" | "lg";
    text:string | ReactElement;
    startIcon?: ReactElement;
    endIcon?: ReactElement;
    onClick?: () => void;
    disabled?: boolean;
}

const variantStyles = {
    "primary": "bg-purple-600 text-white ",
    "secondary": "bg-purple-300 text-purple-600"
}

const sizeStyles = {
    "sm": "py-1 px-2 text-sm rounded-sm",
    "md": "py-2 px-4 text-md rounded-md",
    "lg": "py-4 px-6 text-xl rounded-xl"
}

const defaultStyles ="rounded-md flex"

export const Button = (props: ButtonProps) => {
    return <button 
        onClick={props.disabled ? undefined : props.onClick} 
        disabled={props.disabled}
        className={`${variantStyles[props.variant]} ${defaultStyles} ${sizeStyles[props.size]} ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} transition-opacity`}>
        <div className="flex justify-center items-center">
            {props.startIcon}
            <div className="pl-2 pr-2">
            {props.text}
            </div>
            {props.endIcon}
        </div>
    </button>
}
