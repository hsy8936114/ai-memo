import Anthropic from '@anthropic-ai/sdk'

const SUMMARY_MODEL = 'claude-haiku-5-5'

// 메모 본문을 한국어 2~3문장으로 요약. 키 누락·API 실패 시 null 반환 (저장은 막지 않음)
export const summarizeMemo = async (
  title: string,
  content: string
): Promise<string | null> => {
  if (!process.env.ANTHROPIC_API_KEY || !content.trim()) return null

  try {
    const client = new Anthropic()
    const response = await client.messages.create({
      model: SUMMARY_MODEL,
      max_tokens: 1024,
      output_config: { effort: 'low' },
      system:
        '당신은 메모 요약 도우미입니다. 주어진 메모를 한국어 2~3문장으로 간결하게 요약하세요. 요약문만 출력하고 머리말이나 마크다운은 쓰지 마세요.',
      messages: [
        { role: 'user', content: `제목: ${title}\n\n본문:\n${content}` },
      ],
    })

    const text = response.content
      .flatMap(block => (block.type === 'text' ? [block.text] : []))
      .join('')
      .trim()

    return text || null
  } catch (error) {
    console.error('Failed to summarize memo:', error)
    return null
  }
}
