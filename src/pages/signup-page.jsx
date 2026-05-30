import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Check, X } from 'lucide-react';

export default function SignUpPage({ onNavigate, onSignUp }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const validatePassword = (pwd) => ({
    minLength: pwd.length >= 7,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*]/.test(pwd),
  });

  const passwordValidation = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordValidation).every((v) => v === true);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== '';
  const isFormValid =
    formData.name.trim() !== '' &&
    formData.email.includes('@') &&
    isPasswordValid &&
    passwordsMatch;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) onSignUp();
  };

  const requirements = [
    { key: 'minLength', label: 'At least 7 characters' },
    { key: 'hasUppercase', label: 'One uppercase letter (A-Z)' },
    { key: 'hasLowercase', label: 'One lowercase letter (a-z)' },
    { key: 'hasNumber', label: 'One number (0-9)' },
    { key: 'hasSpecial', label: 'One special character (!@#$%^&*)' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-card-foreground border border-border/30 rounded-2xl p-8 space-y-6">

          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/assets/main.png"
              alt="Shilpa3D Logo"
              className="w-[120px] h-auto object-contain"
            />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-serif text-background">Sign Up</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm text-muted font-medium font-mono">Name*</label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="!bg-secondary-foreground border-2 border-border h-14 px-5 rounded-xl mt-1 text-secondary placeholder:text-secondary/40 font-mono"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm text-muted font-medium font-mono">Email*</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="!bg-secondary-foreground border-2 border-border h-14 px-5 rounded-xl mt-1 text-secondary placeholder:text-secondary/40 font-mono"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-muted font-medium font-mono">Password*</label>
              <Input
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(formData.password === '')}
                className="!bg-secondary-foreground border-2 border-border h-14 px-5 rounded-xl mt-1 text-secondary placeholder:text-secondary/40 font-mono"
                required
              />

              {showPasswordRequirements && formData.password !== '' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/40 border border-border/30 rounded-lg p-4 space-y-2"
                >
                  <p className="text-xs text-muted-foreground mb-2">Password Requirements:</p>
                  {requirements.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      {passwordValidation[key]
                        ? <Check size={14} className="text-accent" />
                        : <X size={14} className="text-red-500" />}
                      <span className={passwordValidation[key] ? 'text-accent' : 'text-muted-foreground'}>
                        {label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm text-muted font-medium font-mono">Re-enter Password*</label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`!bg-secondary-foreground border-2 border-border h-14 px-5 rounded-xl mt-1 text-secondary placeholder:text-secondary/40 font-mono ${
                  formData.confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                }`}
                required
              />
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={!isFormValid}
                className={`w-60 py-6 text-lg rounded-full font-serif transition-all ${
                  isFormValid
                    ? 'bg-accent text-background hover:bg-accent/90 cursor-pointer'
                    : 'bg-accent text-background cursor-not-allowed'
                }`}
              >
                Sign Up
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or login with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-4">
            {[{ icon: '👍', label: 'Facebook' }, { icon: 'G', label: 'Google' }, { icon: '🍎', label: 'Apple' }].map((social) => (
              <Button key={social.label} variant="outline" className="border-border/50 text-foreground hover:bg-secondary">
                {social.icon}
              </Button>
            ))}
          </div>

          {/* Login link */}
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button
              variant="link"
              onClick={() => onNavigate('login')}
              className="text-accent hover:text-accent/80 p-0 h-auto"
            >
              Login
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}