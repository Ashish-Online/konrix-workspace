import React from 'react'

function Album({image}: {image: string}) {
  return (
    <div className='w-full h-full flex items-center justify-center overflow-auto'>
      <img src={image} alt="" className='min-w-0 pointer-events-none'/>
    </div>
  )
}

export default Album