export type PillarType = 'blog' | 'learning' | 'travel'

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type BudgetLevel = '$' | '$$' | '$$$' | '$$$$'

export interface LearningMetadata {
  difficulty: DifficultyLevel
  moduleNumber: number
  totalModules: number
  prerequisites: string[]
  takeaways: string[]
  estimatedHours: string
}

export interface TravelMetadata {
  location: string
  bestSeason: string
  budgetLevel: BudgetLevel
  duration: string
  highlights: string[]
  climate?: string
}

export type PostMetadata = (LearningMetadata | TravelMetadata | Record<string, unknown>) & {
  difficulty?: DifficultyLevel
  moduleNumber?: number
  totalModules?: number
  prerequisites?: string[]
  takeaways?: string[]
  estimatedHours?: string
  location?: string
  bestSeason?: string
  budgetLevel?: BudgetLevel
  duration?: string
  highlights?: string[]
}

export interface Author {
  name: string
  avatar: string
  role: string
  bio?: string
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  pillar: PillarType
  tags: string[]
  author: Author
  publishedAt: string
  readTime: string
  views: number
  coverImage: string
  metadata?: PostMetadata
  featured?: boolean
}

export interface PostFilterParams {
  pillar?: PillarType | 'all'
  tag?: string
  search?: string
  page?: number
  limit?: number
  difficulty?: DifficultyLevel
}

export interface PaginatedPosts {
  posts: Post[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role: 'user' | 'admin'
  bio?: string
  createdAt?: string
}
