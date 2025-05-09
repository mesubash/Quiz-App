export interface LeaderboardEntry {
  userId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  score: number;
  quizzesTaken: number;
  maxPossibleScore: number;
  totalQuizzesTaken: number;
  rank: number;
  avatarUrl?: string;
}

export interface LeaderboardStats {
  topScore: number;
  totalParticipants: number;
  mostQuizzesTaken: number;
  averageScore?: number;
}
