import { createClient } from '@supabase/supabase-js';

const bucket = 'main-bucket'; // bucket is the space in supabase where we upload files

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_KEY as string
);

// function => to upload image
export const uploadImage = async (image: File) => {
    const timestamp = Date.now();
    const newName = `${timestamp}-${image.name}`;
    const { data } = await supabase.storage
        .from(bucket)
        .upload(newName, image, { cacheControl: '3600' });

    if (!data) throw new Error('Image upload failed');

    // if we pass previous condition, we have successfully uploaded the image
    return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl;
};

// function => delete image from bucket supabase
export const deleteImage = async (url: string) => {
    const imageName = url.split('/').pop();
    if (!imageName) throw new Error('Invalid URL');
    return supabase.storage.from(bucket).remove([imageName]);
};
