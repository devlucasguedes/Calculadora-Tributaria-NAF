const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (typeof authHeader !== 'string' || !authHeader) {
    return res.status(401).json({ error: "Token de acesso não fornecido." });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({ error: "Token malformatado." });
  }

  const token = parts[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }

  if (typeof decoded?.id !== 'string' || !decoded.id.trim()) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }

  // Um JWT pode continuar válido depois que a conta ou o banco forem recriados.
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true }
    });
  } catch (error) {
    console.error("Erro ao consultar usuário da sessão:", error);
    return res.status(503).json({ error: "Não foi possível validar a sessão. Tente novamente em instantes." });
  }

  if (!user) {
    return res.status(401).json({ error: "Sua sessão não é mais válida. Entre novamente para continuar." });
  }

  req.userId = user.id;
  return next();
};

module.exports = authMiddleware;
