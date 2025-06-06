interface inputProps {
    placeholder: string,
    reference: any,
    type?: string,
    onKeyPress?: (e: React.KeyboardEvent) => void
}

export function Input({ placeholder, reference, type = "text", onKeyPress }: inputProps) {
    return <div>
        <input 
            ref={reference} 
            placeholder={placeholder} 
            type={type} 
            onKeyPress={onKeyPress}
            className="px-4 py-2 border rounded m-2 w-full" 
        />
    </div>
}