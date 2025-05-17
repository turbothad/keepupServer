// tests/auth.test.js
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

// Base URL for the API
const API_URL = 'http://localhost:818/api'; // Adjust port if needed

// Test functions
const testJWTVerification = () => {
  // Create a test payload
  const testPayload = { id: 'test123', username: 'testuser' };

  // Sign a token with our secret
  const token = jwt.sign(testPayload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verification successful');
    console.log('Decoded payload:', decoded);
    return true;
  } catch (err) {
    console.error('❌ JWT token verification failed:', err.message);
    return false;
  }
};

// Test authentication middleware by making a protected API request
const testAuthMiddleware = async () => {
  try {
    // First try without a token - should fail
    try {
      await axios.get(`${API_URL}/posts`);
      console.error(
        '❌ Authentication test failed: Able to access protected route without token'
      );
      return false;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Authentication correctly blocked unauthorized request');
      } else {
        console.error(
          '❌ Unexpected error when testing without token:',
          err.message
        );
        return false;
      }
    }

    // Now register a test user to get a valid token
    let token;
    try {
      const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'Test123!',
      };

      const res = await axios.post(`${API_URL}/users/register`, testUser);
      token = res.data.token;
      console.log('✅ Successfully registered test user and got token');
    } catch (err) {
      console.error(
        '❌ Failed to register test user:',
        err.response.data || err.message
      );
      return false;
    }

    // Use the token to access a protected route
    try {
      await axios.get(`${API_URL}/posts`, {
        headers: { 'x-auth-token': token },
      });
      console.log('✅ Successfully accessed protected route with token');
      return true;
    } catch (err) {
      console.error(
        '❌ Failed to access protected route with valid token:',
        err.response.data || err.message
      );
      return false;
    }
  } catch (err) {
    console.error('❌ Auth middleware test failed with error:', err.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('🔑 JWT TOKEN TEST');
  console.log('-----------------');
  console.log(
    'JWT_SECRET from .env:',
    process.env.JWT_SECRET ? 'Found' : 'Not found'
  );

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in .env file');
    return;
  }

  // Test 1: Verify JWT token creation and verification
  const jwtVerificationPassed = testJWTVerification();
  console.log('-----------------');

  // Test 2: Test authentication middleware
  console.log('🔒 AUTHENTICATION MIDDLEWARE TEST');
  console.log('-----------------');
  const authMiddlewarePassed = await testAuthMiddleware();
  console.log('-----------------');

  // Summary
  console.log('📊 TEST RESULTS');
  console.log('-----------------');
  console.log(
    'JWT Verification:',
    jwtVerificationPassed ? '✅ PASSED' : '❌ FAILED'
  );
  console.log(
    'Auth Middleware:',
    authMiddlewarePassed ? '✅ PASSED' : '❌ FAILED'
  );
  console.log('-----------------');

  if (jwtVerificationPassed && authMiddlewarePassed) {
    console.log(
      '🎉 All tests passed! JWT authentication is working correctly.'
    );
  } else {
    console.log('❌ Some tests failed. Please check the issues above.');
  }
};

// Execute tests
runTests();
