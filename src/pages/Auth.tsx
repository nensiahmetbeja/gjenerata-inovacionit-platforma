import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Ju lutem vendosni një email të vlefshëm'),
  password: z.string().min(6, 'Fjalëkalimi duhet të ketë të paktën 6 karaktere'),
});

const signupSchema = z.object({
  email: z.string().email('Ju lutem vendosni një email të vlefshëm'),
  password: z.string().min(6, 'Fjalëkalimi duhet të ketë të paktën 6 karaktere'),
  emri: z.string().min(1, 'Emri është i detyrueshëm'),
  mbiemri: z.string().min(1, 'Mbiemri është i detyrueshëm'),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      emri: '',
      mbiemri: '',
    },
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast({
          variant: "destructive",
          title: "Gabim gjatë hyrjes",
          description: error.message === 'Invalid login credentials' 
            ? 'Email ose fjalëkalim i gabuar' 
            : error.message,
        });
      } else {
        toast({
          title: "Mirëseardhje!",
          description: "Keni hyrë me sukses",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi një gabim gjatë hyrjes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.emri, data.mbiemri);
      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            variant: "destructive",
            title: "Gabim gjatë regjistrimit",
            description: "Ky email është tashmë i regjistruar",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Gabim gjatë regjistrimit",
            description: error.message,
          });
        }
      } else {
        toast({
          title: "Regjistrimi u krye me sukses!",
          description: "Mund të hyni tani në aplikacion",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gabim",
        description: "Ndodhi një gabim gjatë regjistrimit",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isLogin ? 'Hyrje' : 'Regjistrohu'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Vendosni kredencialet tuaja për të hyrë' 
              : 'Krijoni një llogari të re'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="emaili@example.com"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Fjalëkalimi</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Vendosni fjalëkalimin"
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Po hyn...' : 'Hyr'}
              </Button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emri">Emri</Label>
                <Input
                  id="emri"
                  type="text"
                  placeholder="Vendosni emrin"
                  {...signupForm.register('emri')}
                />
                {signupForm.formState.errors.emri && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.emri.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mbiemri">Mbiemri</Label>
                <Input
                  id="mbiemri"
                  type="text"
                  placeholder="Vendosni mbiemrin"
                  {...signupForm.register('mbiemri')}
                />
                {signupForm.formState.errors.mbiemri && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.mbiemri.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="emaili@example.com"
                  {...signupForm.register('email')}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Fjalëkalimi</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Vendosni fjalëkalimin"
                  {...signupForm.register('password')}
                />
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Po regjistron...' : 'Regjistrohu'}
              </Button>
            </form>
          )}
          
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin 
                ? 'Nuk keni llogari? Regjistrohuni këtu' 
                : 'Keni llogari? Hyni këtu'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}