export interface LeaderboardEntry {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  score: number;
  quizzesTaken: number;
  rank?: number;
  avatarUrl?: string;
}

export interface LeaderboardStats {
  topScore: number;
  totalParticipants: number;
  mostQuizzesTaken: number;
  averageScore?: number;
}