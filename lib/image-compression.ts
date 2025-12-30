/**
 * Compresses an image file if it exceeds the target size.
 * Uses the browser's Canvas API to resize and compress the image.
 * 
 * @param file The original file to compress
 * @param options Configuration options
 * @returns Promise resolving to the compressed File (or original if no compression needed)
 */
export async function compressImage(
    file: File,
    options: {
        maxSizeMB: number,
        maxWidthOrHeight?: number,
        initialQuality?: number
    } = { maxSizeMB: 4, maxWidthOrHeight: 1920, initialQuality: 0.8 }
): Promise<File> {
    // If file is already smaller than target, return original
    if (file.size <= options.maxSizeMB * 1024 * 1024) {
        return file
    }

    return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(img.src)

            let width = img.width
            let height = img.height
            const maxWidth = options.maxWidthOrHeight || 1920
            const maxHeight = options.maxWidthOrHeight || 1920

            // Calculate new dimensions keeping aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width)
                    width = maxWidth
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height)
                    height = maxHeight
                }
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Could not get canvas context'))
                return
            }

            // Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height)

            // Recursive compression function to find the right quality
            const attemptCompression = (quality: number) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob failed'))
                            return
                        }

                        // If we hit the target size or quality is too low, resolve
                        if (blob.size <= options.maxSizeMB * 1024 * 1024 || quality <= 0.1) {
                            // Convert blob back to File
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg', // Force JPEG for better compression
                                lastModified: Date.now(),
                            })
                            resolve(compressedFile)
                        } else {
                            // Try again with lower quality
                            attemptCompression(quality - 0.1)
                        }
                    },
                    'image/jpeg',
                    quality
                )
            }

            attemptCompression(options.initialQuality || 0.8)
        }

        img.onerror = (err) => {
            URL.revokeObjectURL(img.src)
            reject(err)
        }
    })
}
