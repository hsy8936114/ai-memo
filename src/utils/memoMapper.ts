import { Memo, MemoFormData } from '@/types/memo'

// memos 테이블 행 (snake_case)
export interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  summary: string | null
  created_at: string
  updated_at: string
}

export const rowToMemo = (row: MemoRow): Memo => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category,
  tags: row.tags ?? [],
  summary: row.summary,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const formDataToRow = (formData: MemoFormData) => ({
  title: formData.title,
  content: formData.content,
  category: formData.category,
  tags: formData.tags,
})
