/*
  # Create tables for user data

  1. New Tables
    - `user_budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `monthly_budget` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `category` (text)
      - `amount` (numeric)
      - `date` (date)
      - `created_at` (timestamp)
    
    - `user_habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `icon_name` (text)
      - `time` (time)
      - `streak` (integer)
      - `completed` (boolean)
      - `created_at` (timestamp)
    
    - `user_todos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `priority` (text)
      - `category` (text)
      - `due_date` (date)
      - `completed` (boolean)
      - `created_at` (timestamp)
    
    - `user_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `category` (text)
      - `deadline` (date)
      - `progress` (integer)
      - `completed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_budgets table
CREATE TABLE IF NOT EXISTS user_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  monthly_budget numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_expenses table
CREATE TABLE IF NOT EXISTS user_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_habits table
CREATE TABLE IF NOT EXISTS user_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  icon_name text NOT NULL,
  time time NOT NULL,
  streak integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user_todos table
CREATE TABLE IF NOT EXISTS user_todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  priority text NOT NULL,
  category text NOT NULL,
  due_date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  deadline date NOT NULL,
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for user_budgets
CREATE POLICY "Users can manage their own budgets"
  ON user_budgets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_expenses
CREATE POLICY "Users can manage their own expenses"
  ON user_expenses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_habits
CREATE POLICY "Users can manage their own habits"
  ON user_habits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_todos
CREATE POLICY "Users can manage their own todos"
  ON user_todos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_goals
CREATE POLICY "Users can manage their own goals"
  ON user_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);