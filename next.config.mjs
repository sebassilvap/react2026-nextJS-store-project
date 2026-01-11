/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
            },
            {
                protocol: 'https',
                //hostname: 'ibbdetibjuzwrprbiayt.supabase.co', //? given by tutor
                hostname: 'tfixwotgdyzvnxucuftx.supabase.co', //? my case
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
        ],
    },
};

export default nextConfig;
