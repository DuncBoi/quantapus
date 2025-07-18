'use client'
import { useAdminData } from '@/context/AdminDataContext'

export default function AdminSaveButton() {
  const { saveAll, isDirty } = useAdminData()
  return (
    <button
      onClick={saveAll}
      disabled={!isDirty}
      className={`
        ml-auto
        bg-green-600 text-white px-7 py-3 rounded-xl font-bold shadow
        hover:bg-green-700 transition
        ${!isDirty ? "opacity-40 pointer-events-none" : ""}
      `}
    >
      Save All Changes
    </button>
  )
}
