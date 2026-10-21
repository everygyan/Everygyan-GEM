export type PillarType = 'blog' | 'learning' | 'travel'

export interface Article {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  pillar: PillarType
  authorId: string
  createdAt: string
  updatedAt: string
  published: boolean
  featuredImage?: string
  tags: string[]
}

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role: 'admin' | 'editor' | 'reader'
}
