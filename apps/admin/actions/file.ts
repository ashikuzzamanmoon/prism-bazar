
export const fileUpload = async (
    files: File[],
    filePath: string
): Promise<string[]> => {
    try {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });
        formData.append('filePath', filePath);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file-uploader`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error('Image upload failed');
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Image Upload Error:', err);
        throw err;
    }
};