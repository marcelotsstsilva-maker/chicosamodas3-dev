import { pool } from "../bd.js";

// ✅ Registrar nova venda
async function cadastrarVenda(req, res) {
  const {
    idusuario,
    idcliente,
    itens,
    forma_pagamento,
    desconto,
    acrescimo,
    total_bruto,
    taxa_aplicada,
    lucro_liquido,
    parcelas,
    primeiro_vencimento,
  } = req.body;

  console.log("📦 Dados recebidos na venda:", req.body);

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      sucesso: false,
      message: "A venda deve conter pelo menos um item.",
    });
  }

  if (!forma_pagamento?.trim()) {
    return res.status(400).json({
      sucesso: false,
      message: "A forma de pagamento é obrigatória.",
    });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // 🟢 Garantir que valores são números válidos
    const totalBrutoFinal = parseFloat(total_bruto) || 0;
    const lucroLiquidoFinal = parseFloat(lucro_liquido) || 0;
    const taxaFinal = parseFloat(taxa_aplicada) || 0;
    const descontoFinal = parseFloat(desconto) || 0;
    const acrescimoFinal = parseFloat(acrescimo) || 0;

    // ✅ 1. Inserir venda principal
    const [resultVenda] = await conn.query(
      `INSERT INTO venda (
        idusuario,
        idcliente,
        forma_pagamento,
        taxa_aplicada,
        lucro_liquido,
        total_bruto,
        desconto,
        acrescimo,
        data_venda
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        idusuario || null,
        idcliente || null,
        forma_pagamento,
        taxaFinal,
        lucroLiquidoFinal,
        totalBrutoFinal,
        descontoFinal,
        acrescimoFinal,
      ]
    );

    const idvenda = resultVenda.insertId;

    // ✅ 2. Inserir itens e atualizar estoque
    let somaTotal = 0;

    for (const item of itens) {
      const { idvariacao, quantidade, preco_unitario } = item;

      if (!idvariacao || !quantidade || quantidade <= 0) {
        throw new Error("Item inválido: verifique os campos obrigatórios.");
      }

      const preco = parseFloat(preco_unitario) || 0;
      const qtd = parseFloat(quantidade);
      const subtotal = parseFloat((preco * qtd).toFixed(2));
      somaTotal += subtotal;

      await conn.query(
        `INSERT INTO venda_itens (idvenda, idvariacao, quantidade, preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [idvenda, idvariacao, qtd, preco, subtotal]
      );

      // ✅ Atualizar estoque
      await conn.query(
        `UPDATE variacao_produto
         SET quantidade = quantidade - ?
         WHERE idvariacao = ?`,
        [qtd, idvariacao]
      );

      // ✅ Registrar movimentação de estoque
      await conn.query(
        `INSERT INTO movimentacao_estoque (idvariacao, tipo, quantidade, motivo, data_mov)
         VALUES (?, 'saida', ?, ?, NOW())`,
        [idvariacao, qtd, `Venda ID ${idvenda}`]
      );
    }

    const totalFinal = totalBrutoFinal > 0 ? totalBrutoFinal : somaTotal;

    // ✅ 3. Caso seja FIADO → criar controle e parcelas
    if (forma_pagamento.toLowerCase() === "fiado") {
      if (!idcliente) {
        throw new Error("Cliente é obrigatório para vendas fiadas.");
      }

      const [resultFiado] = await conn.query(
        `INSERT INTO fiado (idcliente, idvenda, valor_total)
         VALUES (?, ?, ?)`,
        [idcliente, idvenda, totalFinal]
      );

      const idfiado = resultFiado.insertId;

      const numParcelas = parseInt(parcelas, 10);
      const totalParcelas =
        !isNaN(numParcelas) && numParcelas > 0 ? numParcelas : 1;

      let acumulado = 0;
      const valorBase = parseFloat((totalFinal / totalParcelas).toFixed(2));
      const primeiraData = primeiro_vencimento
        ? new Date(primeiro_vencimento)
        : new Date();

      for (let i = 1; i <= totalParcelas; i++) {
        let valorParcela = valorBase;
        if (i === totalParcelas) {
          valorParcela = parseFloat((totalFinal - acumulado).toFixed(2));
        }

        acumulado += valorParcela;

        const vencimento = new Date(primeiraData);
        vencimento.setMonth(vencimento.getMonth() + (i - 1));
        const dataMySQL = vencimento.toISOString().split("T")[0];

        await conn.query(
          `INSERT INTO fiado_parcelas 
            (idfiado, numero_parcela, valor_parcela, data_vencimento, status)
           VALUES (?, ?, ?, ?, 'pendente')`,
          [idfiado, i, valorParcela, dataMySQL]
        );
      }
    }

    // 🟢 4. Registrar ENTRADA no caixa automaticamente
    if (forma_pagamento.toLowerCase() !== "fiado") {
      await conn.query(
        `INSERT INTO caixa (tipo, origem, descricao, valor, data_movimento, idvenda)
         VALUES ('entrada', 'venda', ?, ?, NOW(), ?)`,
        [`Venda ID ${idvenda}`, totalFinal, idvenda]
      );
    }

    await conn.commit();

    res.status(201).json({
      sucesso: true,
      message: "✅ Venda registrada com sucesso!",
      idvenda,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Erro ao registrar venda:", err.sqlMessage || err);
    res.status(500).json({
      sucesso: false,
      message: err.message || "Erro ao registrar venda.",
    });
  } finally {
    conn.release();
  }
}



// ✅ Listar vendas
async function listarVendas(req, res) {
  const sql = `
    SELECT 
      v.idvenda,
      v.data_venda,
      v.forma_pagamento,
      v.total_bruto AS total,
      c.nome AS cliente
    FROM venda v
    LEFT JOIN cliente c ON v.idcliente = c.idcliente
    ORDER BY v.data_venda DESC
  `;

  try {
    const [results] = await pool.query(sql);
    res.status(200).json({ sucesso: true, vendas: results });
  } catch (err) {
    console.error("❌ Erro ao listar vendas:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao listar vendas." });
  }
}

// ✅ Listar vendas por ano (para tela "Minhas Vendas")
async function listarVendasPorAno(req, res) {
  const { ano } = req.params;

  const sql = `
    SELECT 
      v.idvenda,
      v.data_venda,
      MONTH(v.data_venda) AS mes,
      v.forma_pagamento,
      v.total_bruto AS total,
      c.nome AS cliente
    FROM venda v
    LEFT JOIN cliente c ON v.idcliente = c.idcliente
    WHERE YEAR(v.data_venda) = ?
    ORDER BY v.data_venda DESC
  `;

  try {
    const [results] = await pool.query(sql, [ano]);

    // 🧩 Agrupar vendas por mês
    const agrupado = {};
    results.forEach((v) => {
      const mes = v.mes;
      if (!agrupado[mes]) agrupado[mes] = [];
      agrupado[mes].push(v);
    });

    res.status(200).json({ sucesso: true, ano, vendasPorMes: agrupado });
  } catch (err) {
    console.error("❌ Erro ao listar vendas por ano:", err.sqlMessage || err);
    res.status(500).json({
      sucesso: false,
      message: "Erro ao listar vendas por ano.",
    });
  }
}

// ✅ Detalhar venda (com taxa_aplicada e cliente)
async function obterVenda(req, res) {
  const { id } = req.params;

  try {
    // 🟢 JOIN com cliente e seleção explícita de campos importantes
    const [vendas] = await pool.query(
      `SELECT 
         v.idvenda,
         v.idusuario,
         v.idcliente,
         c.nome AS cliente,
         v.forma_pagamento,
         v.taxa_aplicada,
         v.desconto,
         v.acrescimo,
         v.total_bruto,
         v.lucro_liquido,
         v.data_venda
       FROM venda v
       LEFT JOIN cliente c ON v.idcliente = c.idcliente
       WHERE v.idvenda = ?`,
      [id]
    );

    if (!vendas.length) {
      return res
        .status(404)
        .json({ sucesso: false, message: "Venda não encontrada." });
    }

    const venda = vendas[0]; // ✅ Agora inclui o nome do cliente e a taxa_aplicada

    // 🔹 Itens da venda (produtos e variações)
    const [itens] = await pool.query(
      `SELECT 
         vi.*, 
         vp.idproduto, 
         vp.tamanho, 
         p.nome AS produto_nome
       FROM venda_itens vi
       JOIN variacao_produto vp ON vi.idvariacao = vp.idvariacao
       JOIN produto p ON vp.idproduto = p.idproduto
       WHERE vi.idvenda = ?`,
      [id]
    );

    // 🔹 Retorno completo para o app
    res.status(200).json({ 
      sucesso: true, 
      venda, 
      itens 
    });

  } catch (err) {
    console.error("❌ Erro ao buscar venda:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao buscar venda." });
  }
}


// ✅ Excluir venda
async function deletarVenda(req, res) {
  const { id } = req.params;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const [itens] = await conn.query(
      `SELECT idvariacao, quantidade FROM venda_itens WHERE idvenda = ?`,
      [id]
    );

    for (const item of itens) {
      await conn.query(
        `UPDATE variacao_produto SET quantidade = quantidade + ? WHERE idvariacao = ?`,
        [item.quantidade, item.idvariacao]
      );
    }

    // Excluir registros associados
    await conn.query(
      "DELETE FROM fiado_parcelas WHERE idfiado IN (SELECT idfiado FROM fiado WHERE idvenda = ?)",
      [id]
    );
    await conn.query("DELETE FROM fiado WHERE idvenda = ?", [id]);
    await conn.query("DELETE FROM venda_itens WHERE idvenda = ?", [id]);

      // 🔹 Excluir entradas do caixa vinculadas à venda
      await conn.query("DELETE FROM caixa WHERE idvenda = ?", [id]);

    const [result] = await conn.query("DELETE FROM venda WHERE idvenda = ?", [
      id,
    ]);

    await conn.commit();

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ sucesso: false, message: "Venda não encontrada." });
    }

    res
      .status(200)
      .json({ sucesso: true, message: "✅ Venda excluída com sucesso!" });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Erro ao excluir venda:", err.sqlMessage || err);
    res
      .status(500)
      .json({ sucesso: false, message: "Erro ao excluir venda." });
  } finally {
    conn.release();
  }
}

export default {
  cadastrarVenda,
  listarVendas,
  listarVendasPorAno, // 👈 acrescido
  obterVenda,
  deletarVenda,
};
