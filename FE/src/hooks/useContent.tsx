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


    useEffect(() => {
        refreshContent();

        const interval = setInterval(refreshContent, 10 * 1000);
        return () => clearInterval(interval);
    }, []);

    return content; 
}
