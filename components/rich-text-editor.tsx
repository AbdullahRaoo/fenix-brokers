"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Code,
    Eye,
    Palette
} from "lucide-react"

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
    label?: string
    placeholder?: string
    textColor?: string
    onTextColorChange?: (color: string) => void
    minHeight?: string
}

export function RichTextEditor({
    value,
    onChange,
    onBlur,
    label = "Content",
    placeholder = "Enter your text...",
    textColor = "#1a1a1a",
    onTextColorChange,
    minHeight = "120px"
}: RichTextEditorProps) {
    const [isCodeMode, setIsCodeMode] = useState(false)
    const [localHtml, setLocalHtml] = useState(value)
    const editorRef = useRef<HTMLDivElement>(null)
    const lastCaretPos = useRef<number>(0)

    // Sync localHtml with external value when not focused
    useEffect(() => {
        if (!editorRef.current?.contains(document.activeElement)) {
            setLocalHtml(value)
        }
    }, [value])

    // Update editor content when switching to visual mode or when localHtml changes
    useEffect(() => {
        if (!isCodeMode && editorRef.current) {
            // Only update if content is different to preserve cursor position
            if (editorRef.current.innerHTML !== localHtml) {
                editorRef.current.innerHTML = localHtml
            }
        }
    }, [isCodeMode, localHtml])

    const execCommand = (command: string, commandValue?: string) => {
        document.execCommand(command, false, commandValue)
        editorRef.current?.focus()
        handleContentChange()
    }

    const handleContentChange = useCallback(() => {
        if (editorRef.current) {
            const newHtml = editorRef.current.innerHTML
            setLocalHtml(newHtml)
            onChange(newHtml)
        }
    }, [onChange])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            execCommand('bold')
        } else if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            execCommand('italic')
        } else if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            execCommand('underline')
        }
    }

    const toggleCodeMode = () => {
        if (isCodeMode) {
            // Switching from code to visual
            // localHtml already contains the textarea value, just switch mode
            setIsCodeMode(false)
        } else {
            // Switching from visual to code
            // Sync editor content to localHtml first
            if (editorRef.current) {
                setLocalHtml(editorRef.current.innerHTML)
            }
            setIsCodeMode(true)
        }
    }

    const handleTextareaChange = (newValue: string) => {
        setLocalHtml(newValue)
        onChange(newValue)
    }

    // Apply color to selected text, or to whole content if nothing selected
    const applyColor = (color: string) => {
        const selection = window.getSelection()
        if (selection && selection.toString().length > 0) {
            // Apply to selected text only
            execCommand('foreColor', color)
        } else {
            // Apply to whole element via prop
            if (onTextColorChange) {
                onTextColorChange(color)
            }
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs">{label}</Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={toggleCodeMode}
                >
                    {isCodeMode ? (
                        <>
                            <Eye className="h-3 w-3" />
                            Visual
                        </>
                    ) : (
                        <>
                            <Code className="h-3 w-3" />
                            HTML
                        </>
                    )}
                </Button>
            </div>

            {!isCodeMode && (
                <div className="border rounded-md overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-0.5 p-1 bg-muted/50 border-b">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => execCommand('bold')}
                            title="Bold (Ctrl+B)"
                        >
                            <Bold className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => execCommand('italic')}
                            title="Italic (Ctrl+I)"
                        >
                            <Italic className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => execCommand('underline')}
                            title="Underline (Ctrl+U)"
                        >
                            <Underline className="h-3.5 w-3.5" />
                        </Button>

                        <div className="w-px h-5 bg-border mx-1" />

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => execCommand('justifyLeft')}
                            title="Align Left"
                        >
                            <AlignLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => execCommand('justifyCenter')}
                            title="Align Center"
                        >
                            <AlignCenter className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => execCommand('justifyRight')}
                            title="Align Right"
                        >
                            <AlignRight className="h-3.5 w-3.5" />
                        </Button>

                        <div className="w-px h-5 bg-border mx-1" />

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => execCommand('insertUnorderedList')}
                            title="Bullet List"
                        >
                            <List className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => execCommand('insertOrderedList')}
                            title="Numbered List"
                        >
                            <ListOrdered className="h-3.5 w-3.5" />
                        </Button>

                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Color Picker - applies to selection or whole text */}
                        <div className="flex items-center gap-1">
                            <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="color"
                                value={textColor}
                                onChange={(e) => applyColor(e.target.value)}
                                className="w-6 h-6 rounded border cursor-pointer"
                                title="Text Color (select text first for partial coloring)"
                            />
                        </div>
                    </div>

                    {/* Editable Area */}
                    <div
                        ref={editorRef}
                        contentEditable
                        className="overflow-y-auto p-3 text-sm focus:outline-none"
                        style={{ minHeight, maxHeight: '300px', color: textColor }}
                        onInput={handleContentChange}
                        onBlur={onBlur}
                        onKeyDown={handleKeyDown}
                        data-placeholder={placeholder}
                        suppressContentEditableWarning
                    />
                </div>
            )}

            {isCodeMode && (
                <Textarea
                    value={localHtml}
                    onChange={(e) => handleTextareaChange(e.target.value)}
                    onBlur={onBlur}
                    rows={8}
                    className="font-mono text-xs"
                    placeholder="<p>Enter HTML...</p>"
                />
            )}

            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
                [contenteditable] ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                [contenteditable] ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                [contenteditable] li {
                    margin: 0.25rem 0;
                }
            `}</style>
        </div>
    )
}
