import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { Table, Tag, Button } from "antd";
import { NFTMarketplaceAddress } from "../Context/constants";
import { saveAs } from "file-saver";
import Papa from "papaparse";

// INTERNAL IMPORT
import NFTDetailsPage from "../NFTDetailsPage/NFTDetailsPage";

// IMPORT SMART CONTRACT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const NFTDetails = () => {
  const { checkIfWalletConnected, getNFTTransactionHistory } = useContext(NFTMarketplaceContext);

  const [nft, setNft] = useState({
    image: "",
    tokenId: "",
    name: "",
    owner: "",
    price: "",
    seller: "",
  });

  const [transactions, setTransactions] = useState([]);

  const router = useRouter();

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setNft(router.query);
  }, [router.isReady]);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (nft.tokenId) {
        try {
          const history = await getNFTTransactionHistory(nft.tokenId);
          const sortedHistory = history
            .sort((a, b) => b.blockNumber - a.blockNumber)
            .map((tx) => ({
              ...tx,
              from: tx.from?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.from,
              to: tx.to?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.to,
              action: determineAction(tx, NFTMarketplaceAddress),
              formattedTimestamp: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "N/A",
            }));

          setTransactions(sortedHistory);
        } catch (error) {
          console.error("Error al obtener el historial de transacciones:", error);
        }
      }
    };

    fetchTransactionHistory();
  }, [nft.tokenId, getNFTTransactionHistory, NFTMarketplaceAddress]);

  // Lógica para determinar la acción basada en la transacción
  const determineAction = (tx, NFTMarketplaceAddress) => {
    if (tx.from === "0x0000000000000000000000000000000000000000") {
      return "Creación";
    }
    if (tx.to?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase()) {
      return "Publicación";
    }
    if (tx.from?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase()) {
      return "Compra";
    }
    return "Transferencia";
  };

  // Función para descargar el historial de transacciones como CSV
  const downloadCSV = () => {
    const csvData = transactions.map((tx) => ({
      De: tx.from,
      Para: tx.to,
      "Fecha y Hora": tx.formattedTimestamp,
      "Hash de Transaccion": tx.transactionHash,
      "Bloque": tx.blockNumber,
      "Acción": tx.action,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `historial_transacciones_${nft.tokenId}.csv`);
  };

  // Definición de las columnas para la tabla de AntD
  const columns = [
    {
      title: "De",
      dataIndex: "from",
      key: "from",
      align: "left",
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>,
    },
    {
      title: "Para",
      dataIndex: "to",
      key: "to",
      align: "left",
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>,
    },
    {
      title: "Fecha y Hora",
      dataIndex: "formattedTimestamp",
      key: "timestamp",
      align: "center",
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>,
    },
    {
      title: "Hash de Transacción",
      dataIndex: "transactionHash",
      key: "transactionHash",
      align: "left",
      render: (text) => (
        <a
          href={`https://etherscan.io/tx/${text}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '14px', color: '#1890ff' }}
        >
          {text.substring(0, 20)}...
        </a>
      ),
    },
    {
      title: "Bloque",
      dataIndex: "blockNumber",
      key: "blockNumber",
      align: "center",
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>,
    },
    {
      title: "Acción",
      dataIndex: "action",
      key: "action",
      align: "center",
      render: (text) => {
        let color = "";
        switch (text) {
          case "Creación":
            color = "green";
            break;
          case "Publicación":
            color = "blue";
            break;
          case "Compra":
            color = "red";
            break;
          case "Transferencia":
            color = "yellow";
            break;
          default:
            color = "default";
        }
        return (
          <Tag color={color} style={{ padding: '2px 10px', fontSize: '12px' }}>
            {text}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="NFTDetailsPage">
      <NFTDetailsPage nft={nft} />
      <div className="transaction-history">
        <h2>Historial de Transacciones</h2>
        <Button onClick={downloadCSV} type="primary" style={{ marginBottom: '1rem' }}>
          Descargar CSV
        </Button>
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="transactionHash"
          pagination={{ pageSize: 10 }}
          bordered={false}
          locale={{ emptyText: "No se encontraron transacciones para este NFT." }}
          style={{ fontSize: '14px', borderRadius: '8px', overflow: 'hidden' }}
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        />
      </div>
      <style jsx global>{`
        .transaction-history {
          width: 90%;
          margin: 0 auto;
          margin-top: 2rem;
        }

        h2 {
          margin-bottom: 1rem;
          font-size: 24px;
          text-align: center;
        }

        .table-row-light {
          background-color: #f9f9f9;
        }

        .table-row-dark {
          background-color: #ffffff;
        }

        .ant-table-wrapper .ant-table-cell,
        .ant-table-wrapper .ant-table-thead > tr > th,
        .ant-table-wrapper .ant-table-tbody > tr > th,
        .ant-table-wrapper .ant-table-tbody > tr > td,
        .ant-table-wrapper tfoot > tr > th,
        .ant-table-wrapper tfoot > tr > td {
          padding: 4px !important;
        }

        .ant-table-thead > tr > th {
          background-color: transparent !important;
          font-weight: bold;
          text-align: center;
          border-bottom: 1px solid #e8e8e8;
        }

        .ant-table-cell {
          border-right: none !important;
        }

        .ant-table-row {
          transition: background 0.3s;
        }

        .ant-table-row:hover {
          background-color: #e6f7ff;
        }

        @media screen and (max-width: 50em) {
          .transaction-history {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default NFTDetails;
