import React, { useState, useRef, useEffect } from "react";
import { AIService } from "@/services/ai.service";
import { TAIMenuProps } from "@plane/editor";
import { Loader2 } from "lucide-react";

const aiService = new AIService();

export const AIMenu: React.FC<TAIMenuProps> = (props) => {
    const { isOpen, onClose, editor } = props;
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        try {
            const response = await aiService.generateText(prompt);
            setGeneratedText(response.response);
        } catch (error) {
            console.error("Failed to generate text:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInsert = () => {
        if (editor) {
            editor.chain().insertContent(generatedText).run();
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex flex-col gap-3">
            <div className="font-medium text-sm text-gray-700">AI Assistant</div>
            <input
                ref={inputRef}
                type="text"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="Ask AI to write something..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleGenerate();
                }}
            />
            {isLoading && (
                <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
            )}
            {generatedText && (
                <div className="bg-gray-50 p-2 rounded text-sm text-gray-800 max-h-40 overflow-y-auto">
                    {generatedText}
                </div>
            )}
            <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">
                    Cancel
                </button>
                {generatedText ? (
                    <button
                        onClick={handleInsert}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Insert & Close
                    </button>
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Generate
                    </button>
                )}
            </div>
        </div>
    );
};
