// Pre-request Script for Environment Setup
const testUser = {
  email: 'test@example.com',
  password: 'Test123!',
  phone: '9876543210',
  jerseyNumber: 7,
  dateOfBirth: '1990-01-01'
};

pm.environment.set('testUserEmail', testUser.email);
pm.environment.set('testUserPassword', testUser.password); 