import { LuUser } from 'react-icons/lu';
import { currentUser } from '@clerk/nextjs/server';
//import { currentUser, auth } from '@clerk/nextjs/server';

const UserIcon = async () => {
    //const { userId } = auth(); // if we just want the id
    const user = await currentUser();

    const profileImage = user?.imageUrl;

    if (profileImage) {
        return (
            <img
                src={profileImage}
                className='w-6 h-6 rounded-full object-cover'
            />
        );
    }

    return <LuUser className='w-6 h-6 bg-primary rounded-full text-white' />;
};
export default UserIcon;
