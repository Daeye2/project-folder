// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
  
    if (hamburger) {
      hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });
    }
  
    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  
    // FAQ accordions
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      
      question.addEventListener('click', () => {
        // Close all other FAQ items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle the clicked item
        item.classList.toggle('active');
      });
    });
  
    // Contact form validation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', validateForm);
    }
  
    function validateForm(event) {
      let valid = true;
      
      // Clear previous error messages
      document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
      });
      
      // Validate name
      const name = document.getElementById('name');
      if (name.value.trim() === '') {
        document.getElementById('nameError').textContent = 'Name is required';
        valid = false;
      }
      
      // Validate email
      const email = document.getElementById('email');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        valid = false;
      }
      
      // Validate subject
      const subject = document.getElementById('subject');
      if (subject.value.trim() === '') {
        document.getElementById('subjectError').textContent = 'Subject is required';
        valid = false;
      }
      
      // Validate message
      const message = document.getElementById('message');
      if (message.value.trim() === '') {
        document.getElementById('messageError').textContent = 'Message is required';
        valid = false;
      } else if (message.value.trim().length < 10) {
        document.getElementById('messageError').textContent = 'Message must be at least 10 characters';
        valid = false;
      }
      
      // Prevent form submission if validation fails
      if (!valid) {
        event.preventDefault();
      }
    }
  });