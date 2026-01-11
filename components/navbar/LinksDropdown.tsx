import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
// links for dropdown provided from a separate file
import { links } from '@/utils/links';

import { LuAlignLeft } from 'react-icons/lu';
import UserIcon from './UserIcon';
import Link from 'next/link';
import { Button } from '../ui/button';
import SignOutLink from './SignOutLink';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

const LinksDropdown = () => {
    const { userId } = auth();
    const isAdmin = userId === process.env.ADMIN_USER_ID;

    return (
        <DropdownMenu>
            {/* icon that triggers */}
            <DropdownMenuTrigger asChild>
                <Button
                    variant='outline'
                    className='flex gap-4 max-w-[100]'>
                    <LuAlignLeft className='w-6 h-6' />
                    <UserIcon />
                </Button>
            </DropdownMenuTrigger>

            {/* content of dropdown menu */}
            <DropdownMenuContent
                className='w-40'
                align='start'
                sideOffset={10}>
                {/* LINKS TO DISPLAY WHEN SIGNED OUT */}
                <SignedOut>
                    {/* dropdown menu item 1 - sign in BTN */}
                    <DropdownMenuItem>
                        <SignInButton mode='modal'>
                            <button className='w-full text-left'>Login</button>
                        </SignInButton>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {/* dropdown menu item 2 - sign up BTN */}
                    <DropdownMenuItem>
                        <SignUpButton mode='modal'>
                            <button className='w-full text-left'>Register</button>
                        </SignUpButton>
                    </DropdownMenuItem>
                </SignedOut>

                {/* LINKS TO DISPLAY WHEN SIGNED IN */}
                <SignedIn>
                    {links.map((link) => {
                        // if it is not ADMIN => he cannot see the Dashboard tab
                        if (link.label === 'dashboard' && !isAdmin) return null;

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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <SignOutLink />
                    </DropdownMenuItem>
                </SignedIn>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export default LinksDropdown;
