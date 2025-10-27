import { pool } from "../bd.js";

/* ============================================================
   ✅ CADASTRAR NOVO FIADO + PARCELAS
   - Agora o idvenda é OPCIONAL.
   - Cria o fiado mesmo sem uma venda associada.
============================================================ */
async function cadastrarFiado(req, res) {
  const {
    idcliente,
    idvenda,
    valor_total,
    quantidade_parcelas,
    observacao,
    parcelas, // array [{ valor_parcela, data_vencimento }]
  } = req.body;

  if (!idcliente || !valor_total || !quantidade_parcelas) {
    return res.status(400).json({
      sucesso: false,
      message: "Campos obrigatórios: cliente, valor e parcelas.",
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const idVendaFinal = idvenda && idvenda !== 0 ? idvenda : null;

    const [result] = await conn.query(
      `
      INSERT INTO fiado 
      (idcliente, idvenda, valor_total, quantidade_parcelas, status, observacao, data_compra)
      VALUES (?, ?, ?, ?, 'aberto', ?, NOW())
      `,
      [idcliente, idVendaFinal, valor_total, quantidade_parcelas, observacao || null]
    );

    const idfiado = result.insertId;

    // 🔹 Criação das parcelas (se enviadas)
    if (parcelas?.length) {
      const values = parcelas.map((p, i) => [
        idfiado,
        i + 1,
        p.valor_parcela,
        p.data_vencimento,
        null,
        "pendente",
      ]);

      await conn.query(
        `
        INSERT INTO fiado_parcelas
        (idfiado, numero_parcela, valor_parcela, data_vencimento, data_pagamento, status)
        VALUES ?
        `,
        [values]
      );
    }

    await conn.commit();
    res.status(201).json({
      sucesso: true,
      message: "✅ Fiado cadastrado com sucesso!",
      idfiado,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Erro ao cadastrar fiado:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao cadastrar fiado." });
  } finally {
    conn.release();
  }
}

/* ============================================================
   ✅ LISTAR FIADOS (por cliente, por venda ou todos)
============================================================ */
async function listarFiados(req, res) {
  const { cliente, venda } = req.query;

  let sql = `
    SELECT 
      f.*, 
      c.nome AS cliente_nome,
      COUNT(fp.idparcela) AS total_parcelas,
      SUM(CASE WHEN fp.status = 'pendente' THEN 1 ELSE 0 END) AS parcelas_pendentes
    FROM fiado f
    JOIN cliente c ON c.idcliente = f.idcliente
    LEFT JOIN fiado_parcelas fp ON fp.idfiado = f.idfiado
  `;
  const params = [];

  if (cliente) {
    sql += " WHERE f.idcliente = ?";
    params.push(cliente);
  } else if (venda) {
    sql += " WHERE f.idvenda = ?";
    params.push(venda);
  }

  sql += " GROUP BY f.idfiado ORDER BY f.data_compra DESC";

  try {
    const [rows] = await pool.query(sql, params);
    res.status(200).json({ sucesso: true, fiados: rows });
  } catch (err) {
    console.error("❌ Erro ao listar fiados:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao listar fiados." });
  }
}

/* ============================================================
   ✅ OBTER UM FIADO POR ID (com cliente, parcelas e produtos)
============================================================ */
async function obterFiado(req, res) {
  const { id } = req.params;

  try {
    // 🔹 Buscar dados básicos do fiado e cliente
    const [fiados] = await pool.query(
      `
      SELECT f.*, c.nome AS cliente_nome
      FROM fiado f
      JOIN cliente c ON c.idcliente = f.idcliente
      WHERE f.idfiado = ?
      `,
      [id]
    );

    if (!fiados.length) {
      return res.status(404).json({
        sucesso: false,
        message: "Fiado não encontrado.",
      });
    }

    const fiado = fiados[0];

    // 🔹 Buscar parcelas relacionadas
    const [parcelas] = await pool.query(
      `
      SELECT * 
      FROM fiado_parcelas 
      WHERE idfiado = ? 
      ORDER BY numero_parcela
      `,
      [id]
    );
    fiado.parcelas = parcelas;

    // 🔹 Buscar produtos/itens da venda (se houver)
    if (fiado.idvenda) {
      const [itens] = await pool.query(
        `
        SELECT 
          vi.iditem,
          vi.idvariacao,
          vp.idproduto,
          vi.quantidade,
          vi.preco_unitario,
          vp.sku,
          vp.tamanho,
          vp.cor,
          vp.tecido,
          p.nome AS nome_produto
        FROM venda_itens vi
        LEFT JOIN variacao_produto vp ON vi.idvariacao = vp.idvariacao
        LEFT JOIN produto p ON vp.idproduto = p.idproduto
        WHERE vi.idvenda = ?
        `,
        [fiado.idvenda]
      );

      fiado.itens = itens;

      // ✅ Inclui os campos principais no objeto fiado para o front carregar automaticamente
      if (itens.length > 0) {
        fiado.idvariacao = itens[0].idvariacao;
        fiado.idproduto = itens[0].idproduto || null;
      }
    }

    // ✅ Retorna fiado completo
    res.status(200).json({ sucesso: true, fiado });
  } catch (err) {
    console.error("❌ Erro ao buscar fiado:", err.sqlMessage || err);
    res
      .status(500)
      .json({ sucesso: false, message: "Erro ao buscar fiado." });
  }
}



/* ============================================================
   ✅ ATUALIZAR STATUS DO FIADO
============================================================ */
async function atualizarStatusFiado(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE fiado SET status = ? WHERE idfiado = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ sucesso: false, message: "Fiado não encontrado." });
    }

    res.status(200).json({
      sucesso: true,
      message: "✅ Status do fiado atualizado com sucesso!",
    });
  } catch (err) {
    console.error("❌ Erro ao atualizar status:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao atualizar status." });
  }
}

/* ============================================================
   ✅ DELETAR FIADO + PARCELAS + VENDA + RESTAURAR ESTOQUE
============================================================ */
async function deletarFiado(req, res) {
  const { id } = req.params; // id = idfiado

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 🔹 Buscar o idvenda do fiado
    const [fiadoRows] = await conn.query(
      "SELECT idvenda FROM fiado WHERE idfiado = ?",
      [id]
    );

    if (fiadoRows.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ sucesso: false, message: "Fiado não encontrado." });
    }

    const idvenda = fiadoRows[0].idvenda;

    // 🔹 Buscar os itens da venda
    const [itensVenda] = await conn.query(
      "SELECT idvariacao, quantidade FROM venda_itens WHERE idvenda = ?",
      [idvenda]
    );

    // 🔹 Restaurar o estoque de cada variação
    for (const item of itensVenda) {
      await conn.query(
        "UPDATE variacao_produto SET quantidade = quantidade + ? WHERE idvariacao = ?",
        [item.quantidade, item.idvariacao]
      );
    }

    // 🔹 Excluir parcelas
    await conn.query("DELETE FROM fiado_parcelas WHERE idfiado = ?", [id]);

    // 🔹 Excluir o fiado
    const [resultFiado] = await conn.query("DELETE FROM fiado WHERE idfiado = ?", [id]);

    if (resultFiado.affectedRows === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ sucesso: false, message: "Fiado não encontrado." });
    }

    // 🔹 Excluir entradas do caixa relacionadas à venda (parcelas pagas ou venda)
if (idvenda) {
  await conn.query("DELETE FROM caixa WHERE idvenda = ?", [idvenda]);
}

// 🔹 Excluir itens da venda
await conn.query("DELETE FROM venda_itens WHERE idvenda = ?", [idvenda]);

// 🔹 Excluir a venda principal
await conn.query("DELETE FROM venda WHERE idvenda = ?", [idvenda]);

await conn.commit();

res.status(200).json({
  sucesso: true,
  message:
    "✅ Fiado, parcelas, venda e entradas do caixa excluídos com sucesso! Estoque restaurado.",
});
  } catch (err) {
    await conn.rollback();
    console.error("❌ Erro ao deletar fiado:", err.sqlMessage || err);
    res.status(500).json({ sucesso: false, message: "Erro ao deletar fiado." });
  } finally {
    conn.release();
  }
}


/* ============================================================
   ✅ ATUALIZAR UMA PARCELA (status e data_pagamento)
   + GERA ENTRADA NO CAIXA AO PAGAR
   + Recalcula automaticamente o status geral do fiado
============================================================ */
async function atualizarParcela(req, res) {
  const { idparcela } = req.params;
  const { status, data_pagamento } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 🔹 Buscar dados da parcela e do fiado vinculado
    const [[parcelaInfo]] = await conn.query(
      `
      SELECT 
        fp.*, 
        f.idfiado, 
        f.idvenda, 
        f.idcliente,
        c.nome AS cliente_nome
      FROM fiado_parcelas fp
      INNER JOIN fiado f ON f.idfiado = fp.idfiado
      LEFT JOIN cliente c ON c.idcliente = f.idcliente
      WHERE fp.idparcela = ?
      `,
      [idparcela]
    );

    if (!parcelaInfo) {
      await conn.rollback();
      return res.status(404).json({
        sucesso: false,
        message: "Parcela não encontrada.",
      });
    }

    // 🔹 Atualiza status e data de pagamento
    await conn.query(
      `
      UPDATE fiado_parcelas
      SET status = ?, data_pagamento = ?
      WHERE idparcela = ?
      `,
      [status, data_pagamento || new Date(), idparcela]
    );

    // 🔹 Se for pagamento, registra a entrada no caixa
    if (status === "pago") {
      await conn.query(
        `
        INSERT INTO caixa (tipo, origem, descricao, valor, data_movimento, idvenda, observacao)
        VALUES ('entrada', 'venda', ?, ?, NOW(), ?, ?)
        `,
        [
          `Recebimento de parcela fiado #${parcelaInfo.idfiado}`,
          parcelaInfo.valor_parcela,
          parcelaInfo.idvenda || null,
          `Pagamento da parcela nº ${parcelaInfo.numero_parcela} do cliente ${parcelaInfo.cliente_nome || ""
          }`,
        ]
      );
    }

    // 🔹 Recalcular o status geral do fiado
    const [parcelas] = await conn.query(
      `
      SELECT status
      FROM fiado_parcelas
      WHERE idfiado = ?
      `,
      [parcelaInfo.idfiado]
    );

    if (parcelas.length > 0) {
      const total = parcelas.length;
      const pagas = parcelas.filter((p) => p.status === "pago").length;

      let novoStatus = "aberto";
      if (pagas === total) novoStatus = "pago";
      else if (pagas > 0) novoStatus = "parcial";

      await conn.query(
        "UPDATE fiado SET status = ? WHERE idfiado = ?",
        [novoStatus, parcelaInfo.idfiado]
      );
    }

    await conn.commit();

    res.status(200).json({
      sucesso: true,
      message:
        status === "pago"
          ? "✅ Parcela paga, entrada registrada no caixa e status do fiado atualizado!"
          : "✅ Parcela atualizada com sucesso!",
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Erro ao atualizar parcela:", err.sqlMessage || err);
    res.status(500).json({
      sucesso: false,
      message: "Erro ao atualizar parcela.",
    });
  } finally {
    conn.release();
  }
}


/* ============================================================
   ✅ ATUALIZAR FIADO (suporte a múltiplos produtos/variações)
   - Corrige casas decimais, NaN e valores em centavos
   - Atualiza corretamente os itens de venda e estoque
   - Mantém valor do produto e valor total carregados
============================================================ */
async function atualizarFiado(req, res) {
  const { id } = req.params;
  const {
    idcliente,
    valor_total,
    observacao,
    nova_qtd_parcelas,
    itens = [], // agora recebemos todos os itens
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("🔹 Atualizando fiado ID:", id);

    // ✅ Corrige e garante que todos os preços e quantidades são numéricos (sem zerar preços válidos)
    const itensCorrigidos = itens.map((item) => ({
      ...item,
      preco:
        item.preco !== undefined &&
        item.preco !== null &&
        item.preco !== "" &&
        !isNaN(parseFloat(item.preco))
          ? parseFloat(item.preco)
          : 0,
      quantidade: parseInt(item.quantidade) || 1,
    }));

    // ✅ Se o valor_total não vier do front, recalcula com base nos itens
    let valorTotalNum =
      valor_total && !isNaN(valor_total)
        ? parseFloat(valor_total)
        : itensCorrigidos.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

    if (valorTotalNum > 100000) valorTotalNum = valorTotalNum / 100;
    if (isNaN(valorTotalNum)) valorTotalNum = 0;
    valorTotalNum = parseFloat(valorTotalNum.toFixed(2));

    console.log("💰 Valor total calculado:", valorTotalNum);

    // 1️⃣ Atualiza dados principais do fiado
    const [result] = await conn.query(
      `UPDATE fiado 
       SET idcliente = ?, valor_total = ?, observacao = ?
       WHERE idfiado = ?`,
      [idcliente, valorTotalNum, observacao || null, id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ sucesso: false, message: "Fiado não encontrado." });
    }

    // 2️⃣ Verifica venda vinculada
    const [[vendaInfo]] = await conn.query(
      `SELECT idvenda FROM fiado WHERE idfiado = ?`,
      [id]
    );

    if (vendaInfo?.idvenda) {
      const idvenda = vendaInfo.idvenda;

      // 🔹 Buscar itens antigos da venda
      const [itensAntigos] = await conn.query(
        `SELECT idvariacao, quantidade FROM venda_itens WHERE idvenda = ?`,
        [idvenda]
      );

      // 🔹 Repor estoque dos itens antigos
      for (const antigo of itensAntigos) {
        await conn.query(
          `UPDATE variacao_produto SET quantidade = quantidade + ? WHERE idvariacao = ?`,
          [antigo.quantidade, antigo.idvariacao]
        );
      }

      // 🔹 Apaga itens antigos
      await conn.query(`DELETE FROM venda_itens WHERE idvenda = ?`, [idvenda]);

      // 🔹 Cria novos itens e atualiza estoque
      for (const item of itensCorrigidos) {
        const { idvariacao, quantidade, preco } = item;
        if (!idvariacao) continue;

        await conn.query(
          `INSERT INTO venda_itens (idvenda, idvariacao, quantidade, preco_unitario)
           VALUES (?, ?, ?, ?)`,
          [idvenda, idvariacao, quantidade, preco]
        );

        await conn.query(
          `UPDATE variacao_produto SET quantidade = quantidade - ? WHERE idvariacao = ?`,
          [quantidade, idvariacao]
        );
      }

      console.log(`🟢 ${itensCorrigidos.length} item(ns) atualizados na venda ${idvenda}.`);
    }

    // 3️⃣ Atualiza parcelas (mantém pagas e recria pendentes)
    const [parcelasAtuais] = await conn.query(
      `SELECT * FROM fiado_parcelas WHERE idfiado = ? ORDER BY numero_parcela`,
      [id]
    );

    const pagas = parcelasAtuais.filter((p) => p.status === "pago");
    const valorPago = pagas.reduce((acc, p) => acc + parseFloat(p.valor_parcela || 0), 0);
    let restante = parseFloat((valorTotalNum - valorPago).toFixed(2));
    if (restante < 0) restante = 0;

    // Remove parcelas pendentes antigas
    await conn.query(`DELETE FROM fiado_parcelas WHERE idfiado = ? AND status <> 'pago'`, [id]);

    // Cria novas parcelas pendentes
    const qtdNova = parseInt(nova_qtd_parcelas) || 1;
    const valorPorParcela = parseFloat((restante / qtdNova).toFixed(2));
    const parcelasNovas = [];
    const hoje = new Date();
    const ultimaPaga = pagas.length > 0 ? new Date(pagas[pagas.length - 1].data_vencimento) : hoje;

    for (let i = 1; i <= qtdNova; i++) {
      const venc = new Date(ultimaPaga);
      venc.setMonth(venc.getMonth() + i);
      parcelasNovas.push([
        id,
        pagas.length + i,
        valorPorParcela,
        venc.toISOString().slice(0, 10),
        null,
        "pendente",
      ]);
    }

    if (parcelasNovas.length > 0) {
      await conn.query(
        `INSERT INTO fiado_parcelas
         (idfiado, numero_parcela, valor_parcela, data_vencimento, data_pagamento, status)
         VALUES ?`,
        [parcelasNovas]
      );
    }

    // 4️⃣ Atualiza status geral
    const statusGeral = restante === 0 ? "pago" : pagas.length > 0 ? "parcial" : "aberto";
    await conn.query(`UPDATE fiado SET status = ? WHERE idfiado = ?`, [statusGeral, id]);

    await conn.commit();

    res.status(200).json({
      sucesso: true,
      message: "✅ Fiado, itens, variações, parcelas e estoque atualizados com sucesso!",
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Erro ao atualizar fiado:", err.sqlMessage || err);
    res.status(500).json({
      sucesso: false,
      message: "Erro ao atualizar fiado.",
    });
  } finally {
    conn.release();
  }
}


export default {
  cadastrarFiado,
  listarFiados,
  obterFiado,
  atualizarStatusFiado,
  deletarFiado,
  atualizarParcela,
 atualizarFiado, // ✅ adiciona aqui
};
