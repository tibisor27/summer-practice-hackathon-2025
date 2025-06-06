import { useRef, useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { ShareIcon } from "../icons/ShareIcon";

enum contentType {
    Youtube = "youtube",
    Twitter = "twitter"
}

//controled component
export function CreateContentModal({ open, onClose }: { open: boolean; onClose: () => void }) {

    const linkRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);

    const [type, setType] = useState(contentType.Youtube)

    async function addContent() {
        const title = titleRef.current?.value;
        const link = linkRef.current?.value;

        await axios.post(`${BACKEND_URL}/api/v1/content`, {
            title,
            link,
            type
        }, {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        })
        onClose()
    }
    return <div>
        {open && <div>
            <div className="w-screen h-screen bg-slate-500 fixed top-0 left-0 opacity-80 flex justify-center">
            </div>

            <div className="w-screen h-screen fixed top-0 left-0 flex justify-center">
                <div className="flex flex-col justify-center">
                    <span className="bg-white opacity-100 p-4 rounded">
                        <div className="flex justify-end">
                            <div onClick={onClose} className="cursor-pointer">
                                <ShareIcon size="md" />
                            </div>
                        </div>
                        <div>
                            <Input reference={titleRef} placeholder="Title" />
                            <Input reference={linkRef} placeholder="Link" />
                        </div>
                        <div>
                            <h1>Type</h1>
                            <div className="flex justify-center gap-1 p-4">
                                <Button onClick={() => {
                                    setType(contentType.Youtube)
                                }}
                                    text="Youtube" variant={type === contentType.Youtube ? "primary" : "secondary"} size="sm" />

                                <Button onClick={() => {
                                    setType(contentType.Twitter)
                                }} text="Twitter" variant={type === contentType.Twitter ? "primary" : "secondary"} size="sm" />
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Button onClick={addContent} variant="primary" text="Submit" size="sm" />
                        </div>
                    </span>
                </div>
            </div>
        </div>}
    </div>
}

