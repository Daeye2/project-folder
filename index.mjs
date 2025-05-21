// Main server file for Online Learning Platform
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

let db;
async function initDatabase() {
  try {
    db = await open({
      filename: path.join(__dirname, 'database.db'),
      driver: sqlite3.Database
    });

    console.log('Connected to the database');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        duration TEXT NOT NULL,
        instructor_id INTEGER,
        FOREIGN KEY (instructor_id) REFERENCES instructors(id)
      );
      
      CREATE TABLE IF NOT EXISTS instructors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bio TEXT NOT NULL,
        subjects TEXT NOT NULL,
        email TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        course_id INTEGER,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      );
      
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const coursesCount = await db.get('SELECT COUNT(*) as count FROM courses');
    if (coursesCount.count === 0) {
      await insertSampleData();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

async function insertSampleData() {
  try {
    await db.run(`
      INSERT INTO instructors (name, bio, subjects, email) 
      VALUES 
        ('Dr. Lena Martinez', 'Seasoned educator and developer with a focus on modern web ecosystems and scalable UI systems.', 'HTML/CSS, JavaScript, Front-End Architecture', 'lena.martinez@edunova.com'),
        ('Dr. Rajiv Patel', 'Database engineer with a background in distributed systems and cloud database technologies.', 'SQL, NoSQL, Cloud Databases', 'rajiv.patel@edunova.com'),
        ('Alison Reed', 'Human-centered designer with a decade of experience crafting digital experiences.', 'UX Strategy, Interaction Design, Prototyping', 'alison.reed@edunova.com'),
        ('Dr. Mateo Rossi', 'Machine learning researcher passionate about democratizing AI education and tools.', 'Machine Learning, AI Ethics, Data Analysis', 'mateo.rossi@edunova.com')
    `);

    await db.run(`
      INSERT INTO courses (name, description, duration, instructor_id) 
      VALUES 
        ('Modern Front-End Development', 'Dive into HTML, CSS Grid, Flexbox, and modular JavaScript.', '7 weeks', 1),
        ('Cloud-Based Database Systems', 'Explore relational and non-relational databases in cloud environments.', '9 weeks', 2),
        ('Designing for Humans', 'Learn UX strategy and tools to build delightful digital interfaces.', '6 weeks', 3),
        ('Practical Machine Learning', 'A hands-on guide to ML concepts and real-world implementations.', '11 weeks', 4),
        ('Asynchronous JavaScript and APIs', 'Master async patterns, promises, and integrating external APIs.', '5 weeks', 1)
    `);

    await db.run(`
      INSERT INTO sessions (title, description, date, time, course_id) 
      VALUES 
        ('CSS Grid Deep Dive', 'Interactive session focusing on responsive layouts with CSS Grid.', '2025-06-17', '13:00', 1),
        ('NoSQL vs SQL Showdown', 'Live comparison of NoSQL and SQL database models and use cases.', '2025-06-21', '11:30', 2),
        ('User Testing Live', 'Watch and discuss real-time UX testing scenarios.', '2025-06-26', '09:00', 3),
        ('Intro to Pandas and Scikit-learn', 'An overview of data wrangling and ML modeling in Python.', '2025-07-03', '15:00', 4),
        ('Building with Fetch API', 'Hands-on coding using the Fetch API and async patterns in JavaScript.', '2025-06-30', '17:00', 5)
    `);

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Routes
app.get('/', async (req, res) => {
  res.render('pages/index');
});

app.get('/courses', async (req, res) => {
  try {
    const courses = await db.all(`
      SELECT c.*, i.name as instructor_name 
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
    `);
    res.render('pages/courses', { courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Server error');
  }
});

app.get('/instructors', async (req, res) => {
  try {
    const instructors = await db.all('SELECT * FROM instructors');
    res.render('pages/instructors', { instructors });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).send('Server error');
  }
});

app.get('/sessions', async (req, res) => {
  try {
    const sessions = await db.all(`
      SELECT s.*, c.name as course_name 
      FROM sessions s
      JOIN courses c ON s.course_id = c.id
      ORDER BY s.date, s.time
    `);
    res.render('pages/sessions', { sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).send('Server error');
  }
});

app.get('/faq', (req, res) => {
  res.render('pages/faq');
});

app.get('/contact', (req, res) => {
  res.render('pages/contact');
});

app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    await db.run(
      'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );
    res.render('pages/contact', { 
      success: true, 
      message: 'Your message has been submitted successfully!' 
    });
  } catch (error) {
    console.error('Error saving contact form:', error);
    res.render('pages/contact', { 
      error: true, 
      message: 'There was an error submitting your form. Please try again.' 
    });
  }
});

initDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
