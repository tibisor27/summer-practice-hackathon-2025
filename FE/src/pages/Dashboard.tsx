

import { useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { PlusIcon } from '../icons/PlusIcon'
import { useContent } from '../hooks/useContent'
import { BACKEND_URL } from '../config'
import axios from 'axios'
import { ShareIcon } from '../icons/ShareIcon'
import { CreateContentModal } from '../components/CreateContentModal'

export function Dashboard() {
    const [modalOpen, setModalOpen] = useState(false)
    const contents = useContent();


    return <div>
        <div className='p-4 min-h-screen bg-slate-50'>
            <CreateContentModal open={modalOpen} onClose={() => {
                setModalOpen(false)
            }} />
            <div className='flex justify-end gap-4'>
                <Button onClick={() => { setModalOpen(true) }} startIcon={<PlusIcon size='lg' />} size='sm' variant='primary' text='Add Content' />

            </div>

            <div className="flex gap-4 flex-wrap">
                {contents && contents.length > 0 ? (
                    contents.map(({ type, link, title }) => (
                        <Card key={title} type={type} link={link} title={title} />
                    ))
                ) : (
                    <div>No content available</div>
                )}
            </div>
        </div>
    </div>
}

export default Dashboard
