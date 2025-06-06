import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function useContent() {
    const [content, setContent] = useState([]);

    async function refreshContent() {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/content/all`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            console.log(response)
            console.log("API response:", response.data); // Log pentru debugging
            setContent(response.data.contents || []);
        } catch (error) {
            console.error("Error fetching content:", error);
        }
    }

    async function deleteContent(contentId: string) {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
                headers: {
                    "Authorization": token
                }
            });
            // Refresh content after successful deletion
            await refreshContent();
            return { success: true };
        } catch (error: any) {
            console.error("Error deleting content:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Eroare la ștergerea proiectului" 
            };
        }
    }

    async function updateContent(contentId: string, updateData: any) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${BACKEND_URL}/api/v1/content/${contentId}`, updateData, {
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                }
            });
            // Refresh content after successful update
            await refreshContent();
            return { success: true, content: response.data.content };
        } catch (error: any) {
            console.error("Error updating content:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || "Eroare la actualizarea proiectului" 
            };
        }
    }

    useEffect(() => {
        refreshContent();

        const interval = setInterval(refreshContent, 10 * 1000);
        return () => clearInterval(interval);
    }, []);

    return { 
        content, 
        refreshContent, 
        deleteContent, 
        updateContent 
    }; 
}
