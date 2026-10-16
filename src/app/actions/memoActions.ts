'use server'

import { v4 as uuidv4 } from 'uuid'
import { Memo, MemoFormData } from '@/types/memo'
import { createSupabaseServerClient } from '@/utils/supabase/server'
import { MemoRow, formDataToRow, rowToMemo } from '@/utils/memoMapper'
import { summarizeMemo } from '@/utils/summarize'

const TABLE = 'memos'

// 전체 메모 조회 (최신순)
export async function getMemos(): Promise<Memo[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch memos:', error)
    throw new Error('메모를 불러오지 못했습니다.')
  }
  return (data as MemoRow[]).map(rowToMemo)
}

// 메모 생성 + 요약 자동 생성
export async function createMemo(formData: MemoFormData): Promise<Memo> {
  const supabase = createSupabaseServerClient()
  const summary = await summarizeMemo(formData.title, formData.content)

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ id: uuidv4(), ...formDataToRow(formData), summary })
    .select('*')
    .single()

  if (error) {
    console.error('Failed to create memo:', error)
    throw new Error('메모를 저장하지 못했습니다.')
  }
  return rowToMemo(data as MemoRow)
}

// 메모 수정 + 요약 재생성
export async function updateMemo(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const supabase = createSupabaseServerClient()
  const summary = await summarizeMemo(formData.title, formData.content)

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...formDataToRow(formData),
      summary,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('Failed to update memo:', error)
    throw new Error('메모를 수정하지 못했습니다.')
  }
  return rowToMemo(data as MemoRow)
}

// 메모 삭제
export async function deleteMemo(id: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error) {
    console.error('Failed to delete memo:', error)
    throw new Error('메모를 삭제하지 못했습니다.')
  }
}

// 전체 메모 삭제
export async function clearAllMemos(): Promise<void> {
  const supabase = createSupabaseServerClient()
  // 조건 없는 delete는 막혀 있으므로 항상 참인 조건 사용
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) {
    console.error('Failed to clear memos:', error)
    throw new Error('메모를 모두 삭제하지 못했습니다.')
  }
}
