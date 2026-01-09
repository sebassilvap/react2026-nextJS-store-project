import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const BreadCrumbs = ({ name }: { name: string }) => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* BREADCRUMB ITEM */}
                <BreadcrumbItem>
                    <BreadcrumbLink
                        href='/'
                        className='capitalize text-lg'>
                        home
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {/* BREADCRUMB ITEM */}
                <BreadcrumbItem>
                    <BreadcrumbLink
                        href='/products'
                        className='capitalize text-lg'>
                        products
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {/* BREADCRUMB ITEM */}
                <BreadcrumbItem>
                    <BreadcrumbPage className='capitalize text-lg'>{name}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
};
export default BreadCrumbs;
