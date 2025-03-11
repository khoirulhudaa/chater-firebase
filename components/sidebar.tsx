import { roomDetail } from '@/redux/roomSlice';
import { AddCircleIcon } from 'hugeicons-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InitialsAvatar from 'react-initials-avatar';
import 'react-initials-avatar/lib/ReactInitialsAvatar.css';
import { useDispatch, useSelector } from 'react-redux';
import Modal from './modal';

const Sidebar = () => {

    const [isModal, setIsModal] = useState<boolean>(false)

    const Router = useRouter()
    const dispatch = useDispatch()
    const rooms = useSelector((state: any) => state.room.rooms)
    const dataArray = Object.keys(rooms).map((key) => ({
        id: key,
        ...rooms[key],
    }));

    const handleDetailRoom = (data: any) => {
        dispatch(roomDetail(data))
        Router.push(`/room/${data?.name}`)
    }

    return (
        <>
            {isModal && <Modal onClose={() => setIsModal(false)} />}

            <div className='w-[30vw] bg-white shadow-md border-r border-r-slate-300'>
                <div className='w-full h-[10vh] justify-between px-4 border-b border-slate-300 flex items-center'>
                    <h2 className='text-[22px] text-black font-bold'>Chater-web</h2>
                    <AddCircleIcon onClick={() => setIsModal(true)} className='text-black active:scale-[0.99] duration-100 curso-pointer hover:brightness-95' width={30} height={30} />
                </div>
                <div className='w-full h-[90vh] overflow-y-auto'>
                    {
                        dataArray?.length > 0 ?
                            dataArray?.map((data: any, index: number) => (
                                <div key={index} onClick={() => handleDetailRoom(data)} className='active:scale-[0.99] hover:brightness-[97%] duration-100 cursor-pointer bg-white w-full p-4 border-b gap-2 border-slate-300 flex items-center'>
                                    <div className='w-[10%]'>
                                        <InitialsAvatar name={data?.name} />
                                    </div>
                                    <h2 className='pl-4 text-black text-ellipsis whitespace-nowrap max-w-[90%] overflow-hidden'>{data?.name}</h2>
                                </div>
                            )) : (
                                <div className='w-full h-full mx-auto my-auto flex flex-col items-center justify-center'>
                                    <AddCircleIcon onClick={() => setIsModal(true)} className='mb-4 text-black active:scale-[0.99] duration-100 curso-pointer hover:brightness-95' width={40} height={40} />
                                    <p className='text-black'>Belum ada group!</p>
                                </div>
                            )
                    }
                </div>
            </div>
        </>
    )
}

export default Sidebar
