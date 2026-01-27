import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { emailService } from '../services/email.service';

export const registrar = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      senha, 
      nome_empresa, 
      grupo_acesso_id, 
      cnpj, 
      telefone, 
      cidade, 
      estado, 
      nome_usuario,
      termos_aceitos 
    } = req.body;

    // Verificar se usuário já existe
    const usuarioExistente = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (cnpj) {
      const cnpjExistente = await query(
        'SELECT id FROM usuarios WHERE cnpj = $1',
        [cnpj]
      );

      if (cnpjExistente.rows.length > 0) {
        return res.status(400).json({ message: 'CNPJ já cadastrado' });
      }
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    // Inserir usuário
    const result = await query(
      `INSERT INTO usuarios (
        email, senha, nome_empresa, grupo_acesso_id, cnpj, telefone, 
        cidade, estado, nome_usuario, termos_aceitos, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id, email, nome_empresa, nome_usuario, status`,
      [
        email, 
        senhaHash, 
        nome_empresa, 
        grupo_acesso_id, 
        cnpj, 
        telefone, 
        cidade, 
        estado, 
        nome_usuario,
        termos_aceitos || false,
        'pendente'
      ]
    );

    const usuario = result.rows[0];

    // Enviar email de boas-vindas
    emailService.sendWelcomeEmail(usuario.email, usuario.nome_usuario || usuario.nome_empresa)
      .catch(err => console.error('Erro ao enviar email de boas-vindas:', err));

    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome_empresa: usuario.nome_empresa,
        nome_usuario: usuario.nome_usuario,
        status: usuario.status
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { usuarioLogin, senha } = req.body;

    let column = '';
    if (usuarioLogin.includes('@')) {
      column = 'email';
    } else {
      column = 'nome_usuario';
    }
    const result = await query(
      `SELECT * FROM usuarios WHERE ${column} = $1 AND (status = $2 OR status = $3)`,
      [usuarioLogin, 'ativo', 'pendente']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas ou usuário inativo' });
    }

    const usuario = result.rows[0];

    // console.log("usuario >> ", usuario)

    // Verificar senha
    const senhaValida = await comparePassword(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Remover senha do objeto de retorno
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      usuario: usuarioSemSenha
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getPerfil = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const usuarioId = authReq.usuario.id;

    const result = await query(
      `SELECT 
        u.id, u.email, u.nome_empresa, u.nome_usuario, u.cnpj, u.telefone,
        u.cidade, u.estado, u.termos_aceitos, u.plano_selecionado, u.status,
        u.criado_em, u.atualizado_em, g.nome as grupo_acesso, g.nivel 
      FROM usuarios u 
      LEFT JOIN grupo_acesso g ON u.grupo_acesso_id = g.id 
      WHERE u.id = $1`,
      [usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Remover senha do objeto de retorno
    const usuario = result.rows[0];
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({ usuario: usuarioSemSenha });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};