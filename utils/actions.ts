import db from '@/utils/db';
import { redirect } from 'next/navigation';

// ========================================================
//? function => get all the products where featured=true
// ========================================================
export const fetchFeaturedProducts = async () => {
    const products = await db.product.findMany({
        // when saved into a variable, we need to use async
        where: {
            featured: true,
        },
        // which properties to grab
        /*
        select: {
            name: true,
        },
        */
    });
    return products;
};

// =====================================
//? function => fetch all the products
// =====================================
export const fetchAllProducts = ({ search = '' }: { search: string }) => {
    return db.product.findMany({
        where: {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
            ],
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

// =====================================
//? function => fetch a single product
// =====================================
export const fetchSingleProduct = async (productId: string) => {
    const product = await db.product.findUnique({
        where: {
            id: productId,
        },
    });
    if (!product) redirect('/products');
    return product;
};
