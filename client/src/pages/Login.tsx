import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (err: any) {
      setError('root', { 
        message: 'Invalid email or password.' 
      });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white text-black border-r border-black">
        <div className="w-full max-w-md space-y-8">
          <div className="text-left">
            <Link to="/" className="text-3xl font-display italic mb-8 flex gap-4">
              <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 28.4356C16.5306 28.4357 13.3035 30.2166 11.4521 33.1512L9.1543 36.7934L10.0371 37.3511C10.3132 37.5101 10.5937 37.6622 10.8779 37.8082L13.1436 34.2188C14.6285 31.8648 17.2171 30.437 20 30.4369C22.783 30.4369 25.3714 31.8647 26.8564 34.2188L29.1211 37.8082C29.4053 37.6623 29.6858 37.5101 29.9619 37.3511L30.8457 36.7934L28.5479 33.1512C26.6964 30.2165 23.4695 28.4356 20 28.4356ZM20.123 36.4428L20 36.4379C19.3855 36.4381 18.8239 36.774 18.5312 37.3072L18.4766 37.4166L17.3691 39.834C18.0662 39.9256 18.7744 39.9821 19.4922 40L20 38.8914L20.5068 40C21.2249 39.9821 21.9335 39.9256 22.6309 39.834L21.5244 37.4166L21.4697 37.3072C21.1966 36.8096 20.689 36.4842 20.123 36.4428ZM21 12.4063V0H19V12.4063L15.7891 0.422921L13.8574 0.940585L17.0674 12.923L10.8662 2.18005L9.13379 3.18021L15.335 13.9222L6.56543 5.15124L5.15039 6.56651L13.9199 15.3375L3.17969 9.13529L2.17969 10.868L12.9209 17.0702L0.94043 13.8597L0.422852 15.7917L12.4053 19.0031H0V21.0035H12.4053L0.422852 24.2149L0.94043 26.1469L12.9209 22.9354L2.17969 29.1386L3.17969 30.8713L13.9199 24.6681L5.15039 33.4401L6.56543 34.8554L13.1216 28.2964C13.684 27.7337 14 26.9706 14 26.175V20.435C14 17.1209 16.6865 14.4342 20 14.434C23.3137 14.434 26 17.1208 26 20.435V26.1759C26 26.9716 26.316 27.7347 26.8785 28.2974L33.4346 34.8554L34.8496 33.4401L26.0801 24.6691L36.8203 30.8713L37.8203 29.1386L27.0791 22.9354L39.0596 26.1469L39.5771 24.2149L27.5957 21.0035H40V19.0031H27.5947L39.5771 15.7917L39.0596 13.8597L27.0791 17.0692L37.8203 10.868L36.8203 9.13529L26.0781 15.3375L34.8496 6.56554L33.4355 5.15124L24.6641 13.9232L30.8662 3.18021L29.1338 2.18005L22.9316 12.923L26.1426 0.940585L24.2109 0.422921L21 12.4063ZM20 32.4372C18.0122 32.4374 16.1792 33.5112 15.207 35.2453L13.2021 38.8201C13.8407 39.051 14.4942 39.2501 15.1611 39.4159L16.9512 36.224C17.5694 35.1209 18.7357 34.4377 20 34.4376C21.2645 34.4376 22.4305 35.1208 23.0488 36.224L24.8379 39.4159C25.5048 39.2502 26.1583 39.0509 26.7969 38.8201L24.793 35.2453C23.8208 33.5111 21.9879 32.4372 20 32.4372Z" fill="#F97316"></path>
             </svg>
            <span> AcadSync</span>
            </Link>
            <h2 className="text-5xl font-display mb-4">Welcome Back</h2>
            <p className="text-neutral-600 text-lg font-light">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              className="rounded-none border-black focus:ring-0 focus:border-black text-lg py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
              className="rounded-none border-black focus:ring-0 focus:border-black text-lg py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-black focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />

            {errors.root && (
              <div className="p-4 bg-red-50 text-red-600 border border-red-200">
                {errors.root.message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 bg-black text-white text-xl hover:bg-neutral-800 rounded-none font-bold tracking-wide transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" 
              isLoading={isSubmitting}
            >
              Sign In
            </Button>

            <div className="text-center pt-4">
              <span className="text-neutral-600">Don't have an account? </span>
              <Link to="/register" className="text-black font-bold hover:underline">
                Create one
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden md:flex flex-col justify-between bg-black text-white p-12">
        <div className="text-right">
             <div className="text-xl font-body">Est. 2024</div>
        </div>
        <div>
            <h1 className="text-7xl font-display leading-tight italic text-neutral-600">
                Simplicity<br/>is the ultimate<br/>sophistication.
            </h1>
        </div>
        <div className="text-right">
            <div className="text-sm font-body opacity-60">
                SECURE • FAST • RELIABLE
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
