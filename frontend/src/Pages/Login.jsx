import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Por favor, preencha o campo de email.";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Por favor, informe um email válido (contendo '@' e '.').";
    }
    if (!password) newErrors.password = "Por favor, preencha o campo de senha.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});

    try {
      const response = await api.post('/auth/login', { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/Home");
    } catch (error) {
      const mensagemErro = error.response?.data?.error || "Erro ao conectar ao servidor. Verifique suas credenciais.";
      setApiError(mensagemErro);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-naf-light p-4">
      <h1
        className={`text-3xl font-bold text-center mb-6 text-naf-blue transition-all duration-700 ease-out delay-200
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
      >
        CALCULADORA DE IMPOSTO DE RENDA
      </h1>

      <div
        className={`w-full max-w-sm p-6 sm:p-8 bg-white rounded-2xl shadow-xl transition-all duration-700 ease-out delay-300 border border-naf-gray/30
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <h2
          className={`text-2xl font-bold text-center mb-6 text-naf-blue transition-all duration-700 ease-out delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div
            className={`transition-all duration-700 ease-out delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-naf-blue">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  const val = e.target.value;
                  if (val && val.includes("@") && val.includes(".")) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }
              }}
              className="w-full px-4 py-2 border border-naf-gray rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-75 duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md"
            />
            <div aria-live="polite">
              <p className="mt-1 text-sm text-naf-red font-medium">
                {errors.email || ""}
              </p>
            </div>
          </div>

          <div
            className={`transition-all duration-700 ease-out delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-naf-blue">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-naf-gray rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-75 duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md"
            />
            <div aria-live="polite">
              <p className="mt-1 text-sm text-naf-red font-medium">
                {errors.password || ""}
              </p>
            </div>
          </div>

          {/* Mensagem de Erro da API anunciada pelo leitor de tela */}
          <div aria-live="assertive">
            {apiError && (
              <p className="text-sm text-center text-naf-red font-bold mt-2 mb-2">
                {apiError}
              </p>
            )}
          </div>

          <div
            className={`transition-all duration-700 ease-out delay-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <button
              type="submit"
              className="w-full bg-naf-red text-white font-bold py-3 rounded-xl hover:bg-[#a62b18] focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition delay-75 duration-300 ease-in-out hover:scale-105 shadow-md"
            >
              Entrar
            </button>
          </div>
        </form>

        <p
          className={`text-center text-sm text-gray-700 mt-6 transition-all duration-700 ease-out delay-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Não tem conta?{" "}
          <Link to="/Cadastro" className="text-naf-red hover:underline font-bold focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 rounded">
            Cadastre-se
          </Link>
        </p>

        <p
          className={`text-center text-sm text-gray-700 mt-2 transition-all duration-700 ease-out delay-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Esqueceu a senha?{" "}
          <Link to="/RecuperarSenha" className="text-naf-red hover:underline font-bold focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 rounded">
            Recuperar Senha
          </Link>
        </p>
      </div>
    </div>
  );
}
