import { Home } from 'lucide-react'
import Link from 'next/link'
import { LuBotOff } from 'react-icons/lu'
 
export default function NotFound() {
  return (
    <div className='w-full h-screen flex flex-col justify-center items-center gap-4'>
      <LuBotOff size={84} className='text-[#00cfb1]' />
      <h2 className='text-2xl font-bold'>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/" className='text-[#00cfb1]'>
      <Home className='inline mb-1 mr-2' />
        Go Home
      </Link>
    </div>
  )
}