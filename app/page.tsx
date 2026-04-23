'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MapIcon, MusicalNoteIcon, ChatBubbleBottomCenterIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Panel {
  id: string
  title: string
  icon: React.ReactNode
  content: string
  isOpen: boolean
}

const initialPanels: Panel[] = [
  {
    id: 'map',
    title: '地图',
    icon: <MapIcon className="w-6 h-6" />,
    content: '地图面板内容',
    isOpen: true,
  },
  {
    id: 'music',
    title: '音乐',
    icon: <MusicalNoteIcon className="w-6 h-6" />,
    content: '音乐面板内容',
    isOpen: true,
  },
  {
    id: 'chat',
    title: '聊天',
    icon: <ChatBubbleBottomCenterIcon className="w-6 h-6" />,
    content: '聊天面板内容',
    isOpen: true,
  },
]

const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  )
}

export default function Home() {
  const [panels, setPanels] = useState<Panel[]>(initialPanels)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setPanels((items) => {
        const activeIndex = items.findIndex((item) => item.id === active.id)
        const overIndex = items.findIndex((item) => item.id === over?.id)

        if (overIndex === -1) return items

        const newItems = Array.from(items)
        const [movedItem] = newItems.splice(activeIndex, 1)
        newItems.splice(overIndex, 0, movedItem)

        return newItems
      })
    }
  }, [])

  const togglePanel = (id: string) => {
    setPanels((prev) => prev.map((panel) =>
      panel.id === id ? { ...panel, isOpen: !panel.isOpen } : panel
    ))
  }

  const closePanel = (id: string) => {
    setPanels((prev) => prev.map((panel) =>
      panel.id === id ? { ...panel, isOpen: false } : panel
    ))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧固定导航 */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-8">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => togglePanel(panel.id)}
            className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-colors w-full ${panel.isOpen
              ? 'bg-blue-50 text-primary'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
            aria-label={`${panel.isOpen ? '关闭' : '打开'}${panel.title}面板`}
          >
            {panel.icon}
            <span className="text-xs font-medium">{panel.title}</span>
          </button>
        ))}
      </div>

      {/* 右侧面板区域 */}
      <div className="flex-1 flex flex-col">

        <div className="flex-1 p-4 flex items-stretch">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={panels.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="panel-container flex space-x-4 pb-4 flex-1">
                {panels.filter((p) => p.isOpen).map((panel) => (
                  <SortableItem key={panel.id} id={panel.id}>
                    <div className="flex-1 min-w-80 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
                      <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          {panel.icon}
                          <h3 className="font-medium text-gray-700">{panel.title}</h3>
                        </div>
                        <button
                          onClick={() => closePanel(panel.id)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                          aria-label="关闭面板"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex-1 p-4 flex flex-col">
                        <p className="text-gray-600">{panel.content}</p>
                        <div className="mt-4 text-sm text-gray-500 flex-1 flex items-center justify-center">
                          这是{panel.title}面板的内容区域
                        </div>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  )
}
