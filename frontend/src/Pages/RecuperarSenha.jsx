import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    if (!email) {
      setError("Por favor, preencha o campo de email.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, insira um formato de email válido.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatusMessage({ text: "", type: "" });

    if (!validateForm()) {
      return;
    }

    setError("");
    // Simulando o sucesso do envio
    setStatusMessage({ text: "Se este email estiver cadastrado, enviaremos instruções de recuperação. Redirecionando...", type: "success" });
    
    setTimeout(() => {
      navigate("/login");
    }, 3500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-naf-light p-4">
      <h1
        className={`text-3xl font-bold text-center mb-6 text-naf-blue transition-all duration-700 ease-out delay-100
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
      >
        CALCULADORA DE IMPOSTO DE RENDA
      </h1>

      <div
        className={`w-full max-w-sm p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-naf-gray/30 transition-all duration-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <h2
          className={`text-2xl font-bold text-center mb-2 text-naf-blue transition-all duration-700 ease-out delay-200
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          Recuperar Senha
        </h2>

        <p
          className={`text-center text-sm text-gray-700 mb-6 transition-all duration-700 ease-out delay-300
            ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          Informe seu email e enviaremos as instruções para redefinir sua senha de acesso.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div
            className={`transition-all duration-700 ease-out delay-400
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-naf-blue">
              Email Cadastrado
            </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className="w-full px-4 py-2 border border-naf-gray rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-75 duration-300 ease-in-out hover:shadow-sm"
            />
            <div aria-live="polite" className="h-4">
              {error && <p className="mt-1 text-sm text-naf-red font-medium">{error}</p>}
            </div>
          </div>

          <div aria-live="assertive">
            {statusMessage.text && (
              <p className="text-sm text-center font-bold text-green-600 mb-2">
                {statusMessage.text}
              </p>
            )}
          </div>

          <div
            className={`transition-all duration-700 ease-out delay-500
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            <button
              type="submit"
              className="w-full bg-naf-blue text-white font-bold py-3 rounded-xl hover:bg-[#0c1825] focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 transition duration-300 ease-in-out hover:scale-105 shadow-md cursor-pointer"
            >
              Enviar Instruções
            </button>
          </div>
        </form>

        <p
          className={`text-center text-sm text-gray-700 mt-6 transition-all duration-700 ease-out delay-600
            ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          Lembrou sua senha?{" "}
          <Link to="/login" className="text-naf-red hover:underline font-bold focus:outline-none focus:ring-2 focus:ring-naf-red focus:ring-offset-2 rounded">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
