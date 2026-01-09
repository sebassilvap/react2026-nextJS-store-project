import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { LuAlignLeft } from 'react-icons/lu';
import Link from 'next/link';
import { Button } from '../ui/button';

// links for dropdown provided from a separate file
import { links } from '@/utils/links';

const LinksDropdown = () => {
    return (
        <DropdownMenu>
            {/* icon that triggers */}
            <DropdownMenuTrigger asChild>
                <Button
                    variant='outline'
                    className='flex gap-4 max-w-[100]'>
                    <LuAlignLeft className='w-6 h-6' />
                </Button>
            </DropdownMenuTrigger>

            {/* content of dropdown menu */}
            <DropdownMenuContent
                className='w-40'
                align='start'
                sideOffset={10}>
                {links.map((link) => {
                    return (
                        <DropdownMenuItem key={link.href}>
                            <Link
                                href={link.href}
                                className='capitalize w-full'>
                                {link.label}
                            </Link>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export default LinksDropdown;
