-- Create schema for defaultdb database
-- Note: Database 'defaultdb' should already exist in Aiven

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    time_limit_minutes INT DEFAULT NULL,
    passing_score INT DEFAULT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD', 'UNASSIGNED') DEFAULT 'UNASSIGNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: questions
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM( 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'UNDEFINED') DEFAULT 'UNDEFINED' NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD', 'UNASSIGNED') DEFAULT 'UNASSIGNED',
    correct_answer VARCHAR(255) NOT NULL, 
    explanation TEXT,
    attempts INT DEFAULT 0,
    correct_selections INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Table: options
CREATE TABLE IF NOT EXISTS options (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Table: quiz_attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    score INT DEFAULT 0,
    max_possible_score INT DEFAULT 0,
    status ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED') DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Table: user_answers
CREATE TABLE IF NOT EXISTS user_answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Table: user_answer_options
CREATE TABLE IF NOT EXISTS user_answer_options (
    user_answer_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    PRIMARY KEY (user_answer_id, option_id),
    FOREIGN KEY (user_answer_id) REFERENCES user_answers(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE
);

-- View: leaderboard
DROP VIEW IF EXISTS leaderboard;
CREATE VIEW leaderboard AS
SELECT 
    u.id AS user_id,
    u.username,
    COUNT(qa.id) AS quizzes_taken,
    SUM(qa.score) AS total_score,
    AVG(qa.score) AS average_score,
    MAX(qa.score) AS highest_score
FROM 
    users u
LEFT JOIN 
    quiz_attempts qa ON u.id = qa.user_id
WHERE 
    qa.status = 'COMPLETED'
GROUP BY 
    u.id, u.username
ORDER BY 
    total_score DESC;

-- Table: quiz_attempts
CREATE TABLE quiz_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    score INT DEFAULT 0,
    max_possible_score INT DEFAULT 0,
    status ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED') DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Table: user_answers
CREATE TABLE user_answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Table: user_answer_options
CREATE TABLE user_answer_options (
    user_answer_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    PRIMARY KEY (user_answer_id, option_id),
    FOREIGN KEY (user_answer_id) REFERENCES user_answers(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE
);

-- View: leaderboard
DROP VIEW IF EXISTS leaderboard;
CREATE VIEW leaderboard AS
SELECT 
    u.id AS user_id,
    u.username,
    COUNT(qa.id) AS quizzes_taken,
    SUM(qa.score) AS total_score,
    AVG(qa.score) AS average_score,
    MAX(qa.score) AS highest_score
FROM 
    users u
LEFT JOIN 
    quiz_attempts qa ON u.id = qa.user_id
WHERE 
    qa.status = 'COMPLETED'
GROUP BY 
    u.id, u.username
ORDER BY 
    total_score DESC;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt_id ON user_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_is_correct ON user_answers(is_correct);

-- Insert a sample quiz
INSERT INTO quizzes (title, description, created_by, is_published)
VALUES ('Java Basics', 'Test your knowledge of Java fundamentals', 1, TRUE);

-- Insert sample questions
INSERT INTO questions (quiz_id, question_text, question_type, difficulty)
VALUES 
(1, 'Which of these is NOT a Java keyword?', 'MULTIPLE_CHOICE', 'EASY'),
(1, 'What is the size of int data type in Java?', 'MULTIPLE_CHOICE', 'MEDIUM'),
(1, 'Which of these are valid collection types in Java?', 'MULTIPLE_CHOICE', 'HARD');

-- Insert sample options
INSERT INTO options (question_id, option_text, is_correct)
VALUES
-- Question 1 options
(1, 'class', FALSE),
(1, 'interface', FALSE),
(1, 'extends', FALSE),
(1, 'string', TRUE),  -- correct
(1, 'implements', FALSE),

-- Question 2 options
(2, '16 bits', FALSE),
(2, '32 bits', TRUE),  -- correct
(2, '64 bits', FALSE),
(2, 'Depends on JVM implementation', FALSE),

-- Question 3 options
(3, 'ArrayList', TRUE),  -- correct
(3, 'LinkedList', TRUE),  -- correct
(3, 'Vector', TRUE),  -- correct
(3, 'Stack', FALSE),
(3, 'Queue', FALSE);


-- Remove user creation for cloud database
-- Note: Users are managed by Aiven cloud service