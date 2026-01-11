'use server';

import db from '@/utils/db';
import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import {
    imageSchema,
    productSchema,
    reviewSchema,
    validateWithZodSchema,
} from './schemas';
import { deleteImage, uploadImage } from './supabase';
import { revalidatePath } from 'next/cache';
import { Cart } from '@prisma/client';

/*
 *** GENERAL FUNCTIONS: AUTH USER / RENDER ERROR / CHECK ADMIN USER ***
 */

// ===============================
//? function => get the auth user
// ===============================
const getAuthUser = async () => {
    const user = await currentUser();
    if (!user) redirect('/');
    return user;
};

// ==================================================
//? function => to render error in case there's any
// ==================================================
const renderError = (error: unknown): { message: string } => {
    console.log(error);
    return {
        message: error instanceof Error ? error.message : 'an error occured',
    };
};

// ========================================================
//? function => if not admin user redirected to home page
// ========================================================
const getAdminUser = async () => {
    const user = await getAuthUser();
    if (user.id !== process.env.ADMIN_USER_ID) redirect('/');
    return user;
};

/*
 *** PRODUCTS ***
 */

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

// ====================================
//? function => create product action
// ====================================

// ==> NOT PRACTICAL FOR BIG PROJECTS
/*
export const createProductAction = async (
    prevState: any,
    formData: FormData
): Promise<{ message: string }> => {
    // grab clerkId
    const user = await getAuthUser();

    try {
        // grab the inputs
        const name = formData.get('name') as string;
        const company = formData.get('company') as string;
        const price = Number(formData.get('price') as string);
        // temp
        const image = formData.get('image') as File;
        const description = formData.get('description') as string;
        const featured = Boolean(formData.get('featured') as string);

        await db.product.create({
            data: {
                name,
                company,
                price,
                image: '/images/product-1.jpg',
                description,
                featured,
                clerkId: user.id,
            },
        });

        return { message: 'product created' };
    } catch (error) {
        //return { message: 'there was an error...' }; // hardcoded value
        return renderError(error);
    }
};
*/

// ==> RAW DATA AND SCHEMA FPOR EVERY CREATE ACTION, THIS NEEDS TO BE IMPROVED

/*
export const createProductAction = async (
    prevState: any,
    formData: FormData
): Promise<{ message: string }> => {
    // grab clerkId
    const user = await getAuthUser();

    try {
        // grab the inputs
        const rawData = Object.fromEntries(formData);
        //console.log(rawData);
        //const validatedFields = productSchema.parse(rawData);

        const validateFields = productSchema.safeParse(rawData);

        if (!validateFields.success) {
            // in case it is false, iterate and grab error messages
            const errors = validateFields.error.errors.map(
                (error) => error.message
            );
            throw new Error(errors.join(','));
        }

        return { message: 'product created' };
    } catch (error) {
        //return { message: 'there was an error...' }; // hardcoded value
        return renderError(error);
    }
};
*/

// ==> WITH FUNCTION TO VALIDATE WITH ZOD SCHEMA IN schemas.ts
//     AND WITH IMAGE UPLOAD AND IMAGE SCHEMA VALIDATION

export const createProductAction = async (
    prevState: any,
    formData: FormData
): Promise<{ message: string }> => {
    // grab clerkId
    const user = await getAuthUser();

    try {
        // grab the inputs
        const rawData = Object.fromEntries(formData);
        const file = formData.get('image') as File;
        const validateFields = validateWithZodSchema(productSchema, rawData);
        const validatedFile = validateWithZodSchema(imageSchema, {
            image: file,
        });
        //console.log(validatedFile);
        const fullPath = await uploadImage(validatedFile.image);

        await db.product.create({
            data: {
                ...validateFields,
                //image: '/images/product-3.jpg', //? for testing
                image: fullPath,
                clerkId: user.id,
            },
        });

        //return { message: 'product created' }; //? to use redirect below
    } catch (error) {
        //return { message: 'there was an error...' }; // hardcoded value
        return renderError(error);
    }

    // redirect the user to "My Products" Page
    redirect('/admin/products');
};

/*
 *** DASHBOARD - ADMIN ***
 */

// ================================
//? function => get admin products
// ================================
export const fetchAdminProducts = async () => {
    await getAdminUser();
    const products = await db.product.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
    return products;
};

// ==================================================
//? function => delete product - dashboard - actions
// ==================================================
export const deleteProductAction = async (prevState: { productId: string }) => {
    const { productId } = prevState;
    await getAdminUser();

    try {
        const product = await db.product.delete({
            where: {
                id: productId,
            },
        });
        // delete image from supabase
        await deleteImage(product.image);

        revalidatePath('/admin/products');
        return { message: 'product removed' };
    } catch (error) {
        return renderError(error);
    }
};

// ============================================================
//? function => for dashboard + edit - fetch product details
// ============================================================
export const fetchAdminProductDetails = async (productId: string) => {
    await getAdminUser();
    const product = await db.product.findUnique({
        where: {
            id: productId,
        },
    });
    if (!product) redirect('/admin/products');
    return product;
};

// =============================================
//? function => update the product after edit
// =============================================
export const updateProductAction = async (
    prevState: any,
    formData: FormData
) => {
    await getAdminUser();

    try {
        const productId = formData.get('id') as string;
        const rawData = Object.fromEntries(formData);
        const validatedFields = validateWithZodSchema(productSchema, rawData);

        // update product in db
        await db.product.update({
            where: {
                id: productId,
            },
            data: {
                ...validatedFields,
            },
        });

        // to see latest changes => revalidate the path
        revalidatePath(`/admin/products/${productId}/edit`);

        return { message: 'Product updated successfully' };
    } catch (error) {
        return renderError(error);
    }
};

// ===================================
//? function => update product image
// ===================================
export const updateProductImageAction = async (
    prevState: any,
    formData: FormData
) => {
    // check if admin user
    await getAuthUser();

    try {
        const image = formData.get('image') as File;
        const productId = formData.get('id') as string;
        const oldImageUrl = formData.get('url') as string;

        const validatedFile = validateWithZodSchema(imageSchema, { image });

        // grab full path from supabase
        const fullPath = await uploadImage(validatedFile.image);

        // if successful delete image
        await deleteImage(oldImageUrl);
        await db.product.update({
            where: {
                id: productId,
            },
            data: {
                image: fullPath,
            },
        });
        // to see latest changes => revalidate the path
        revalidatePath(`/admin/products/${productId}/edit`);
        return { message: 'Product Image updated successfully' };
    } catch (error) {
        return renderError(error);
    }
};

/*
 *** FAVORITE PRODUCTS ***
 */

// ===========================================
//? function => fetch favorite from auth user
// ===========================================
export const fetchFavoriteId = async ({ productId }: { productId: string }) => {
    // check the user
    const user = await getAuthUser();

    // grab favorite from user
    const favorite = await db.favorite.findFirst({
        where: {
            productId,
            clerkId: user.id,
        },
        select: {
            id: true,
        },
    });
    return favorite?.id || null;
};

// ==============================
//? function => toggle favorite
// ==============================
export const toggleFavoriteAction = async (prevState: {
    productId: string;
    favoriteId: string | null;
    pathname: string;
}) => {
    const user = await getAuthUser();
    const { productId, favoriteId, pathname } = prevState;

    try {
        // if it is already favorite
        if (favoriteId) {
            await db.favorite.delete({
                where: {
                    id: favoriteId,
                },
            });
        }
        // if it is not favorite
        else {
            await db.favorite.create({
                data: {
                    productId,
                    clerkId: user.id,
                },
            });
        }
        revalidatePath(pathname);
        return {
            message: favoriteId
                ? 'removed from favorites'
                : 'added to favorites',
        };
    } catch (error) {
        return renderError(error);
    }
};

// =============================================
//? function => fetch favorites from the user
// =============================================
export const fetchUserFavorites = async () => {
    const user = await getAuthUser();
    const favorites = await db.favorite.findMany({
        where: {
            clerkId: user.id,
        },
        // if we want more properties than the ones we have in favorites we use include
        include: {
            product: true,
        },
    });
    return favorites;
};

/*
 *** REVIEW ***
 */

// ==============================
//? function => create a review
// ==============================
export const createReviewAction = async (
    prevState: any,
    formData: FormData
) => {
    const user = await getAuthUser();

    try {
        const rawData = Object.fromEntries(formData);
        const validatedFields = validateWithZodSchema(reviewSchema, rawData);
        await db.review.create({
            data: {
                ...validatedFields,
                clerkId: user.id,
            },
        });

        revalidatePath(`/products/${validatedFields.productId}`);

        return { message: 'review submittedsuccessfully' };
    } catch (error) {
        return renderError(error);
    }
};

// ========================================
//? function => fetch all product reviews
// ========================================
export const fetchProductReviews = async (productId: string) => {
    const reviews = await db.review.findMany({
        where: {
            productId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return reviews;
};

// ==================================
//? function => fetch product rating
// ==================================
export const fetchProductRating = async (productId: string) => {
    const result = await db.review.groupBy({
        by: ['productId'],
        _avg: {
            rating: true,
        },
        _count: {
            rating: true,
        },
        where: {
            productId,
        },
    });
    return {
        rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
        count: result[0]?._count.rating ?? 0,
    };
};

// ==================================================
//? function => fetch product reviews from the user
// ==================================================
export const fetchProductReviewsByUser = async () => {
    const user = await getAuthUser();
    const reviews = await db.review.findMany({
        where: {
            clerkId: user.id,
        },
        select: {
            id: true,
            rating: true,
            comment: true,
            product: {
                select: {
                    image: true,
                    name: true,
                },
            },
        },
    });
    return reviews;
};

// ============================
//? function => delete review
// ============================
export const deleteReviewAction = async (prevState: { reviewId: string }) => {
    const { reviewId } = prevState;
    const user = await getAuthUser();

    try {
        await db.review.delete({
            where: {
                id: reviewId,
                clerkId: user.id,
            },
        });
        revalidatePath('/reviews');
        return { message: 'review deleted successfully!' };
    } catch (error) {
        return renderError(error);
    }
};

// ==============================================
//? function => find a review made by the user
// ==============================================
export const findExistingReview = async (userId: string, productId: string) => {
    return db.review.findFirst({
        where: {
            clerkId: userId,
            productId,
        },
    });
};

/*
 *** CART ***
 */

// =================================
//? function => fetch items in Cart
// =================================
export const fetchCartItems = async () => {
    const { userId } = auth();
    const cart = await db.cart.findFirst({
        where: {
            clerkId: userId ?? '',
        },
        select: {
            numItemsInCart: true,
        },
    });
    return cart?.numItemsInCart || 0;
};

// ===========================
//? function => fetch Product
// ===========================
const fetchProduct = async (productId: string) => {
    const product = await db.product.findUnique({
        where: {
            id: productId,
        },
    });
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
};

// ====================================
//? function => fetch or Create Cart
// ====================================

const includeProductClause = {
    cartItems: {
        include: {
            product: true, // include the entire product info
        },
    },
};

export const fetchOrCreateCart = async ({
    userId,
    errorOnFailure = false,
}: {
    userId: string;
    errorOnFailure?: boolean;
}) => {
    let cart = await db.cart.findFirst({
        where: {
            clerkId: userId,
        },
        include: includeProductClause,
    });

    if (!cart && errorOnFailure) {
        throw new Error('Cart not found');
    }

    // if no cart, we create one
    if (!cart) {
        cart = await db.cart.create({
            data: {
                clerkId: userId,
            },
            include: includeProductClause,
        });
    }
    return cart;
};

// =========================================
//? function => update or create Cart Item
// =========================================
const updateOrCreateCartItem = async ({
    productId,
    cartId,
    amount,
}: {
    productId: string;
    cartId: string;
    amount: number;
}) => {
    let cartItem = await db.cartItem.findFirst({
        where: {
            productId,
            cartId,
        },
    });
    if (cartItem) {
        cartItem = await db.cartItem.update({
            where: {
                id: cartItem.id,
            },
            data: {
                amount: cartItem.amount + amount, // current + new amount
            },
        });
    }
    // if no cart item
    else {
        cartItem = await db.cartItem.create({
            data: { amount, productId, cartId },
        });
    }
};

// =========================
//? function => update cart
// =========================
export const updateCart = async (cart: Cart) => {
    // fetch all cart items that we have in the user's cart
    const cartItems = await db.cartItem.findMany({
        where: {
            cartId: cart.id,
        },
        include: {
            product: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });
    let numItemsInCart = 0;
    let cartTotal = 0;

    for (const item of cartItems) {
        numItemsInCart += item.amount;
        cartTotal += item.amount * item.product.price;
    }
    const tax = cart.taxRate * cartTotal;
    const shipping = cartTotal ? cart.shipping : 0;
    const orderTotal = cartTotal + tax + shipping;

    // update the cart
    const currentCart = await db.cart.update({
        where: {
            id: cart.id,
        },
        data: {
            numItemsInCart,
            cartTotal,
            tax,
            orderTotal,
        },
        include: includeProductClause,
    });
    return { cartItems, currentCart };
};

// ===========================
//? function => add to cart
// ===========================
export const addToCartAction = async (prevState: any, formData: FormData) => {
    const user = await getAuthUser();

    try {
        const productId = formData.get('productId') as string;
        const amount = Number(formData.get('amount'));
        await fetchProduct(productId);
        const cart = await fetchOrCreateCart({ userId: user.id });
        await updateOrCreateCartItem({ productId, cartId: cart.id, amount });
        await updateCart(cart);
    } catch (error) {
        return renderError(error);
    }
    redirect('/cart');
};

// ================================
//? => function remove cart item
// ================================
export const removeCartItemAction = async (
    prevState: any,
    formData: FormData
) => {
    const user = await getAuthUser();

    try {
        const CartItemId = formData.get('id') as string;
        const cart = await fetchOrCreateCart({
            userId: user.id,
            errorOnFailure: true,
        });
        await db.cartItem.delete({
            where: {
                id: CartItemId,
                cartId: cart.id,
            },
        });
        await updateCart(cart);
        revalidatePath('/cart');

        return { message: 'Item removed from cart' };
    } catch (error) {
        return renderError(error);
    }
};

// ===============================
//? function => update cart item
// ===============================
export const updateCartItemAction = async ({
    amount,
    cartItemId,
}: {
    amount: number;
    cartItemId: string;
}) => {
    const user = await getAuthUser();
    try {
        const cart = await fetchOrCreateCart({
            userId: user.id,
            errorOnFailure: true,
        });

        await db.cartItem.update({
            where: {
                id: cartItemId,
                cartId: cart.id,
            },
            data: {
                amount,
            },
        });
        await updateCart(cart);
        revalidatePath('/cart');

        return { message: ' cart updated' };
    } catch (error) {
        return renderError(error);
    }
};

/*
 *** ORDERS ***
 */

// ===========================
//? function => create order
// ===========================
export const createOrderAction = async (prevState: any, formData: FormData) => {
    const user = await getAuthUser();
    let orderId: null | string = null;
    let cartId: null | string = null;

    try {
        const cart = await fetchOrCreateCart({
            userId: user.id,
            errorOnFailure: true,
        });
        cartId = cart.id;

        // remove all orders where isPaid is false
        await db.order.deleteMany({
            where: {
                clerkId: user.id,
                isPaid: false,
            },
        });

        const order = await db.order.create({
            data: {
                clerkId: user.id,
                products: cart.numItemsInCart,
                orderTotal: cart.orderTotal,
                tax: cart.tax,
                shipping: cart.shipping,
                email: user.emailAddresses[0].emailAddress,
            },
        });
        /*
        // remove existing cart - TEMPORAL
        await db.cart.delete({
            where: {
                id: cart.id,
            },
        });
        */
        orderId = order.id;
    } catch (error) {
        return renderError(error);
    }
    //redirect('/orders');
    redirect(`/checkout?orderId=${orderId}&cartId=${cartId}`);
};

// =======================================
//? function => fetch user orders (user)
// =======================================
export const fetchUserOrders = async () => {
    const user = await getAuthUser();
    const orders = await db.order.findMany({
        where: {
            clerkId: user.id,
            isPaid: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return orders;
};

// ===================================
//? function => fetch orders (admin)
// ===================================
export const fetchAdminOrders = async () => {
    const user = await getAdminUser();

    const orders = await db.order.findMany({
        where: {
            isPaid: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return orders;
};
