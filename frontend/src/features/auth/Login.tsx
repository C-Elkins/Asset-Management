import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Package, Shield } from 'lucide-react';
import { Button, Card, Input } from '../../shared/components/ui';
import { useAuthStore } from '../../app/store';
import { LoginForm } from '../../shared/types';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

interface LoginProps {
  onLogin?: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      onLogin?.(data);
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Package size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your IT Asset Manager</p>
        </motion.div>

        {/* Login Form */}
        <Card variant="elevated" className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div>
              <Input
                {...register('username')}
                label="Username"
                type="text"
                placeholder="Enter your username"
                error={errors.username?.message}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <Input
                {...register('password')}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                disabled={isLoading}
                autoComplete="current-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="p-4 bg-error-50 border border-error-200 rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <p className="text-sm text-error-700 flex items-center gap-2">
                  <Shield size={16} />
                  {error}
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading || isSubmitting}
              icon={<LogIn size={20} />}
              className="w-full"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Manager:</strong> manager / manager123</p>
              <p><strong>User:</strong> user / user123</p>
            </div>
          </motion.div>
        </Card>

        {/* Footer */}
        <motion.p
          className="text-center text-sm text-gray-600 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          © 2025 IT Asset Manager. Built for enterprise-grade asset management.
        </motion.p>
      </motion.div>
    </div>
  );
};

export { Login };
