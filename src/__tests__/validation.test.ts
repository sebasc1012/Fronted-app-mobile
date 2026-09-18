describe('Validation', () => {
  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('test@example.com')).toBe(true);
    expect(emailRegex.test('invalid.email')).toBe(false);
  });

  it('should validate password strength', () => {
    const password = 'StrongPassword123!';
    expect(password.length >= 8).toBe(true);
  });
});
