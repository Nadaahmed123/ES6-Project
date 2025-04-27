document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading');
  const loginScreen = document.querySelector('.login');

  setTimeout(() => {
    loadingScreen.style.display = 'none';
    loginScreen.style.display = 'grid';
  }, 2000);

  if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.replace('home.html');
    return;
  }

  const signUpLink = document.getElementById('sign-up');
  const signInLink = document.getElementById('sign-in');
  const loginForm = document.getElementById('login-in');
  const signupForm = document.getElementById('login-up');
  
  signUpLink.addEventListener('click', e => {
    e.preventDefault();
    loginForm.classList.remove('block');
    loginForm.classList.add('none');
    signupForm.classList.remove('none');
    signupForm.classList.add('block');
    clearErrors();
  });

  signInLink.addEventListener('click', e => {
    e.preventDefault();
    signupForm.classList.remove('block');
    signupForm.classList.add('none');
    loginForm.classList.remove('none');
    loginForm.classList.add('block');
    clearErrors();
  });

  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    const successMsg = document.getElementById('signup-success');
    if (successMsg) successMsg.style.display = 'none';
  }

  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  }

  function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'none';
  }

  function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  }


  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePassword(password) {
   const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
  }

  function validateUsername(username) {
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
  }

  
  function loadUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  document.getElementById('signup-username')?.addEventListener('input', function() {
    if (!validateUsername(this.value.trim())) {
      showError('signup-username-error', 'Username must be 3-20 characters (letters, numbers, underscores)');
    } else {
      hideError('signup-username-error');
    }
  });

  document.getElementById('signup-email')?.addEventListener('input', function() {
    if (!validateEmail(this.value.trim())) {
      showError('signup-email-error', 'Please enter a valid email address');
    } else {
      hideError('signup-email-error');
    }
  });

  document.getElementById('signup-password')?.addEventListener('input', function() {
    if (!validatePassword(this.value)) {
      showError('signup-password-error', 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
    } else {
      hideError('signup-password-error');
    }
  });

  document.getElementById('signup-password-confirm')?.addEventListener('input', function() {
    const password = document.getElementById('signup-password').value;
    if (this.value !== password) {
      showError('signup-confirm-error', 'Passwords do not match');
    } else {
      hideError('signup-confirm-error');
    }
  });

  document.getElementById('signup-btn')?.addEventListener('click', e => {
    e.preventDefault();
    clearErrors();
    
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const pass = document.getElementById('signup-password').value;
    const pass2 = document.getElementById('signup-password-confirm').value;

    let isValid = true;
    
    if (!username) {
      showError('signup-username-error', 'Username is required');
      isValid = false;
    } else if (!validateUsername(username)) {
      showError('signup-username-error', 'Invalid username format');
      isValid = false;
    }
    
    if (!email) {
      showError('signup-email-error', 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      showError('signup-email-error', 'Invalid email format');
      isValid = false;
    }
    
    if (!pass) {
      showError('signup-password-error', 'Password is required');
      isValid = false;
    } else if (!validatePassword(pass)) {
      showError('signup-password-error', 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
      isValid = false;
    }
    
    if (!pass2) {
      showError('signup-confirm-error', 'Please confirm your password');
      isValid = false;
    } else if (pass !== pass2) {
      showError('signup-confirm-error', 'Passwords do not match');
      isValid = false;
    }
    
    if (!isValid) return;

    const users = loadUsers();
    
    const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    const emailExists = users.some(u => u.email === email);
    
    if (usernameExists) {
      showError('signup-username-error', 'Username already taken');
      return;
    }
    
    if (emailExists) {
      showError('signup-email-error', 'Email already registered');
      return;
    }

    users.push({ 
      username, 
      email, 
      password: pass 
    });
    
    saveUsers(users);
    showSuccess('signup-success', 'Account created successfully! Redirecting...');
    
    setTimeout(() => {
      localStorage.setItem('currentUser', JSON.stringify({ username, email }));
      localStorage.setItem('isLoggedIn', 'true');
      window.location.replace('home.html');
    }, 1500);
  });

  document.getElementById('login-btn')?.addEventListener('click', e => {
    e.preventDefault();
    clearErrors();
    
    const emailOrUser = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;
    let isValid = true;

    if (!emailOrUser) {
      showError('login-username-error', 'Username or email is required');
      isValid = false;
    }
    
    if (!pass) {
      showError('login-password-error', 'Password is required');
      isValid = false;
    }
    
    if (!isValid) return;

    const users = loadUsers();
    
    const found = users.find(u =>
      (u.email === emailOrUser.toLowerCase() || u.username.toLowerCase() === emailOrUser.toLowerCase()) &&
      u.password === pass 
    );
    
    if (!found) {
      showError('login-error', 'Invalid , user not found or password incorrect');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(found));
    localStorage.setItem('isLoggedIn', 'true');
    window.location.replace('home.html');
  });
});