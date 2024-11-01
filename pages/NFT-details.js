import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { Table, Button, Modal, Tooltip, message } from "antd";
import { EyeOutlined, CopyOutlined } from '@ant-design/icons';
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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
              fromDisplay: tx.from?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.from, // Visualización
              toDisplay: tx.to?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.to,       // Visualización
              metodo: determineMethod(tx, NFTMarketplaceAddress),
              formattedTimestamp: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "N/A",
              relativeTime: tx.timestamp ? formatTimeAgo(tx.timestamp) : "N/A"
            }));

          setTransactions(sortedHistory);
        } catch (error) {
          console.error("Error al obtener el historial de transacciones:", error);
        }
      }
    };

    fetchTransactionHistory();
  }, [nft.tokenId, getNFTTransactionHistory, NFTMarketplaceAddress]);

  // Función para calcular el tiempo transcurrido
  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    const intervals = [
      { label: 'año', seconds: 31536000 },
      { label: 'mes', seconds: 2592000 },
      { label: 'día', seconds: 86400 },
      { label: 'hora', seconds: 3600 },
      { label: 'minuto', seconds: 60 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `hace ${count} ${interval.label}${count > 1 ? 's' : ''}`;
      }
    }
    return "ahora";
  };

  // Lógica para determinar el método basado en la transacción
  const determineMethod = (tx, NFTMarketplaceAddress) => {
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
      "Hash de Transacción": tx.transactionHash,
      Método: tx.metodo,
      "Bloque": tx.blockNumber,
      "Fecha y Hora": tx.formattedTimestamp,
      De: tx.from, // Dirección real para el CSV
      Para: tx.to, // Dirección real para el CSV
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `historial_transacciones_${nft.tokenId}.csv`);
  };

  // Función para copiar al portapapeles y mostrar un mensaje
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Copiado al portapapeles");
  };

  // Abrir el modal con los detalles de la transacción
  const showTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  // Cerrar el modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTransaction(null);
  };

  // Columnas de la tabla con estilo similar al de la imagen
  const columns = [
    {
      title: <EyeOutlined />,
      dataIndex: "view",
      key: "view",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined style={{ fontSize: "16px", color: "#1890ff" }} />}
          onClick={() => showTransactionDetails(record)}
        />
      ),
    },
    {
      title: "Hash de Transacción",
      dataIndex: "transactionHash",
      key: "transactionHash",
      align: "left",
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <a
              href={`https://etherscan.io/tx/${text}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '14px', color: '#1890ff', marginRight: '8px' }}
            >
              {text.substring(0, 10)}...{text.slice(-10)}
            </a>
            <CopyOutlined onClick={() => copyToClipboard(text)} style={{ cursor: 'pointer', color: '#1890ff' }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Método",
      dataIndex: "metodo",
      key: "metodo",
      align: "center",
      render: (text) => <Button size="small" style={{ color: "#1890ff", border: "1px solid #1890ff" }}>{text}</Button>,
    },
    {
      title: "Bloque",
      dataIndex: "blockNumber",
      key: "blockNumber",
      align: "center",
      render: (text) => (
        <a
          href={`https://etherscan.io/block/${text}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '14px', color: '#1890ff' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Edad",
      dataIndex: "relativeTime",
      key: "relativeTime",
      align: "center",
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>,
    },
    {
      title: "De",
      dataIndex: "fromDisplay",
      key: "from",
      align: "left",
      render: (text, record) => (
        <Tooltip title={record.from}> {/* Mostrar dirección real en el tooltip */}
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#1890ff', marginRight: '8px' }}>
              {text.length > 15 ? `${text.substring(0, 10)}...${text.slice(-10)}` : text}
            </span>
            <CopyOutlined onClick={() => copyToClipboard(record.from)} style={{ cursor: 'pointer', color: '#1890ff' }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Para",
      dataIndex: "toDisplay",
      key: "to",
      align: "left",
      render: (text, record) => (
        <Tooltip title={record.to}> {/* Mostrar dirección real en el tooltip */}
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#1890ff', marginRight: '8px' }}>
              {text.length > 15 ? `${text.substring(0, 10)}...${text.slice(-10)}` : text}
            </span>
            <CopyOutlined onClick={() => copyToClipboard(record.to)} style={{ cursor: 'pointer', color: '#1890ff' }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Item",
      dataIndex: "tokenId",
      key: "item",
      align: "center",
      render: (text) => <span style={{ fontSize: '14px' }}>#{text}</span>,
    },
  ];

  return (
    <div className="NFTDetailsPage">
      <NFTDetailsPage nft={nft} />
      <div className="transaction-history">
        <h2>Historial de Transacciones</h2>
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

        {/* Botón de descarga estilo "CSV Export" */}
        <div className="download-section">
          [ Descarga: <Button onClick={downloadCSV} type="link" style={{ color: '#1890ff' }}>
            <span style={{ textDecoration: 'underline' }}>Exportar CSV</span>
          </Button> ]
        </div>

        {/* Modal de Detalles de la Transacción */}
        <Modal
          title="Detalles de la Transacción"
          visible={isModalVisible}
          onCancel={closeModal}
          footer={null}
        >
          {selectedTransaction && (
            <div>
              <p><strong>Hash de Transacción:</strong> {selectedTransaction.transactionHash}</p>
              <p><strong>Método:</strong> {selectedTransaction.metodo}</p>
              <p><strong>Bloque:</strong> {selectedTransaction.blockNumber}</p>
              <p><strong>Edad:</strong> {selectedTransaction.relativeTime}</p>
              <p><strong>De:</strong> {selectedTransaction.from}</p>
              <p><strong>Para:</strong> {selectedTransaction.to}</p>
              <p><strong>Item:</strong> #{selectedTransaction.tokenId}</p>
              <p><strong>Fecha y Hora:</strong> {selectedTransaction.formattedTimestamp}</p>
            </div>
          )}
        </Modal>
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

        .download-section {
          font-size: 12px;
          text-align: right;
          margin-top: 10px;
          padding-right: 0;
          padding-left: 0;
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
