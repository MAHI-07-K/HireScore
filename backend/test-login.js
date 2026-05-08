import axios from 'axios';

const testLogin = async () => {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    
    console.log('Testing login with credentials:');
    console.log('Roll Number: 24B11CS000');
    console.log('Password: 123456');
    console.log('API URL:', apiUrl);
    console.log('');

    const response = await axios.post(`${apiUrl}/auth/login`, {
      rollNumber: '24B11CS000',
      password: '123456'
    });

    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Backend might not be running.');
      console.error('Make sure to start the backend with: npm start');
    } else {
      console.error('Error:', error.message);
    }
  }
};

testLogin();
