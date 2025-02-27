import { StatusIcon } from '@/constants'
import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

export const StatusBadge = ({status}:{status:Status}) => {

  return (
    <div 
    className={clsx('status-badge',{
        
        'bg-blue-600': 'pending',
        

    })}>
        <Image
            src={StatusIcon[status]}
            alt="doctor"
            width={24}
            height={24}
            className='h-fit w-3'
        />
        <p className={clsx("text-12-semibold capitalize",{
            
            "text-blue-500":  "pending",
            
        })}>
          {status}
        </p>
    </div>
  )
}

export default StatusBadge