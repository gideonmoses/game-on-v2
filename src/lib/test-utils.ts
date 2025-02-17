export async function testRegistration(userData: {
  email: string;
  password: string;
  phone: string;
  jerseyNumber: number;
  dateOfBirth: string;
}) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
    success: response.ok,
    error: !response.ok ? data.error : null,
  };
} 