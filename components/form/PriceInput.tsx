import { Label } from '../ui/label';
import { Input } from '../ui/input';
//import { Prisma } from '@prisma/client';

// Access the properties of Prisma
//Prisma.ProductScalarFieldEnum.price

const name = 'price';

type FormInputNumberProps = {
    defaultValue?: number;
};

function PriceInput({ defaultValue }: FormInputNumberProps) {
    return (
        <div className='mb-2'>
            <Label
                htmlFor={name}
                className='capitalize'>
                Price ($)
            </Label>
            {/* here we have some attrb only associated with numbers => we cannot use our FormInput component */}
            <Input
                id={name}
                type='number'
                name={name}
                min={0}
                defaultValue={defaultValue || 100}
                required
            />
        </div>
    );
}
export default PriceInput;
