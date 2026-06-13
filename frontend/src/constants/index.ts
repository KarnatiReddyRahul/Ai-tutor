import type {
  Topic,
  FeatureCard,
  StatCard,
  Question,
} from '@/types';

export const APP_NAME = 'AI Reverse Tutor';

export const APP_TAGLINE = 'Where AI Interviews You';

export const APP_DESCRIPTION =
  'An intelligent platform that interviews students, detects knowledge gaps, and creates personalized learning roadmaps powered by AI.';

export const TOPICS: Topic[] = [
  {
    id: 'python-basics',
    name: 'Python Basics',
    category: 'Programming',
    description: 'Variables, data types, control flow, and basic syntax',
    icon: '🐍',
  },
  {
    id: 'functions',
    name: 'Functions',
    category: 'Programming',
    description: 'Function definition, parameters, return values, and scope',
    icon: '🔧',
  },
  {
    id: 'oop',
    name: 'Object-Oriented Programming',
    category: 'Programming',
    description: 'Classes, objects, inheritance, polymorphism, and encapsulation',
    icon: '🏗️',
  },
  {
    id: 'decorators',
    name: 'Decorators',
    category: 'Programming',
    description: 'Function decorators, class decorators, and metaprogramming',
    icon: '🎨',
  },
  {
    id: 'data-structures',
    name: 'Data Structures',
    category: 'Computer Science',
    description: 'Arrays, linked lists, trees, graphs, and hash tables',
    icon: '📊',
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    category: 'Computer Science',
    description: 'Sorting, searching, dynamic programming, and graph algorithms',
    icon: '⚙️',
  },
  {
    id: 'react-basics',
    name: 'React Basics',
    category: 'Web Development',
    description: 'Components, props, state, and lifecycle methods',
    icon: '⚛️',
  },
  {
    id: 'sql',
    name: 'SQL & Databases',
    category: 'Data',
    description: 'Queries, joins, normalization, and database design',
    icon: '🗄️',
  },
  {
    id: 'javascript',
    name: 'JavaScript Fundamentals',
    category: 'Programming',
    description: 'ES6, async/await, closures, and event handling',
    icon: '📜',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Programming',
    description: 'Type system, interfaces, generics, and advanced types',
    icon: '💙',
  },
  {
    id: 'git',
    name: 'Git & Version Control',
    category: 'DevOps',
    description: 'Branching, commits, merge strategies, and collaboration',
    icon: '🔀',
  },
  {
    id: 'rest-api',
    name: 'REST APIs',
    category: 'Web Development',
    description: 'HTTP methods, status codes, authentication, and design patterns',
    icon: '🌐',
  },
  {
    id: 'html-css',
    name: 'HTML & CSS',
    category: 'Web Development',
    description: 'Semantic HTML, flexbox, grid, and responsive design',
    icon: '🎨',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend',
    description: 'Express, middleware, streams, and event emitters',
    icon: '🟢',
  },
  {
    id: 'mongodb',
    name: 'MongoDB & NoSQL',
    category: 'Data',
    description: 'Document models, aggregation pipelines, and indexing',
    icon: '🍃',
  },
  {
    id: 'docker',
    name: 'Docker & Containerization',
    category: 'DevOps',
    description: 'Images, containers, volumes, and Docker Compose',
    icon: '🐳',
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes Basics',
    category: 'DevOps',
    description: 'Pods, services, deployments, and orchestration',
    icon: '☸️',
  },
  {
    id: 'aws',
    name: 'AWS Cloud Services',
    category: 'Cloud',
    description: 'EC2, S3, Lambda, RDS, and core AWS concepts',
    icon: '☁️',
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    category: 'Web Development',
    description: 'Queries, mutations, subscriptions, and schema design',
    icon: '✨',
  },
  {
    id: 'testing',
    name: 'Testing & QA',
    category: 'Software Engineering',
    description: 'Unit testing, integration testing, and test automation',
    icon: '✅',
  },
  {
    id: 'design-patterns',
    name: 'Design Patterns',
    category: 'Software Engineering',
    description: 'Creational, structural, and behavioral patterns',
    icon: '🏛️',
  },
  {
    id: 'microservices',
    name: 'Microservices Architecture',
    category: 'Software Engineering',
    description: 'Service design, communication, and scalability',
    icon: '🔗',
  },
  {
    id: 'security',
    name: 'Web Security',
    category: 'Security',
    description: 'Authentication, encryption, OWASP, and best practices',
    icon: '🔒',
  },
  {
    id: 'performance',
    name: 'Performance Optimization',
    category: 'Software Engineering',
    description: 'Caching, profiling, optimization techniques, and best practices',
    icon: '⚡',
  },
  {
    id: 'agile',
    name: 'Agile & Scrum',
    category: 'Management',
    description: 'Sprints, ceremonies, user stories, and team practices',
    icon: '📋',
  },
];

export const FEATURES: FeatureCard[] = [
  {
    title: 'AI Interviews You',
    description: 'Our AI conducts interactive interviews to assess your understanding of any topic.',
    icon: '🤖',
  },
  {
    title: 'Knowledge Gap Detection',
    description: 'AI identifies exactly where your understanding is weak or missing.',
    icon: '🔍',
  },
  {
    title: 'Personalized Roadmaps',
    description: 'Get a custom learning plan tailored to fill your knowledge gaps.',
    icon: '🗺️',
  },
  {
    title: 'Multilingual Learning',
    description: 'Learn in English, Telugu, or Hindi with full multilingual support.',
    icon: '🌐',
  },
];

export const STATS: StatCard[] = [
  {
    label: 'Active Learners',
    value: '10,000+',
    change: '+12% this month',
    icon: '👥',
  },
  {
    label: 'Assessments Completed',
    value: '50,000+',
    change: '+8% this week',
    icon: '✅',
  },
  {
    label: 'Topics Available',
    value: '25+',
    change: 'Growing daily',
    icon: '📚',
  },
  {
    label: 'Avg. Score Improvement',
    value: '42%',
    change: 'After first roadmap',
    icon: '📈',
  },
];

export const MOCK_QUESTIONS: Question[] = [
  // Python Basics
  {
    id: 'q1',
    text: 'What is a variable in Python and how do you assign a value to it?',
    topicId: 'python-basics',
    difficulty: 'beginner',
    hints: ['Think about containers that store data', 'Use the = operator'],
  },
  {
    id: 'q2',
    text: 'Explain the difference between a list and a tuple in Python.',
    topicId: 'python-basics',
    difficulty: 'beginner',
    hints: ['One is mutable, the other is immutable', 'Syntax uses different brackets'],
  },
  {
    id: 'q3',
    text: 'What are dictionaries in Python and how do you access their values?',
    topicId: 'python-basics',
    difficulty: 'intermediate',
    hints: ['Key-value pairs', 'Uses curly braces and square brackets'],
  },
  // Functions
  {
    id: 'q4',
    text: 'What is a closure in Python?',
    topicId: 'functions',
    difficulty: 'intermediate',
    hints: ['Nested function', 'Remembers enclosing scope'],
  },
  {
    id: 'q5',
    text: 'What are *args and **kwargs in Python functions?',
    topicId: 'functions',
    difficulty: 'intermediate',
    hints: ['Variable-length arguments', 'Asterisk unpacking'],
  },
  {
    id: 'q6',
    text: 'Explain the difference between positional and keyword arguments.',
    topicId: 'functions',
    difficulty: 'beginner',
    hints: ['Order matters vs named parameters', 'Default values'],
  },
  // OOP
  {
    id: 'q7',
    text: 'Explain the concept of inheritance in OOP.',
    topicId: 'oop',
    difficulty: 'intermediate',
    hints: ['Parent-child relationship', 'Code reuse mechanism'],
  },
  {
    id: 'q8',
    text: 'How does the `self` parameter work in Python classes?',
    topicId: 'oop',
    difficulty: 'beginner',
    hints: ['Refers to the instance', 'First parameter of instance methods'],
  },
  {
    id: 'q9',
    text: 'What is polymorphism and how is it used in OOP?',
    topicId: 'oop',
    difficulty: 'advanced',
    hints: ['Many forms', 'Method overriding'],
  },
  // Decorators
  {
    id: 'q10',
    text: 'What is a decorator in Python and how does it work?',
    topicId: 'decorators',
    difficulty: 'advanced',
    hints: ['It wraps another function', 'Uses the @ syntax'],
  },
  {
    id: 'q11',
    text: 'Explain the difference between @staticmethod and @classmethod decorators.',
    topicId: 'decorators',
    difficulty: 'advanced',
    hints: ['First parameter differs', 'One receives cls, the other receives nothing'],
  },
  // Data Structures
  {
    id: 'q12',
    text: 'What is the time complexity of accessing an element in a hash table?',
    topicId: 'data-structures',
    difficulty: 'intermediate',
    hints: ['Average case is constant', 'Think about direct access'],
  },
  {
    id: 'q13',
    text: 'Explain the difference between arrays and linked lists.',
    topicId: 'data-structures',
    difficulty: 'intermediate',
    hints: ['Memory allocation', 'Access vs insertion'],
  },
  // Algorithms
  {
    id: 'q14',
    text: 'What is the difference between merge sort and quick sort?',
    topicId: 'algorithms',
    difficulty: 'intermediate',
    hints: ['Time complexity in worst case', 'In-place vs stable'],
  },
  {
    id: 'q15',
    text: 'Explain what dynamic programming is with an example.',
    topicId: 'algorithms',
    difficulty: 'advanced',
    hints: ['Overlapping subproblems', 'Fibonacci sequence'],
  },
  // React
  {
    id: 'q16',
    text: 'What is the difference between state and props in React?',
    topicId: 'react-basics',
    difficulty: 'beginner',
    hints: ['Local vs external data', 'Immutability'],
  },
  {
    id: 'q17',
    text: 'Explain the React component lifecycle.',
    topicId: 'react-basics',
    difficulty: 'intermediate',
    hints: ['Mounting, updating, unmounting', 'Hooks vs class components'],
  },
  // SQL
  {
    id: 'q18',
    text: 'What is a JOIN in SQL and what types exist?',
    topicId: 'sql',
    difficulty: 'intermediate',
    hints: ['INNER, LEFT, RIGHT, FULL', 'Combining tables'],
  },
  {
    id: 'q19',
    text: 'Explain database normalization and its forms.',
    topicId: 'sql',
    difficulty: 'advanced',
    hints: ['1NF, 2NF, 3NF', 'Reducing redundancy'],
  },
  // JavaScript
  {
    id: 'q20',
    text: 'What is the event loop in JavaScript?',
    topicId: 'javascript',
    difficulty: 'advanced',
    hints: ['Call stack and callback queue', 'Asynchronous execution'],
  },
  {
    id: 'q21',
    text: 'Explain the difference between var, let, and const.',
    topicId: 'javascript',
    difficulty: 'intermediate',
    hints: ['Scope and hoisting', 'Block scope vs function scope'],
  },
  // TypeScript
  {
    id: 'q22',
    text: 'What are interfaces in TypeScript and how do they differ from types?',
    topicId: 'typescript',
    difficulty: 'intermediate',
    hints: ['Structural typing', 'Declaration merging'],
  },
  // Git
  {
    id: 'q23',
    text: 'Explain the difference between git merge and git rebase.',
    topicId: 'git',
    difficulty: 'intermediate',
    hints: ['History preservation', 'Commit linearity'],
  },
  // REST APIs
  {
    id: 'q24',
    text: 'What are RESTful principles and HTTP methods?',
    topicId: 'rest-api',
    difficulty: 'intermediate',
    hints: ['GET, POST, PUT, DELETE', 'Resource-oriented'],
  },
  // HTML & CSS
  {
    id: 'q25',
    text: 'Explain CSS flexbox and how it differs from CSS grid.',
    topicId: 'html-css',
    difficulty: 'intermediate',
    hints: ['One-dimensional vs two-dimensional', 'Layout methods'],
  },
  // Node.js
  {
    id: 'q26',
    text: 'What is middleware in Express.js and how does it work?',
    topicId: 'nodejs',
    difficulty: 'intermediate',
    hints: ['Request processing pipeline', 'next() function'],
  },
  // MongoDB
  {
    id: 'q27',
    text: 'What are collections and documents in MongoDB?',
    topicId: 'mongodb',
    difficulty: 'beginner',
    hints: ['NoSQL database', 'JSON-like structure'],
  },
  // Docker
  {
    id: 'q28',
    text: 'What is the difference between Docker images and containers?',
    topicId: 'docker',
    difficulty: 'intermediate',
    hints: ['Blueprint vs running instance', 'Layers and snapshots'],
  },
  // Kubernetes
  {
    id: 'q29',
    text: 'What is a Pod in Kubernetes and what can it contain?',
    topicId: 'kubernetes',
    difficulty: 'beginner',
    hints: ['Smallest deployable unit', 'Container wrapper'],
  },
  // AWS
  {
    id: 'q30',
    text: 'Explain the difference between EC2, S3, and Lambda in AWS.',
    topicId: 'aws',
    difficulty: 'intermediate',
    hints: ['Compute, storage, serverless', 'Different use cases'],
  },
  // GraphQL
  {
    id: 'q31',
    text: 'What are the main differences between REST and GraphQL?',
    topicId: 'graphql',
    difficulty: 'intermediate',
    hints: ['Overfetching vs exact data', 'Query language'],
  },
  // Testing
  {
    id: 'q32',
    text: 'What is the difference between unit tests and integration tests?',
    topicId: 'testing',
    difficulty: 'intermediate',
    hints: ['Component level vs system level', 'Isolation and dependencies'],
  },
  // Design Patterns
  {
    id: 'q33',
    text: 'Explain the Singleton design pattern and when to use it.',
    topicId: 'design-patterns',
    difficulty: 'intermediate',
    hints: ['Single instance', 'Global access point'],
  },
  // Microservices
  {
    id: 'q34',
    text: 'What are the challenges of microservices architecture?',
    topicId: 'microservices',
    difficulty: 'advanced',
    hints: ['Distribution, consistency, complexity', 'Communication overhead'],
  },
  // Security
  {
    id: 'q35',
    text: 'What is the difference between authentication and authorization?',
    topicId: 'security',
    difficulty: 'beginner',
    hints: ['Who you are vs what you can do', 'Login vs permissions'],
  },
  // Performance
  {
    id: 'q36',
    text: 'What are common techniques for optimizing application performance?',
    topicId: 'performance',
    difficulty: 'intermediate',
    hints: ['Caching, indexing, lazy loading', 'Profiling'],
  },
  // Agile
  {
    id: 'q37',
    text: 'What is a sprint in Agile methodology?',
    topicId: 'agile',
    difficulty: 'beginner',
    hints: ['Time-boxed iteration', 'Usually 1-4 weeks'],
  },
];

export const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-500' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-500' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-500' },
] as const;

export const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/topics', label: 'Topics' },
  { path: '/history', label: 'History' },
  { path: '/settings', label: 'Settings' },
] as const;
