import { useRef } from "react";
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

    async function signup() {
        try {
            const password = passwordRef.current?.value;
            const email = emailRef.current?.value;
            const firstName = firstNameRef.current?.value;
            const lastName = lastNameRef.current?.value;

            await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
                email,
                password,
                firstName,
                lastName
            });

            alert("User signed up");
            navigate('/dashboard')
        } catch (error) {
            console.error(error);
            alert("Failed to sign up");
        }
    }

    return <div className="h-screen w-screen bg-slate-200 flex justify-center items-center ">
        <div className="bg-white rounded-xl min-w-48 p-8">
            <Input reference={firstNameRef} placeholder="First Name" />
            <Input reference={lastNameRef} placeholder="Last Name" />
            <Input reference={emailRef} placeholder="Email" />
            <Input reference={passwordRef} placeholder="Password" />
            <div className="flex justify-center pt-4">
                <Button onClick={signup} variant="primary" text="Sign Up" size="sm" />
            </div>
        </div>

    </div>
}