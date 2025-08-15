import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function AuthPage() {
  const { t } = useLanguage();
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
    role: "secretary" as "admin" | "lawyer" | "secretary",
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center ml-3">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Lexora</h1>
                <p className="text-sm text-slate-500">
                  {t("auth.systemName")}{" "}
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList
              className="grid w-full grid-cols-2"
              data-testid="auth-tabs"
            >
              <TabsTrigger value="login" data-testid="tab-login">
                {t("auth.login")}{" "}
              </TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">
                {t("auth.register")}{" "}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle> {t("auth.login")} </CardTitle>
                  <CardDescription>
                    {t("auth.loginDescriptions")}{" "}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email"> {t("auth.email")} </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                        data-testid="input-email"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password"> {t("auth.password")} </Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                        data-testid="input-password"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          {t("auth.loggingIn")}
                        </>
                      ) : (
                        t("auth.login")
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle> {t("auth.register")} </CardTitle>
                  <CardDescription>
                    {t("auth.registerDescription")}{" "}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName"> {t("auth.fullName")} </Label>
                      <Input
                        id="fullName"
                        placeholder={t("auth.fullNamePlaceholder")}
                        value={registerData.fullName}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            fullName: e.target.value,
                          })
                        }
                        required
                        data-testid="input-fullname"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">{t("auth.username")} </Label>
                      <Input
                        id="username"
                        placeholder={t("auth.fullNamePlaceholder")}
                        value={registerData.username}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            username: e.target.value,
                          })
                        }
                        required
                        data-testid="input-username"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">
                        {" "}
                        {t("auth.email")}{" "}
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="ahmed@example.com"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                        required
                        data-testid="input-register-email"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">
                        {" "}
                        {t("auth.password")}{" "}
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        required
                        data-testid="input-register-password"
                        className="bg-white border border-gray-200 focus:border-primary-300 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role"> {t("auth.role")} </Label>
                      <Select
                        value={registerData.role}
                        onValueChange={(
                          value: "admin" | "lawyer" | "secretary"
                        ) => setRegisterData({ ...registerData, role: value })}
                        data-testid="select-role"
                      >
                        <SelectTrigger className="bg-white border border-gray-200 focus:border-primary-300 transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem
                            value="secretary"
                            className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                          >
                            {t("auth.secretary")}{" "}
                          </SelectItem>
                          <SelectItem
                            value="lawyer"
                            className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                          >
                            {t("auth.lawyer")}{" "}
                          </SelectItem>
                          <SelectItem
                            value="admin"
                            className="focus:bg-primary-50 focus:text-primary-700 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary-800"
                          >
                            {t("auth.admin")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          {t("auth.registering")}
                        </>
                      ) : (
                        t("auth.createAccount")
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="flex items-center justify-center w-full p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              {t("auth.welcomeHero")}{" "}
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              {t("auth.heroDescription")}{" "}
            </p>
            <div className="grid grid-cols-1 gap-4 text-right">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white rounded-full ml-3"></div>
                <span> {t("auth.feature1")} </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white rounded-full ml-3"></div>
                <span> {t("auth.feature2")}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white rounded-full ml-3"></div>
                <span> {t("auth.feature3")}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white rounded-full ml-3"></div>
                <span> {t("auth.feature4")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
