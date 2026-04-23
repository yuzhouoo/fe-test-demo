'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { DndContext, DragEndEvent, DragMoveEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable'
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, over } = useSortable({
    id,
  })

  const isOver = over?.id === id

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
      className={`cursor-grab active:cursor-grabbing w-full h-full ${isDragging ? 'ring-2 ring-green-500' : ''} ${!isDragging && isOver ? 'ring-2 ring-red-500' : ''}`}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const [panels, setPanels] = useState<Panel[]>(initialPanels)
  const [windowWidth, setWindowWidth] = useState(1200)
  const [isAtTail, setIsAtTail] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const panelContainerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (panelContainerRef.current) {
      const container = panelContainerRef.current
      const containerRect = container.getBoundingClientRect()
      const activeElement = event.active

      if (activeElement && activeElement.rect && activeElement.rect.current) {
        const activeRect = activeElement.rect.current.translated
        if (activeRect) {
          if (containerRect.width >= 1200) {
            const isOutOfBounds = activeRect.left < containerRect.left || activeRect.right > containerRect.right
            setIsAtTail(isOutOfBounds)
          } else {
            setIsAtTail(false)
          }
        }
      }
    }
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && over) {
      const panelsIds = panels.map((p) => p.id)
      const overIndex = panelsIds.indexOf(String(over.id))

      if (overIndex === 0 || overIndex === panelsIds.length - 1) {
        if (panelContainerRef.current) {
          panelContainerRef.current.scrollLeft = overIndex === 0 ? 0 : panelContainerRef.current.scrollWidth
        }
      }

      setPanels((items) => {
        const activeIndex = items.findIndex((item) => item.id === active.id)
        const newOverIndex = items.findIndex((item) => item.id === String(over.id))

        if (newOverIndex === -1) return items

        const newItems = Array.from(items)
        const [movedItem] = newItems.splice(activeIndex, 1)
        newItems.splice(newOverIndex, 0, movedItem)

        return newItems
      })
    }
    setIsAtTail(false)
  }, [panels])

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

  if (!isMounted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-[80px] bg-white border-r border-gray-200"></div>
        <div className="flex-1"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧固定导航 */}
      <div className="w-[80px] bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-8 flex-shrink-0">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => togglePanel(panel.id)}
            className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-colors w-full ${panel.isOpen
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            aria-label={`${panel.isOpen ? '关闭' : '打开'}${panel.title}面板`}
          >
            {panel.icon}
            <span className="text-xs font-medium">{panel.title}</span>
          </button>
        ))}
      </div>

      {/* 右侧面板区域 */}
      <div className="flex-1 overflow-x-auto" ref={panelContainerRef}>
        <div className="w-full h-full p-4 min-w-[1200px]">
          <div className="h-full flex items-stretch">
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              onDragMove={handleDragMove}
              autoScroll={!isAtTail}
            >
              <SortableContext items={panels.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
                <div className="panel-container flex space-x-4 pb-4 w-full">
                  {panels.filter((p) => p.isOpen).map((panel) => (
                    <SortableItem key={panel.id} id={panel.id}>
                      <div className="w-full h-full min-w-96 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
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
    </div>
  )
}
