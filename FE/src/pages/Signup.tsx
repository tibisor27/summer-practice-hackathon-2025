import { useRef, useState } from "react";
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
    const passwordRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    async function signup() {
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const password = passwordRef.current?.value;
            const email = emailRef.current?.value;
            const firstName = firstNameRef.current?.value;
            const lastName = lastNameRef.current?.value;

            // Basic validation
            if (!email || !password || !firstName || !lastName) {
                setError("Te rugăm să completezi toate câmpurile");
                setIsLoading(false);
                return;
            }

            if (!email.includes("@")) {
                setError("Te rugăm să introduci o adresă de email validă");
                setIsLoading(false);
                return;
            }

            if (password.length < 6) {
                setError("Parola trebuie să aibă cel puțin 6 caractere");
                setIsLoading(false);
                return;
            }

            await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
                email,
                password,
                firstName,
                lastName
            });

            setSuccess("Cont creat cu succes! Vei fi redirecționat...");
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error: any) {
            console.error("Signup error:", error);
            
            if (error.response?.status === 409) {
                setError("Există deja un cont cu acest email");
            } else if (error.response?.status === 411) {
                setError("Datele introduse nu sunt valide");
            } else if (error.response?.status === 500) {
                setError("Eroare de server. Te rugăm să încerci din nou mai târziu");
            } else {
                setError("A apărut o eroare. Te rugăm să încerci din nou");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            signup();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Creează un cont
                    </h1>
                    <p className="text-gray-600">
                        Completează datele pentru a începe
                    </p>
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

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {success}
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prenume
                            </label>
                            <Input 
                                reference={firstNameRef} 
                                placeholder="Prenume" 
                                onKeyPress={handleKeyPress}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nume
                            </label>
                            <Input 
                                reference={lastNameRef} 
                                placeholder="Nume" 
                                onKeyPress={handleKeyPress}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <Input 
                            reference={emailRef} 
                            placeholder="adresa@email.com" 
                            type="email"
                            onKeyPress={handleKeyPress}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parolă
                        </label>
                        <Input 
                            reference={passwordRef} 
                            placeholder="Minim 6 caractere" 
                            type="password"
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                    <Button 
                        onClick={signup} 
                        variant="primary" 
                        text={isLoading ? "Se creează contul..." : "Creează cont"} 
                        size="lg"
                        disabled={isLoading}
                    />
                </div>

                {/* Sign In Link */}
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Ai deja un cont?{" "}
                        <button 
                            onClick={() => navigate('/signin')}
                            className="text-purple-600 hover:text-purple-800 font-medium underline transition-colors"
                            disabled={isLoading}
                        >
                            Autentifică-te aici
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}