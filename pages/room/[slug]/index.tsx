import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import ProviderMain from '@/redux/provider';
import store from '@/redux/store';
import ConvertTime from '@/utils/convertTime';
import { Cancel01Icon, Delete01Icon, MoreVerticalCircle01Icon, TelegramIcon } from 'hugeicons-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// import io from 'socket.io-client';
import Swal from 'sweetalert2';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, remove } from "firebase/database";

// const socket = io('http://localhost:3600', {
//     withCredentials: true,
//     reconnection: true,
//     reconnectionAttempts: 5
// });

const Room = () => {
    const [content, setContent] = useState<string>('');
    const [messages, setMessages] = useState<any>([]);
    const [chatId, setChatId] = useState<string>('');
    const [menu, setMenu] = useState<boolean>(false);

    const params = useParams(); // Ambil slug dari URL
    const slug = params?.slug as string | undefined; // Type assertion dengan pengecekan
    const decodedSlug = slug ? decodeURIComponent(slug) : "";

    console.log('decode:', decodedSlug)

    const auth = useSelector((state: any) => state.auth.auth)
    const roomDetail = useSelector((state: any) => state.room.roomDetail)
    console.log('auth:', auth)
    console.log('roomDetail:', roomDetail)
    console.log('messages1:', messages)

    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAxRZpGt9LzRYRtQB-pFmpY6ubZ-KgearM",
        databaseURL: "https://chater-3aa14-default-rtdb.asia-southeast1.firebasedatabase.app",
        authDomain: "chater-3aa14.firebaseapp.com",
        projectId: "chater-3aa14",
        storageBucket: "chater-3aa14.firebasestorage.app",
        messagingSenderId: "759599094950",
        appId: "1:759599094950:web:f67662da7cfffd015b6867",
        measurementId: "G-98V0C0DFTE"
    };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    useEffect(() => {
        console.log('id room:', roomDetail.idRoom)
        const messagesRef = ref(database, `messages/${roomDetail.idRoom}/contents`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data && decodedSlug) {
                const messageList = Object.values(data);
                setMessages(messageList);
                console.log('messageList:', messageList)
            } else {
                setMessages([])
            }
            console.log('data:', data)
        });

        return () => {
            unsubscribe();
        };
    }, [roomDetail.idRoom, decodedSlug]);

    const handleSendMessage = () => {
        if (!roomDetail || !content) return; // Pastikan roomID dan pesan tidak kosong
        const randomNum = Math.random().toString(36).substr(2, 5); // 5 karakter random

        // Referensi ke contents di roomID tertentu
        const contentsRef = ref(database, `messages/${roomDetail.idRoom}/contents`);
        // Tambahkan pesan baru ke contents dengan push
        push(contentsRef, {
            idMessage: randomNum,
            text: content,
            sender: auth.username,
            timestamps: Date.now()
        });
        setContent("");
    };

    const handleDeleteMessage = (id: string) => {
        Swal.fire({
            icon: 'question',
            title: "Hapus pesan ini?",
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batalkan',
            confirmButtonColor: 'red',
            customClass: {
                popup: "!rounded-[12px] !bg-white !w-[30rem] !py-[2rem] !overflow-hidden",
                icon: "!mt-0",
                title: "!pt-[5px] !text-size-md font-700",
                htmlContainer: "!pt-[5px] !pb-[1rem] !my-0",
            },
        }).then((result: any) => {
            if (result.isConfirmed) {
                if (!roomDetail || !id) return; // Pastikan roomDetail dan idMessage ada

                // Referensi ke contents di roomID tertentu
                const contentsRef = ref(database, `messages/${roomDetail.idRoom}/contents`);

                // Ambil semua data contents untuk mencari pesan yang sesuai
                onValue(contentsRef, (snapshot) => {
                    const contents = snapshot.val();
                    if (!contents) return; // Jika contents kosong, keluar

                    // Cari kunci Firebase (misalnya, "-N12345abcde") berdasarkan idMessage
                    const messageKey = Object.keys(contents).find((key) =>
                        contents[key].idMessage === id
                    );

                    if (messageKey) {
                        // Referensi ke pesan spesifik yang akan dihapus
                        const messageRef = ref(database, `messages/${roomDetail.idRoom}/contents/${messageKey}`);
                        // Hapus pesan
                        remove(messageRef)
                            .then(() => {
                                console.log(`Pesan dengan idMessage ${id} berhasil dihapus`);
                            })
                            .catch((error) => {
                                console.error("Gagal menghapus pesan:", error);
                            });
                    } else {
                        console.log(`Pesan dengan idMessage ${id} tidak ditemukan`);
                    }
                }, { onlyOnce: true }); // Hanya ambil sekali untuk operasi ini
            }
        });
    };

    console.log('messages2:', messages)

    return (
        <div className='w-screen h-screen flex bg-gray-100'>
            <Sidebar />

            <div className='w-[70vw] h-full'>
                <Navbar auth={auth} />

                <div className='relative w-full h-[90vh]'>
                    <div className='w-full h-[88%] bg-slate-100 p-10 overflow-auto'>
                        {
                            roomDetail.idRoom && messages.length > 0 ?
                                messages?.map((data: any, index: number) => (
                                    <div key={index} className={`relative ${data?.sender === auth?.username ? 'ml-auto' : ''} py-2 pl-4 pr-3 rounded-[4px] mb-4 w-max bg-white shadow-md border border-slate-200`}>
                                        {
                                            data._id === chatId && menu ? (
                                                <div className='absolute top-0 left-0 bg-white rounded-md overflow-hidden w-full h-full z-[444]'>
                                                    <div onClick={() => handleDeleteMessage(data.idMessage)} className='cursor-pointer text-[12px] py-2 px-4 active:scale-[0.99] duration-100 hover:brightness-95 w-full bg-red-500 text-white h-1/2 flex items-center justify-start gap-4 p-1'>
                                                        <Delete01Icon className='text-white' width={20} height={20} />
                                                        <p className='text-white'>Hapus pesan</p>
                                                    </div>
                                                    <div onClick={() => setMenu(false)} className='cursor-pointer text-[12px] py-2 px-4 active:scale-[0.99] duration-100 hover:brightness-95 w-full bg-slate-100 text-black h-1/2 flex items-center justify-start gap-4 p-1'>
                                                        <Cancel01Icon className='text-black' width={20} height={20} />
                                                        <p className='text-black'>Batalkan</p>
                                                    </div>
                                                </div>
                                            ) :
                                                <></>
                                        }
                                        <div className='relative flex items-center pb-2'>
                                            <small className='text-slate-500 w-full'>{data.sender}</small>
                                            {
                                                data.sender === auth.username ? (
                                                    <MoreVerticalCircle01Icon onClick={() => { setChatId(data._id); setMenu(true) }} className='text-black ml-auto' />
                                                ) :
                                                    <></>
                                            }
                                        </div>
                                        <p className='text-black'>{data.text}</p>
                                        <small className='text-slate-500 mt-2'>{ConvertTime(data.timestamps)}</small>
                                    </div>
                                ))
                                : null
                        }
                    </div>
                    <div className='w-full h-[12%] bg-white shadow-md px-6 flex justify-between items-center'>
                        <form onSubmit={() => handleSendMessage()}>
                            <input name='content' value={content} className='w-[96%] h-[70%] rounded-full bg-slate-200 text-[14px] outline-0 p-4 text-black' placeholder='Kirim pesan sekarang...' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}></input>
                        </form>
                        <TelegramIcon onClick={() => handleSendMessage()} className='active:scale-[0.99] hover:brightness-95 text-black' />
                    </div>
                </div>
            </div>
        </div >
    )
}

export default () => (
    <ProviderMain store={store}>
        <Room />
    </ProviderMain>
);