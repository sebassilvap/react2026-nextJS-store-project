import FormContainer from '@/components/form/FormContainer';
import FormInput from '@/components/form/FormInput';
import { Button } from '@/components/ui/button';
//import { Input } from '@/components/ui/input';
//import { Label } from '@/components/ui/label';
import { faker } from '@faker-js/faker';
import { createProductAction } from '../../../../utils/actions';
import PriceInput from '@/components/form/PriceInput';
import ImageInput from '@/components/form/ImageInput';
import TextAreaInput from '@/components/form/TextAreaInput';
import CheckboxInput from '@/components/form/CheckboxInput';
import { SubmitButton } from '@/components/form/Buttons';

// temporary
/*
const createProductAction = async (formData: FormData) => {
    'use server';
    const name = formData.get('name') as string;
    console.log(name);
};
*/

function CreateProductPage() {
    const name = faker.commerce.productName();
    const company = faker.company.name();
    const descripiton = faker.lorem.paragraph({ min: 10, max: 12 });

    return (
        <section>
            <h1 className='text-2xl font-semibold mb-8 capitalize'>create product</h1>
            <div className='border p-8 rounded-md'>
                {/* temporary */}
                {/*  
                <form action={createProductAction}>
                    <FormInput
                        type='text'
                        name='name'
                        label='product name'
                        defaultValue={name}
                    />
                    <Button
                        type='submit'
                        size='lg'>
                        Submit
                    </Button>
                </form>
                */}

                <FormContainer action={createProductAction}>
                    <div className='grid gap-4 md:grid-cols-2 my-4'>
                        <FormInput
                            type='text'
                            name='name'
                            label='product name'
                            defaultValue={name}
                        />
                        <FormInput
                            type='text'
                            name='company'
                            label='company'
                            defaultValue={company}
                        />
                        <PriceInput />
                        <ImageInput />
                    </div>

                    <TextAreaInput
                        name='description'
                        labelText='product description'
                        defaultValue={descripiton}
                    />

                    <div className='mt-6'>
                        <CheckboxInput
                            name='featured'
                            label='featured'
                        />
                    </div>
                    <SubmitButton
                        text='create product'
                        className='mt-8'
                    />
                </FormContainer>
            </div>
        </section>
    );
}
export default CreateProductPage;
