// TransactionsTable.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Tooltip, message, Modal } from 'antd';
import { EyeOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { saveAs } from "file-saver";
import Papa from "papaparse";

const TransactionsTable = ({ transactions, certificateHash }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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
  
  // Función para copiar al portapapeles y mostrar un mensaje
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Copiado al portapapeles");
  };

  // Función para descargar los detalles de la transacción en formato JSON
  const downloadTransactionDetails = (transaction) => {
    const transactionData = {
      "Hash de Transacción": transaction.transactionHash,
      Método: transaction.metodo,
      Bloque: transaction.blockNumber,
      // Edad: transaction.relativeTime,
      De: transaction.from,
      Para: transaction.to,
      Item: `#${transaction.item}`,
      "Fecha y Hora": transaction.formattedTimestamp,
    };

    if (certificateHash) {
      transactionData["Certificado Hash"] = certificateHash;
    }

    const blob = new Blob([JSON.stringify(transactionData, null, 2)], { type: "application/json" });
    saveAs(blob, `Detalles_Transaccion_${transaction.transactionHash}.json`);
  };

  // Función para descargar el historial de transacciones como CSV
  const downloadCSV = () => {
    const csvData = transactions.map((tx) => ({
      "Hash de Transacción": tx.transactionHash,
      Método: tx.metodo,
      "Bloque": tx.blockNumber,
      "Fecha y Hora": tx.formattedTimestamp,
      De: tx.from,
      Para: tx.to,
      Item: `#${tx.item}`,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Historial_Transacciones.csv`);
  };

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
              href={`https://cardona-zkevm.polygonscan.com/tx/${text}`}
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
          href={`https://cardona-zkevm.polygonscan.com/block/${text}`}
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
      render: (text, record) => (
        <Tooltip title={record.formattedTimestamp}>
          <span style={{ fontSize: '14px' }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "De",
      dataIndex: "fromDisplay",
      key: "from",
      align: "left",
      render: (text, record) => (
        <Tooltip title={record.from}>
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
        <Tooltip title={record.to}>
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
      dataIndex: "item",
      key: "item",
      align: "center",
      render: (text) => <span style={{ fontSize: '14px' }}>#{text}</span>,
    },
  ];

  return (
    <div className="transaction-table-container">
      <div className="transaction-summary">
        <span>{`Se encontró un total de ${transactions.length} transacciones`}</span>
        <Tooltip title="Descargar Datos de Transacciones">
          <Button
            icon={<DownloadOutlined />}
            onClick={downloadCSV}
            style={{ marginLeft: 'auto', fontSize: '14px', color: '#1890ff' }}
          >
            Descargar Datos de Transacciones
          </Button>
        </Tooltip>
      </div>
      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="transactionHash"
        pagination={{ pageSize: 10 }}
        bordered={false}
        locale={{ emptyText: 'No se encontraron transacciones para este Activo Digital.' }}
        style={{ fontSize: '14px', borderRadius: '8px', overflow: 'hidden' }}
        rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
      />
      {/* Botón de descarga estilo "CSV Export" */}
      <div className="download-section">
        [ Descarga: <Button onClick={downloadCSV} type="link" style={{ color: '#1890ff' }}>
          <span style={{ textDecoration: 'underline', fontSize: '12px' }}>Exportar CSV</span>
        </Button> ]
      </div>
      {/* Modal de Detalles de la Transacción */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EyeOutlined style={{ color: "#1890ff", fontSize: "22px", marginRight: "8px" }} />
            <span style={{ fontSize: "20px", fontWeight: "600", color: "#333" }}>Detalles de la Transacción</span>
          </div>
        }
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
        className="transaction-details-modal"
        bodyStyle={{
          padding: "24px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        {selectedTransaction && (
          <div style={{ fontSize: "16px", color: "#555", lineHeight: "1.8" }}>
            <div style={{ display: "flex", marginBottom: "12px" }}>
              <span style={{ display: 'inline-block', marginRight: '5px' }}><strong>Hash de Transacción:</strong></span>
              <Tooltip title="Copiar al portapapeles">
                <span style={{ color: "#1890ff", cursor: "pointer" }} onClick={() => copyToClipboard(selectedTransaction.transactionHash)}>
                  {selectedTransaction.transactionHash.substring(0, 10)}...{selectedTransaction.transactionHash.slice(-10)} <CopyOutlined />
                </span>
              </Tooltip>
            </div>

            <p><strong>Método:</strong> <Button size="small" style={{ color: "#1890ff", borderColor: "#1890ff" }}>{selectedTransaction.metodo}</Button></p>
            <p><strong>Bloque:</strong> {selectedTransaction.blockNumber}</p>
            {/* <p><strong>Edad:</strong> {selectedTransaction.relativeTime}</p> */}
            <p><strong>De:</strong> {selectedTransaction.from}</p>
            <p><strong>Para:</strong> {selectedTransaction.to}</p>
            <p><strong>Item:</strong> #{selectedTransaction.item}</p>
            <p><strong>Fecha y Hora:</strong> {selectedTransaction.formattedTimestamp}</p>

            {certificateHash && (
              <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "#ffffff", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
                <p style={{ margin: "0", fontWeight: "500", color: "#1890ff" }}><strong>Certificado Hash:</strong></p>
                <Tooltip title="Copiar Certificado Hash">
                  <Button type="link" onClick={() => copyToClipboard(certificateHash)} style={{ padding: 0, fontSize: "15px", color: "#1890ff" }}>
                    {certificateHash.substring(0, 15)}...{certificateHash.slice(-15)} <CopyOutlined />
                  </Button>
                </Tooltip>
              </div>
            )}

            {/* Botón para descargar los detalles */}
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => downloadTransactionDetails(selectedTransaction)}
                style={{ fontWeight: "bold" }}
              >
                Descargar Detalles
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <style jsx global>{`
        .transaction-table-container {
          width: 90%;
          margin: 0 auto;
          margin-top: 2rem;
        }
        .certificate-section {
          margin-top: 20px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .verification-section {
          text-align: center;
          margin: 20px 0;
        }

        .transaction-history {
          width: 90%;
          margin: 0 auto;
          margin-top: 2rem;
        }

        .transaction-summary {
          display: flex;
          align-items: center;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .authenticity-checker {
          width: 90%;
          margin: 2rem auto;
          text-align: center;
        }

        .transaction-details-modal {
          top: 10px;
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
          .authenticity-checker {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionsTable;
