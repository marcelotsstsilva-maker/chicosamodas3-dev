import { pool } from "../bd.js";
import dayjs from "dayjs";

// 🟢 Resumo mensal (destaques do mês)
export const getResumoMensal = async (req, res) => {
  try {
    // 🔹 Mês atual (com hora)
    const inicioMes = dayjs().startOf("month").format("YYYY-MM-DD HH:mm:ss");
    const fimMes = dayjs().endOf("month").format("YYYY-MM-DD HH:mm:ss");

    // 🔹 Produto mais vendido (com nome)
    const [maisVendido] = await pool.query(
      `
      SELECT p.nome AS produto, SUM(vi.quantidade) AS totalVendido
      FROM venda_itens vi
      INNER JOIN venda v ON vi.idvenda = v.idvenda
      INNER JOIN variacao_produto vp ON vi.idvariacao = vp.idvariacao
      INNER JOIN produto p ON vp.idproduto = p.idproduto
      WHERE v.data_venda BETWEEN ? AND ?
      GROUP BY p.idproduto
      ORDER BY totalVendido DESC
      LIMIT 1
      `,
      [inicioMes, fimMes]
    );

    // 🔹 Produto mais lucrativo (com nome)
    const [maisLucrativo] = await pool.query(
      `
      SELECT p.nome AS produto, SUM(vi.subtotal) AS total
      FROM venda_itens vi
      INNER JOIN venda v ON vi.idvenda = v.idvenda
      INNER JOIN variacao_produto vp ON vi.idvariacao = vp.idvariacao
      INNER JOIN produto p ON vp.idproduto = p.idproduto
      WHERE v.data_venda BETWEEN ? AND ?
      GROUP BY p.idproduto
      ORDER BY total DESC
      LIMIT 1
      `,
      [inicioMes, fimMes]
    );

    // 🔹 Cliente que mais comprou
    const [clienteTop] = await pool.query(
      `
      SELECT c.nome AS cliente, SUM(v.total_bruto) AS totalGasto
      FROM venda v
      INNER JOIN cliente c ON v.idcliente = c.idcliente
      WHERE v.data_venda BETWEEN ? AND ?
      GROUP BY v.idcliente
      ORDER BY totalGasto DESC
      LIMIT 1
      `,
      [inicioMes, fimMes]
    );

    // 🔹 Fornecedor com maior volume de vendas
    const [fornecedorTop] = await pool.query(
      `
      SELECT f.nome AS fornecedor, SUM(vi.subtotal) AS totalVendido
      FROM venda_itens vi
      INNER JOIN venda v ON vi.idvenda = v.idvenda
      INNER JOIN variacao_produto vp ON vi.idvariacao = vp.idvariacao
      INNER JOIN produto p ON vp.idproduto = p.idproduto
      INNER JOIN fornecedor f ON p.idfornecedor = f.idfornecedor
      WHERE v.data_venda BETWEEN ? AND ?
      GROUP BY f.idfornecedor
      ORDER BY totalVendido DESC
      LIMIT 1
      `,
      [inicioMes, fimMes]
    );

    // 🔹 Resultado do mês (bruto e líquido)
    const [resultado] = await pool.query(
      `
      SELECT 
        SUM(v.total_bruto) AS resultadoBruto,
        SUM(v.lucro_liquido) AS resultadoLiquido
      FROM venda v
      WHERE v.data_venda BETWEEN ? AND ?
      `,
      [inicioMes, fimMes]
    );

    // 🔹 Retorno final
    res.json({
      produtoMaisVendido: maisVendido?.[0]?.produto || "—",
      produtoMaisLucrativo: maisLucrativo?.[0]?.produto || "—",
      clienteTop: clienteTop?.[0]?.cliente || "—",
      fornecedorTop: fornecedorTop?.[0]?.fornecedor || "—",
      resultadoBruto: resultado?.[0]?.resultadoBruto || 0,
      resultadoLiquido: resultado?.[0]?.resultadoLiquido || 0,
    });
  } catch (error) {
    console.error("❌ Erro ao gerar resumo mensal:", error);
    res.status(500).json({ erro: "Erro ao gerar resumo mensal." });
  }
};

// 🟡 Relatórios específicos
export const relatorioClientes = async (req, res) => {
  try {
    const { ano } = req.query;

    const inicioAno = `${ano}-01-01 00:00:00`;
    const fimAno = `${ano}-12-31 23:59:59`;

    // 🔹 Buscar os clientes com total gasto no ano
    const [clientes] = await pool.query(
      `
      SELECT 
        c.idcliente,
        c.nome,
        SUM(v.total_bruto) AS totalGasto
      FROM venda v
      INNER JOIN cliente c ON v.idcliente = c.idcliente
      WHERE v.data_venda BETWEEN ? AND ?
      GROUP BY c.idcliente
      ORDER BY totalGasto DESC
      `,
      [inicioAno, fimAno]
    );

    // Se não houver dados
    if (!clientes.length) {
      return res.json({
        top: [],
        bottom: [],
        totalValor: 0,
        ticketMedio: 0,
      });
    }

    // 🔹 Cálculos de resumo
    const totalValor = clientes.reduce((acc, c) => acc + Number(c.totalGasto || 0), 0);
    const ticketMedio = totalValor / clientes.length;

    // 🔹 Top 5 e Bottom 5 clientes
    const top = clientes.slice(0, 5);
    const bottom = clientes.slice(-5).reverse();

    res.json({
      top,
      bottom,
      totalValor,
      ticketMedio,
    });
  } catch (error) {
    console.error("❌ Erro ao gerar relatório de clientes:", error);
    res.status(500).json({ erro: "Erro ao gerar relatório de clientes." });
  }
};


export const relatorioProdutos = async (req, res) => {
  try {
    const { ano } = req.query;

    const inicioAno = `${ano}-01-01 00:00:00`;
    const fimAno = `${ano}-12-31 23:59:59`;

    // 🔹 Buscar produtos e total vendido no ano
    const [produtos] = await pool.query(
      `
      SELECT 
        p.idproduto,
        p.nome,
        SUM(vi.quantidade) AS quantidadeVendida,
        SUM(vi.subtotal) AS totalVendido
      FROM venda_itens vi
      INNER JOIN venda v ON vi.idvenda = v.idvenda
      INNER JOIN variacao_produto vp ON vi.idvariacao = vp.idvariacao
      INNER JOIN produto p ON vp.idproduto = p.idproduto
      WHERE v.data_venda BETWEEN ? AND ?
      GROUP BY p.idproduto
      ORDER BY totalVendido DESC
      `,
      [inicioAno, fimAno]
    );

    if (!produtos.length) {
      return res.json({
        top: [],
        bottom: [],
        totalValor: 0,
        ticketMedio: 0,
      });
    }

    // 🔹 Calcular resumo
    const totalValor = produtos.reduce((acc, p) => acc + Number(p.totalVendido || 0), 0);
    const ticketMedio = totalValor / produtos.length;

    // 🔹 Top 5 e Bottom 5 produtos
    const top = produtos.slice(0, 5);
    const bottom = produtos.slice(-5).reverse();

    res.json({
      top,
      bottom,
      totalValor,
      ticketMedio,
    });
  } catch (error) {
    console.error("❌ Erro ao gerar relatório de produtos:", error);
    res.status(500).json({ erro: "Erro ao gerar relatório de produtos." });
  }
};


// 📦 Relatório de Estoque Completo e Corrigido
export const relatorioEstoque = async (req, res) => {
  try {
    const ano = req.query.ano || new Date().getFullYear();
    const inicioAno = `${ano}-01-01 00:00:00`;
    const fimAno = `${ano}-12-31 23:59:59`;

    // 🔹 Produtos com estoque > 0 são considerados ativos
    const [[ativos]] = await pool.query(`
      SELECT COUNT(DISTINCT p.idproduto) AS total
      FROM produto p
      INNER JOIN variacao_produto vp ON p.idproduto = vp.idproduto
      WHERE vp.quantidade > 0
    `);

    // 🔹 Produtos com estoque = 0 são considerados inativos
    const [[inativos]] = await pool.query(`
      SELECT COUNT(DISTINCT p.idproduto) AS total
      FROM produto p
      INNER JOIN variacao_produto vp ON p.idproduto = vp.idproduto
      WHERE vp.quantidade = 0
    `);

    // 🔹 Quantidade total em estoque (somando todas as variações)
    const [[{ totalQtd }]] = await pool.query(`
      SELECT IFNULL(SUM(quantidade), 0) AS totalQtd FROM variacao_produto
    `);

    // 🔹 Itens com estoque exatamente = 1
    const [[{ umUnidade }]] = await pool.query(`
      SELECT COUNT(*) AS umUnidade FROM variacao_produto WHERE quantidade = 1
    `);

    // 🔹 Histórico de movimentações
    const [movimentacoes] = await pool.query(`
      SELECT 
        m.tipo, 
        m.quantidade, 
        m.motivo, 
        m.data_mov, 
        p.nome AS produto,
        vp.sku,
        vp.tamanho,
        vp.cor,
        vp.tecido
      FROM movimentacao_estoque m
      INNER JOIN variacao_produto vp ON m.idvariacao = vp.idvariacao
      INNER JOIN produto p ON vp.idproduto = p.idproduto
      WHERE m.data_mov BETWEEN ? AND ?
      ORDER BY m.data_mov DESC
    `, [inicioAno, fimAno]);

    // 🔹 Retorno final
    res.json({
      totalAtivos: ativos.total || 0,
      totalInativos: inativos.total || 0,
      qtdTotalEstoque: totalQtd || 0,
      itensZerados: umUnidade || 0, // agora é estoque = 1
      movimentacoes: movimentacoes.map(m => ({
        tipo: m.tipo,
        quantidade: m.quantidade,
        motivo: m.motivo || "-",
        data_mov: m.data_mov,
        produto: m.produto || "Produto desconhecido",
        variacao: {
          sku: m.sku || "-",
          tamanho: m.tamanho || "-",
          cor: m.cor || "-",
          tecido: m.tecido || "-"
        }
      })),
    });

  } catch (error) {
    console.error("❌ Erro no relatório de estoque:", error);
    res.status(500).json({ erro: "Erro ao gerar relatório de estoque." });
  }
};


export const relatorioFornecedores = async (req, res) => {
  try {
    const { ano } = req.query;

    const inicioAno = `${ano}-01-01 00:00:00`;
    const fimAno = `${ano}-12-31 23:59:59`;

    // 🔹 Buscar fornecedores e total vendido no ano
    const [fornecedores] = await pool.query(
      `
      SELECT 
        f.idfornecedor,
        f.nome,
        SUM(vi.subtotal) AS totalVendido
      FROM venda_itens vi
      INNER JOIN venda v ON vi.idvenda = v.idvenda
      INNER JOIN variacao_produto vp ON vi.idvariacao = vp.idvariacao
      INNER JOIN produto p ON vp.idproduto = p.idproduto
      INNER JOIN fornecedor f ON p.idfornecedor = f.idfornecedor
      WHERE v.data_venda BETWEEN ? AND ?
      GROUP BY f.idfornecedor
      ORDER BY totalVendido DESC
      `,
      [inicioAno, fimAno]
    );

    // Se não houver dados
    if (!fornecedores.length) {
      return res.json({
        top: [],
        bottom: [],
        totalValor: 0,
        ticketMedio: 0,
      });
    }

    // 🔹 Calcular resumo
    const totalValor = fornecedores.reduce(
      (acc, f) => acc + Number(f.totalVendido || 0),
      0
    );
    const ticketMedio = totalValor / fornecedores.length;

    // 🔹 Top 5 e Bottom 5 fornecedores
    const top = fornecedores.slice(0, 5);
    const bottom = fornecedores.slice(-5).reverse();

    res.json({
      top,
      bottom,
      totalValor,
      ticketMedio,
    });
  } catch (error) {
    console.error("❌ Erro ao gerar relatório de fornecedores:", error);
    res
      .status(500)
      .json({ erro: "Erro ao gerar relatório de fornecedores." });
  }
};

// 📅 Relatório por Ano (Lucro Bruto e Líquido por mês)
export const relatorioPorAno = async (req, res) => {
  try {
    const { ano } = req.query;
    if (!ano) return res.status(400).json({ erro: "Ano é obrigatório." });

    // 🔹 Busca por mês (tratando valores nulos com IFNULL)
    const [dados] = await pool.query(`
      SELECT 
        MONTH(v.data_venda) AS mes,
        SUM(IFNULL(v.total_bruto, 0)) AS lucroBruto,
        SUM(IFNULL(v.lucro_liquido, 0)) AS lucroLiquido
      FROM venda v
      WHERE YEAR(v.data_venda) = ?
      GROUP BY MONTH(v.data_venda)
      ORDER BY mes ASC
    `, [ano]);

    // 🔹 Garante todos os meses (mesmo os sem venda)
    const meses = Array.from({ length: 12 }, (_, i) => {
      const encontrado = dados.find(d => d.mes === i + 1);
      return {
        mes: i + 1,
        nome: [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ][i],
        lucroBruto: encontrado ? Number(encontrado.lucroBruto) : 0,
        lucroLiquido: encontrado ? Number(encontrado.lucroLiquido) : 0
      };
    });

    res.json({ ano, meses });
  } catch (error) {
    console.error("❌ Erro ao gerar relatório por ano:", error);
    res.status(500).json({ erro: "Erro ao gerar relatório por ano." });
  }
};


// 💰 Relatório de Fluxo de Caixa Anual
export const relatorioFluxoCaixa = async (req, res) => {
  const { ano } = req.query;
  const anoFiltro = ano || new Date().getFullYear();

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        MONTH(data_movimento) AS mes,
        SUM(CASE WHEN tipo='entrada' THEN valor ELSE 0 END) AS entradas,
        SUM(CASE WHEN tipo='saida' THEN valor ELSE 0 END) AS saidas,
        SUM(CASE WHEN tipo='entrada' THEN valor ELSE -valor END) AS saldo
      FROM caixa
      WHERE YEAR(data_movimento) = ?
      GROUP BY MONTH(data_movimento)
      ORDER BY mes
      `,
      [anoFiltro]
    );

    const nomesMeses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const meses = rows.map(r => ({
      nome: nomesMeses[r.mes - 1],
      entradas: Number(r.entradas) || 0,
      saidas: Number(r.saidas) || 0,
      saldo: Number(r.saldo) || 0,
    }));

    const totalEntradas = meses.reduce((acc, m) => acc + m.entradas, 0);
    const totalSaidas = meses.reduce((acc, m) => acc + m.saidas, 0);
    const saldoFinal = totalEntradas - totalSaidas;

    res.json({
      sucesso: true,
      ano: anoFiltro,
      totalEntradas,
      totalSaidas,
      saldoFinal,
      meses
    });

  } catch (error) {
    console.error("❌ Erro ao gerar fluxo de caixa anual:", error);
    res.status(500).json({ erro: "Erro ao gerar fluxo de caixa anual." });
  }
};
