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

            // Show success message
            alert(message || "Autentificare reușită!");
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

    return <div className="h-screen w-screen bg-slate-200 flex justify-center items-center">
        <div className="bg-white rounded-xl min-w-96 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Autentificare
            </h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <Input 
                    reference={emailRef} 
                    placeholder="Email" 
                    onKeyPress={handleKeyPress}
                />
                <Input 
                    reference={passwordRef} 
                    placeholder="Parolă" 
                    type="password"
                    onKeyPress={handleKeyPress}
                />
            </div>

            <div className="flex justify-center pt-6">
                <Button 
                    onClick={signin} 
                    variant="primary" 
                    text={isLoading ? "Se autentifică..." : "Autentificare"} 
                    size="sm"
                    disabled={isLoading}
                />
            </div>

            <div className="text-center mt-4">
                <p className="text-gray-600">
                    Nu ai cont?{" "}
                    <button 
                        onClick={() => navigate('/signup')}
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        Înregistrează-te aici
                    </button>
                </p>
            </div>
        </div>
    </div>
}