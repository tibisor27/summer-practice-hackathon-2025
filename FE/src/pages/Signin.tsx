import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config"
import { Button } from "../components/Button"
import { Input } from "../components/Input"

export const Signin = () => {
    const passwordRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");

    async function signin() {
        setError("");
        setIsLoading(true);

        try {
            const password = passwordRef.current?.value;
            const email = emailRef.current?.value;

            // Basic validation
            if (!email || !password) {
                setError("Te rugăm să completezi toate câmpurile");
                setIsLoading(false);
                return;
            }

            if (!email.includes("@")) {
                setError("Te rugăm să introduci o adresă de email validă");
                setIsLoading(false);
                return;
            }

            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
                email,
                password
            }); 

            // Store token and user info
            const { token, userId, email: userEmail, message } = response.data;
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("userEmail", userEmail);

            // Show success message and redirect
            navigate('/dashboard');

        } catch (error: any) {
            console.error("Signin error:", error);
            
            // Handle different error types based on API responses
            if (error.response?.status === 401) {
                if (error.response.data.message === "Incorrect email") {
                    setError("Email-ul introdus nu există în sistem");
                } else if (error.response.data.message === "Invalid password") {
                    setError("Parola introdusă este incorectă");
                } else {
                    setError("Email sau parolă incorectă");
                }
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
            signin();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Bun venit înapoi
                    </h1>
                    <p className="text-gray-600">
                        Autentifică-te în contul tău
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

                {/* Form */}
                <div className="space-y-5">
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
                            placeholder="Introdu parola" 
                            type="password"
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                    <Button 
                        onClick={signin} 
                        variant="primary" 
                        text={isLoading ? "Se autentifică..." : "Autentificare"} 
                        size="lg"
                        disabled={isLoading}
                    />
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Nu ai cont?{" "}
                        <button 
                            onClick={() => navigate('/signup')}
                            className="text-purple-600 hover:text-purple-800 font-medium underline transition-colors"
                            disabled={isLoading}
                        >
                            Înregistrează-te aici
                        </button>
                    </p>
                </div>

                {/* Forgot Password Link */}
                <div className="text-center mt-4">
                    <button 
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={isLoading}
                    >
                        Ai uitat parola?
                    </button>
                </div>
            </div>
        </div>
    );
}