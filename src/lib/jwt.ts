import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '8h';
const JWT_ALGORITHM = 'HS256';

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres.');
  }
  return secret;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  canManageUsers?: boolean;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, jwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: JWT_ALGORITHM,
    issuer: 'museu-sao-jose',
    audience: 'museu-admin',
    jwtid: randomUUID(),
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, jwtSecret(), {
      algorithms: [JWT_ALGORITHM],
      issuer: 'museu-sao-jose',
      audience: 'museu-admin',
    }) as JWTPayload;

    // Verificações adicionais de segurança
    if (!decoded.userId || !decoded.email || !decoded.role) {
      console.error('Token inválido: campos obrigatórios ausentes');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
