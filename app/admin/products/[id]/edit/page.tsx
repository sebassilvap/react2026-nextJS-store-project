import { fetchAdminProductDetails, updateProductAction, updateProductImageAction } from '@/utils/actions';
import FormContainer from '@/components/form/FormContainer';
import FormInput from '@/components/form/FormInput';
import PriceInput from '@/components/form/PriceInput';
import TextAreaInput from '@/components/form/TextAreaInput';
import { SubmitButton } from '@/components/form/Buttons';
import CheckboxInput from '@/components/form/CheckboxInput';
import ImageInputContainer from '@/components/form/ImageInputContainer';

async function EditProductPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const product = await fetchAdminProductDetails(id);
    const { name, company, description, featured, price } = product;

    return (
        <section>
            <h1 className='text-2xl font-semibold mb-8 capitalize'>update product</h1>
            <div className='border p-8 rounded'>
                {/* IMAGE INPUT CONTAINER */}
                <ImageInputContainer
                    action={updateProductImageAction}
                    name={name}
                    image={product.image}
                    text='update image'>
                    {/* 2 hidden inputs as children */}
                    <input
                        type='hidden'
                        name='id'
                        value={id}
                    />
                    <input
                        type='hidden'
                        name='url'
                        value={product.image}
                    />
                </ImageInputContainer>

                {/* PRODUCT INPUT CONTAINER */}
                <FormContainer action={updateProductAction}>
                    <div className='grid gap-4 md:grid-cols-2 my-4'>
                        <input
                            type='hidden'
                            name='id'
                            value={id}
                        />
                        {/* PRODUCT NAME */}
                        <FormInput
                            type='text'
                            name='name'
                            label='product name'
                            defaultValue={name}
                        />
                        {/* COMPANY */}
                        <FormInput
                            type='text'
                            name='company'
                            defaultValue={company}
                        />
                        {/* PRICE */}
                        <PriceInput defaultValue={price} />
                    </div>

                    {/* PRODUCT DESCRIPTION */}
                    <TextAreaInput
                        name='description'
                        labelText='product description'
                        defaultValue={description}
                    />

                    {/* FEATURED OR NOT */}
                    <div className='mt-6'>
                        <CheckboxInput
                            name='featured'
                            label='featured'
                            defaultChecked={featured}
                        />
                    </div>

                    {/* BTN - UPDATE PRODUCT */}
                    <SubmitButton
                        text='update product'
                        className='mt-8'
                    />
                </FormContainer>
            </div>
        </section>
    );
}
export default EditProductPage;
